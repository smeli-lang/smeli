import { Binding, Scope } from "./scope";
import {
  BinaryOperator,
  BindingDefinition,
  Comment,
  Expression,
  FunctionCall,
  Identifier,
  LambdaExpression,
  Literal,
  ScopeExpression,
  Statement,
  traverse,
  Visitor,
} from "./ast";
import { Lambda, NativeFunction, StringValue, TypedValue } from "./types";
import { IndexTrait } from "./traits";
import { currentEvaluationContext, evaluate } from "./cache";

// Evaluators are plain js functions, but some of them
// can be augmented with metadata, such as a back link
// to the AST that this evaluator was compiled from.
//
// This allows higher-level features, like runtime
// transpilation of some expressions to other languages
// (LaTeX, GLSL, ...)
//
export interface Evaluator {
  (scope: Scope): TypedValue | Evaluator;

  smeliMeta?: EvaluatorMetadata;
}

export interface EvaluatorMetadata {
  sourceExpression: Expression;
}

export const annotate = (
  evaluator: Evaluator,
  metadata: EvaluatorMetadata
): Evaluator => {
  const previousMetadata = evaluator.smeliMeta || {};

  evaluator.smeliMeta = {
    ...previousMetadata,
    ...metadata,
  };

  return evaluator;
};

const expressionVisitor: Visitor<Evaluator> = new Map();

expressionVisitor.set(Literal, (literal: Literal) => {
  const value = literal.value;

  return annotate(() => value, {
    sourceExpression: literal,
  });
});

expressionVisitor.set(Identifier, (identifier: Identifier) => {
  let symbolName = identifier.name;
  let expressionOnly = false;

  if (identifier.name[0] === "&") {
    // return expression AST instead of the evaluated result
    symbolName = identifier.name.substr(1);
    expressionOnly = true;
  }

  return annotate(
    () => {
      let container: TypedValue = currentEvaluationContext();
      for (let i = 0; i < identifier.scopeNames.length; i++) {
        container = IndexTrait.call(container, identifier.scopeNames[i]);
      }

      if (expressionOnly) {
        return evaluate(symbolName, container.as(Scope), true);
      }

      return IndexTrait.call(container, identifier.nameValue);
    },
    {
      sourceExpression: identifier,
    }
  );
});

expressionVisitor.set(ScopeExpression, (scopeExpression: ScopeExpression) => {
  const statements = compileStatements(scopeExpression.statements);
  const prefixEvaluator = scopeExpression.prefixExpression
    ? compileExpression(scopeExpression.prefixExpression)
    : null;

  return annotate(
    () => {
      let prefixScope = null;
      if (prefixEvaluator) {
        prefixScope = evaluate(prefixEvaluator).as(Scope);
      }

      const parentScope = currentEvaluationContext().as(Scope);
      const scope = new Scope(parentScope, prefixScope);
      statements.forEach((statement) => scope.push(statement.binding));

      return scope;
    },
    {
      sourceExpression: scopeExpression,
    }
  );
});

expressionVisitor.set(LambdaExpression, (lambda: LambdaExpression) => {
  const bodyEvaluator = compileExpression(lambda.body);
  return annotate(
    () => {
      const argumentNames = lambda.args.map((id) => id.name);
      const parentScope = currentEvaluationContext().as(Scope);
      return new Lambda(parentScope, argumentNames, bodyEvaluator);
    },
    {
      sourceExpression: lambda,
    }
  );
});

expressionVisitor.set(FunctionCall, (functionCall: FunctionCall) => {
  const functionValueEvaluator = compileExpression(functionCall.identifier);
  const argumentEvaluators = functionCall.args.map(compileExpression);

  return annotate(
    () => {
      const functionValue = evaluate(functionValueEvaluator);

      if (!functionValue.is(Lambda) && !functionValue.is(NativeFunction)) {
        throw new Error(`${functionCall.identifier.name} is not a function`);
      }

      const resultEvaluator = functionValue.__call_site__(argumentEvaluators);

      // cache evaluation scope
      return resultEvaluator;
    },
    {
      sourceExpression: functionCall,
    }
  );
});

expressionVisitor.set(BinaryOperator, (operator: BinaryOperator) => {
  const lhsEvaluator = compileExpression(operator.lhs);
  const rhsEvaluator = compileExpression(operator.rhs);

  const trait = operator.trait;

  return annotate(
    () => {
      const lvalue = evaluate(lhsEvaluator);
      const rvalue = evaluate(rhsEvaluator);

      return trait.call(lvalue, rvalue);
    },
    {
      sourceExpression: operator,
    }
  );
});

export function compileExpression(expression: Expression): Evaluator {
  return traverse(expression, expressionVisitor);
}

export type CompiledStatement = {
  line: number;
  startOffset: number;
  isMarker: boolean;
  binding: Binding | Binding[];
};

const statementVisitor: Visitor<CompiledStatement> = new Map();

statementVisitor.set(
  BindingDefinition,
  (bindingDefinition: BindingDefinition) => {
    const evaluator = compileExpression(bindingDefinition.expression);

    return {
      line: bindingDefinition.line,
      startOffset: bindingDefinition.startOffset,
      isMarker: bindingDefinition.isMarker,
      binding: {
        name: bindingDefinition.identifier.name,
        evaluate: evaluator,
      },
    };
  }
);

statementVisitor.set(Comment, (comment: Comment) => {
  const cssClass = comment.headingLevel === 1 ? "important" : "normal";
  const html =
    comment.text !== ""
      ? `<h${comment.headingLevel} class=${cssClass}>${comment.text}</h${comment.headingLevel}>`
      : "";

  const evaluator = () => {
    if (comment.headingLevel === 1 && comment.text !== "") {
      return new StringValue(html);
    }

    const previous = evaluate("#outline").as(StringValue);
    return new StringValue(previous.value + html);
  };

  return {
    line: comment.line,
    startOffset: comment.startOffset,
    isMarker: comment.isMarker,
    binding: {
      name: "#outline",
      evaluate: evaluator,
    },
  };
});

function compileStatements(statements: Statement): CompiledStatement;
function compileStatements(statements: Statement[]): CompiledStatement[];
function compileStatements(statements: any): any {
  if (Array.isArray(statements)) {
    return statements.map(compileStatements);
  }

  return traverse(statements, statementVisitor);
}

export { compileStatements };
