import {
  Identifier,
  Literal,
  Statement,
  BindingDefinition,
  BinaryOperator,
  Expression,
  Comment,
  ScopeExpression,
  FunctionCall,
  LambdaExpression,
  ConditionalExpression,
} from "./ast";
import { BoolValue, NumberValue, StringValue } from "./types";
import {
  AddTrait,
  CmpLtTrait,
  SubTrait,
  MulTrait,
  DivTrait,
  CmpGtTrait,
  CmpLeTrait,
  CmpGeTrait,
  EquTrait,
  CmpNeTrait,
} from "./traits";

// grammar
// program ::= block EOF
// block ::= (statement?, LINE_END)*
// statement ::= comment | assignment
// comment ::= COMMENT_PREFIX TEXT_LINE
// assignment ::= identifier ":" expression
// identifier ::= NAME ("." NAME)*
// expression ::= ...

// terminals
const LINE_END = /(\r\n|\r|\n)/y;
const WHITESPACE = /[ \t]*/y;
const NUMBER = /-?(([0-9]*\.?[0-9]+)|(0b[01]+)|(0o[0-7]+)|(0x[0-9a-fA-F]+))\b/y;
const STRING = /"[^"]*"/y;
const BOOL = /(true|false)\b/y;
const NAME = /[_a-zA-Z&][_0-9a-zA-Z]*\b/y;
const COMMENT_PREFIX = /#{1,6}>?/y;
const TEXT_LINE = /[^\r\n]*/y;

export type ParserReport = {
  file: string;
  line: number;
  column: number;
  message: string;
};

export class ParserState {
  str: string;
  n: number;

  currentLine: number;
  currentLineStartIndex: number;

  fileName: string;
  messages: ParserReport[];

  constructor(
    inputString: string,
    startIndex: number = 0,
    fileName: string = ""
  ) {
    this.str = inputString;
    this.n = startIndex;

    this.currentLine = 0;
    this.currentLineStartIndex = startIndex;

    this.fileName = fileName;
    this.messages = [];
  }

  eof() {
    return this.n === this.str.length;
  }

  peek(lookahead: number = 1) {
    return this.str.substr(this.n, lookahead);
  }

  next() {
    if (this.eof()) {
      throw new Error("Cannot move past the end of input string");
    }

    this.n++;
  }

  match(pattern: string | RegExp) {
    if (typeof pattern === "string") {
      return this.matchExact(pattern);
    } else {
      return this.matchRegex(pattern);
    }
  }

  reportError(message: string) {
    // convert from 0-based to 1-based for output log
    const line = this.currentLine + 1;
    const column = this.n - this.currentLineStartIndex + 1;

    this.messages.push({
      file: this.fileName,
      line,
      column,
      message,
    });
  }

  private matchExact(pattern: string): string | null {
    if (this.str.length - this.n < pattern.length) {
      return null;
    }

    const slice = this.str.substr(this.n, pattern.length);
    if (slice === pattern) {
      this.n += pattern.length;
      return slice;
    }

    return null;
  }

  private matchRegex(pattern: RegExp) {
    const start = this.n;

    // setup parser to read from the current string location
    pattern.lastIndex = start;

    const found = pattern.test(this.str);
    if (found) {
      const end = pattern.lastIndex;

      // update the position only when found
      this.n = end;

      // return the matched substring
      return this.str.substring(start, end);
    }

    return null;
  }
}

export function parseWhitespace(state: ParserState) {
  state.match(WHITESPACE);
}

export function parseEndOfLine(state: ParserState) {
  const match = state.match(LINE_END);
  if (match) {
    // update state to next line
    state.currentLine++;
    state.currentLineStartIndex = state.n;
  }

  return match;
}

export function parseNumberLiteral(state: ParserState) {
  const stringValue = state.match(NUMBER);
  if (!stringValue) {
    return null;
  }

  // skip the minus sign before parsing with the Number constructor
  // (some cases don't work with a string as input, such as negative binary)
  const negative = stringValue[0] === "-";
  const value = Number(negative ? stringValue.substr(1) : stringValue);

  return new Literal(new NumberValue(negative ? -value : value));
}

export function parseStringLiteral(state: ParserState) {
  const stringValue = state.match(STRING);
  if (!stringValue) {
    return null;
  }

  // remove enclosing quotes
  const value = stringValue.substring(1, stringValue.length - 1);

  return new Literal(new StringValue(value));
}

export function parseBoolLiteral(state: ParserState) {
  const boolValue = state.match(BOOL);

  if (boolValue === "true") {
    return new Literal(new BoolValue(true));
  } else if (boolValue === "false") {
    return new Literal(new BoolValue(false));
  }

  return null;
}

