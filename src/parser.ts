import {
  Identifier,
  NumberLiteral,
  Program,
  Statement,
  Assignment,
  OperatorAdd,
  Expression,
  OperatorSubtract,
  BlockDelimiter,
  ObjectExpression
} from "./ast";
import Scope from "./scope";

// terminals
const lineEnd = /(\r\n|\r|\n)/y;
const whitespace = /[ \t]*/y;
const number = /-?(([1-9]+[0-9]*)|([0-9]*\.[0-9]+)|(0b[01]+)|(0o[0-7]+)|(0x[0-9a-fA-F]+))\b/y;
const identifier = /[_a-zA-Z][_0-9a-zA-Z]*\b/y;
const textLine = /[^\r\n]*/y;

// grammar
// program ::= [statement?, lineEnd], EOF
// statement ::= assignment | blockDelimiter
// assignment ::= identifier, "=", expression
// blockDelimiter ::= "#", textLine
// expression ::= ...

export class ParserState {
  str: string;
  n: number;
  scopes: Scope[];

  currentLine: number;
  currentLineStartIndex: number;

  fileName: string;
  messages: string[];

  constructor(
    inputString: string,
    startIndex: number = 0,
    parentScope: Scope | null = null,
    fileName: string = ""
  ) {
    this.str = inputString;
    this.n = startIndex;
    this.scopes = [parentScope || new Scope()];

    this.currentLine = 0;
    this.currentLineStartIndex = startIndex;

    this.fileName = fileName;
    this.messages = [];
  }

  reportError(message: string) {
    // convert from 0-based to 1-based for output log
    const line = this.currentLine + 1;
    const column = this.n - this.currentLineStartIndex + 1;

    const text = `${this.fileName}:${line}:${column}: ${message}`;
    this.messages.push(text);
  }

  eof() {
    return this.n === this.str.length;
  }
}

export function parseRegex(state: ParserState, regex: RegExp) {
  // setup parser to read from the current string location
  regex.lastIndex = state.n;

  const found = regex.test(state.str);
  if (found) {
    // update the position only when found
    state.n = regex.lastIndex;
  }

  return found;
}

export function parseWhitespace(state: ParserState) {
  parseRegex(state, whitespace);
}

export function parseEndOfLine(state: ParserState) {
  const found = parseRegex(state, lineEnd);
  if (found) {
    // update state to next line
    state.currentLine++;
    state.currentLineStartIndex = state.n;
  }

  return found;
}

export function parseNumberLiteral(state: ParserState) {
  let start = state.n;
  if (!parseRegex(state, number)) {
    return null;
  }

  // skip the minus sign before parsing with the Number constructor
  // (some cases don't work with a string as input, such as negative binary)
  let negative = false;
  if (state.str[start] === "-") {
    negative = true;
    start++;
  }

  const stringValue = state.str.substring(start, state.n);
  const value = Number(stringValue);

  return new NumberLiteral(negative ? -value : value);
}

export function parseIdentifier(state: ParserState) {
  const start = state.n;
  if (!parseRegex(state, identifier)) {
    return null;
  }

  const scope = state.scopes[state.scopes.length - 1];
  const name = state.str.substring(start, state.n);
  return new Identifier(name, scope);
}

export function parseObject(state: ParserState) {
  if (state.str[state.n] !== "{") {
    return null;
  }
  state.n++;

  // create a child scope for this object expression
  const parentScope = state.scopes[state.scopes.length - 1];
  const scope = new Scope(parentScope);
  state.scopes.push(scope);

  // parse inside the block
  const program = parseProgram(state);

  // exit the scope
  state.scopes.pop();

  return new ObjectExpression(program, scope);
}

export function parseTerm(state: ParserState) {
  return parseNumberLiteral(state) || parseIdentifier(state) || parseObject(state);
}

export function parseExpression(state: ParserState) {
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
      expr = new OperatorAdd(expr, term);
    } else if (operator == "-") {
      expr = new OperatorSubtract(expr, term);
    }

    parseWhitespace(state);
  }

  return expr;
}

export function parseBlockDelimiter(state: ParserState) {
  const currentLine = state.currentLine;

  if (state.str[state.n] !== "#") {
    state.reportError("Block delimiters must start with a '#'");
    return null;
  }
  state.n++;

  const start = state.n;
  parseRegex(state, textLine);

  const text = state.str.substring(start, state.n).trim();
  const scope = state.scopes[state.scopes.length - 1];
  return new BlockDelimiter(currentLine, text, scope);
}

export function parseAssignment(state: ParserState) {
  const currentLine = state.currentLine;

  const identifier = parseIdentifier(state);
  if (!identifier) {
    state.reportError("Invalid identifier");
    return null;
  }

  parseWhitespace(state);
  if (state.eof() || state.str[state.n] !== "=") {
    state.reportError("Expected '=' here");
    return null;
  }
  state.n++;

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

  const scope = state.scopes[state.scopes.length - 1];
  return new Assignment(currentLine, identifier, expression, scope);
}

export function parseStatement(state: ParserState) {
  if (state.str[state.n] == "#") {
    return parseBlockDelimiter(state);
  } else {
    return parseAssignment(state);
  }
}

export function parseProgram(state: ParserState): Program {
  const statements: Statement[] = [];

  while (!state.eof()) {
    // skip over empty lines
    do {
      parseWhitespace(state);
    } while (parseEndOfLine(state));

    // exit at end of file or end of object expression
    if (state.eof() || state.str[state.n] === "}") {
      break;
    }

    const statement = parseStatement(state);
    if (!statement) {
      break;
    }

    statements.push(statement);
  }

  return new Program(statements);
}
