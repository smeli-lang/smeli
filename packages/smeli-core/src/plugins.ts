import { Scope, Binding } from "./scope";
import { ParserState, parseStatementList } from "./parser";
import { compileStatements } from "./evaluation";

export type PluginDefinition = {
  // name of the global plugin scope
  name: string;
  sideEffects?: string[];
  bindings?: Binding[];
  code?: string;
};

export function pushPlugin(parentScope: Scope, definition: PluginDefinition) {
  parentScope.push({
    name: definition.name,
    evaluate: (parentScope) => {
      const scope = new Scope(parentScope);

      if (definition.bindings) {
        scope.push(definition.bindings);
      }

      if (definition.code) {
        const parserState = new ParserState(definition.code);
        const statements = compileStatements(parseStatementList(parserState));
        statements.forEach((statement) => scope.push(statement.binding));
      }

      return scope;
    },
  });
}