export function parseConditional(state: ParserState) {
  if (!state.match("if")) {
    return null;
  }

  parseWhitespace(state);
  const conditionExpression = parseExpression(state);
  if (!conditionExpression) {
    state.reportError("Invalid expression");
    return null;
  }

  parseWhitespace(state);
  if (!state.match("then")) {
    state.reportError("Expected 'then' here");
    return null;
  }

  parseWhitespace(state);
  const trueCase = parseExpression(state);
  if (!trueCase) {
    state.reportError("Invalid expression");
    return null;
  }

  parseWhitespace(state);
  if (!state.match("else")) {
    state.reportError("Expected 'else' here");
    return null;
  }

  parseWhitespace(state);
  const falseCase = parseExpression(state);
  if (!falseCase) {
    state.reportError("Invalid expression");
    return null;
  }

  return new ConditionalExpression(conditionExpression, trueCase, falseCase);
}

export function parseIdentifier(state: ParserState) {
  const names: string[] = [];

  do {
    const name = state.match(NAME);
    if (!name) {
      return null;
    }
    names.push(name);
  } while (state.match("."));

  return new Identifier(names);
}

export function parseScopeExpression(
  state: ParserState,
  prefixExpression: Identifier | null
): ScopeExpression | null {
  if (!state.match("{")) {
    return null;
  }

  // parse inside the block
  const statements = parseStatementList(state);

  if (!state.match("}")) {
    state.reportError("Unterminated block, missing '}'");
    return null;
  }

  return new ScopeExpression(statements, prefixExpression);
}

export function parseLambdaExpression(
  state: ParserState,
  identifier: Identifier
): LambdaExpression | null {
  // argument list
  const argNames: Identifier[] = [identifier];
  while (state.match(",")) {
    parseWhitespace(state);

    const nextArgument = parseIdentifier(state);
    if (!nextArgument) {
      state.reportError("Expected identifier");
      return null;
    }
    argNames.push(nextArgument);

    parseWhitespace(state);
  }

  if (!state.match("=>")) {
    state.reportError("Invalid lambda expression, expected '=>' here");
    return null;
  }

  parseWhitespace(state);

  const body = parseExpression(state);
  if (!body) {
    state.reportError("Invalid lambda body, expected expression");
    return null;
  }

  return new LambdaExpression(argNames, body);
}

export function parseFunctionCall(state: ParserState, identifier: Identifier) {
  if (!state.match("(")) {
    return null;
  }

  const args: Expression[] = [];
  do {
    parseWhitespace(state);
    const arg = parseExpression(state);
    if (!arg) {
      state.reportError("Invalid expression");
      return null;
    }
    args.push(arg);

    parseWhitespace(state);
  } while (state.match(","));

  if (!state.match(")")) {
    state.reportError("Unterminated function call, missing ')'");
    return null;
  }

  return new FunctionCall(identifier, args);
}

export function parseAtom(state: ParserState) {
  const boolValue = parseBoolLiteral(state);
  if (boolValue) {
    return boolValue;
  }

  const conditional = parseConditional(state);
  if (conditional) {
    return conditional;
  }

  const identifier = parseIdentifier(state);
  if (identifier) {
    parseWhitespace(state);
    switch (state.peek()) {
      case "{":
        return parseScopeExpression(state, identifier);
      case "(":
        return parseFunctionCall(state, identifier);

      // disable lambdas with multiple arguments for now, because
      // of the grammar ambiguity with function calls
      // (all this will go away when tuples/arrays are implemented)
      //case ",":

      case "=": // first character of the arrow "=>"
        return state.peek(2) == "=>"
          ? parseLambdaExpression(state, identifier)
          : identifier;
      default:
        return identifier;
    }
  }

  // sub-expressions in parenthesis
  if (state.match("(")) {
    parseWhitespace(state);

    const subExpression = parseExpression(state);
    if (!subExpression) {
      state.reportError("Invalid nested expression");
      return null;
    }

    parseWhitespace(state);
    if (!state.match(")")) {
      state.reportError("Unterminated nested expression, missing ')'");
      return null;
    }

    return subExpression;
  }

  return (
    parseNumberLiteral(state) ||
    parseStringLiteral(state) ||
    parseScopeExpression(state, null)
  );
}

export function parseFactor(state: ParserState) {
  let expr: Expression | null = parseAtom(state);
  if (!expr) {
    return null;
  }
  parseWhitespace(state);
  while (
    state.peek() == "=" ||
    state.peek() == "<" ||
    state.peek() == ">" ||
    state.peek() == "!"
  ) {
    let operator = state.peek();
    state.next();

    if (state.peek() == "=") {
      operator += "=";
      state.next();
    }

    parseWhitespace(state);
    if (state.eof()) {
      state.reportError("Unexpected end of file");
      return null;
    }

    const atom = parseAtom(state);
    if (!atom) {
      return null;
    }

    if (operator == "=") {
      expr = new BinaryOperator(EquTrait, expr, atom);
    } else if (operator == "<") {
      expr = new BinaryOperator(CmpLtTrait, expr, atom);
    } else if (operator == ">") {
      expr = new BinaryOperator(CmpGtTrait, expr, atom);
    } else if (operator == "<=") {
      expr = new BinaryOperator(CmpLeTrait, expr, atom);
    } else if (operator == ">=") {
      expr = new BinaryOperator(CmpGeTrait, expr, atom);
    } else if (operator == "!=") {
      expr = new BinaryOperator(CmpNeTrait, expr, atom);
    }

    parseWhitespace(state);
  }

  return expr;
}

export function parseTerm(state: ParserState) {
  let expr: Expression | null = parseFactor(state);
  if (!expr) {
    return null;
  }
  parseWhitespace(state);
  while (state.peek() == "*" || state.peek() == "/") {
    const operator = state.peek();
    state.next();

    parseWhitespace(state);
    if (state.eof()) {
      state.reportError("Unexpected end of file");
      return null;
    }

    const factor = parseFactor(state);
    if (!factor) {
      return null;
    }

    if (operator == "*") {
      expr = new BinaryOperator(MulTrait, expr, factor);
    } else if (operator == "/") {
      expr = new BinaryOperator(DivTrait, expr, factor);
    }

    parseWhitespace(state);
  }

  return expr;
}

export function parseExpression(state: ParserState): Expression | null {
  let expr: Expression | null = parseTerm(state);
  if (!expr) {
    return null;
  }

  parseWhitespace(state);
  while (
    !state.eof() &&
    (state.str[state.n] == "+" || state.str[state.n] == "-")
  ) {
    const operator = state.str[state.n];
    state.n++;

    parseWhitespace(state);
    if (state.eof()) {
      state.reportError("Unexpected end of file");
      return null;
    }

    const term = parseTerm(state);
    if (!term) {
      return null;
    }

    if (operator == "+") {
      expr = new BinaryOperator(AddTrait, expr, term);
    } else if (operator == "-") {
      expr = new BinaryOperator(SubTrait, expr, term);
    }

    parseWhitespace(state);
  }

  return expr;
}

export function parseComment(state: ParserState) {
  const currentLine = state.currentLine;
  const startOffset = state.n;

  const prefix = state.match(COMMENT_PREFIX);
  if (!prefix) {
    state.reportError("Invalid comment prefix");
    return null;
  }
  const isMarker = prefix[prefix.length - 1] === ">";
  const headingLevel = isMarker ? prefix.length - 1 : prefix.length;

  const text = state.match(TEXT_LINE)?.trim() || "";

  const comment = new Comment(
    currentLine,
    startOffset,
    isMarker,
    headingLevel,
    text
  );
  return comment;
}

export function parseBindingDefinition(state: ParserState) {
  const currentLine = state.currentLine;
  const startOffset = state.n;

  const identifier = parseIdentifier(state);
  if (!identifier) {
    state.reportError("Invalid identifier");
    return null;
  }

  parseWhitespace(state);
  if (!state.match(":")) {
    state.reportError("Expected ':' here");
    return null;
  }

  parseWhitespace(state);
  if (state.eof()) {
    state.reportError("Unexpected end of file");
    return null;
  }

  const expression = parseExpression(state);
  if (!expression) {
    state.reportError("Invalid expression");
    return null;
  }

  const assignment = new BindingDefinition(
    currentLine,
    startOffset,
    identifier,
    expression
  );

  return assignment;
}

export function parseStatement(state: ParserState) {
  if (state.peek() == "#") {
    return parseComment(state);
  } else {
    return parseBindingDefinition(state);
  }
}

export function parseStatementList(state: ParserState): Statement[] {
  const statements: Statement[] = [];

  while (!state.eof()) {
    // skip over empty lines
    do {
      parseWhitespace(state);
    } while (parseEndOfLine(state));

    // exit at end of file or end of block
    if (state.eof() || state.peek() === "}") {
      break;
    }

    const statement = parseStatement(state);
    if (!statement) {
      break;
    }

    statements.push(statement);
  }

  return statements;
}
