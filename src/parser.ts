import {
  Identifier,
  NumberLiteral,
  Statement,
  Assignment,
  OperatorAdd,
  Expression,
  OperatorSubtract,
  Comment,
  Block,
} from "./ast";
import Scope from "./scope";

// grammar
// program ::= block EOF
// block ::= (statement?, LINE_END)*
// statement ::= comment | assignment
// comment ::= COMMENT_PREFIX TEXT_LINE
// assignment ::= identifier "=" expression
// identifier ::= NAME ("." NAME)*
// expression ::= ...

// terminals
const LINE_END = /(\r\n|\r|\n)/y;
const WHITESPACE = /[ \t]*/y;
const NUMBER = /-?(([1-9]+[0-9]*)|([0-9]*\.[0-9]+)|(0b[01]+)|(0o[0-7]+)|(0x[0-9a-fA-F]+))\b/y;
const NAME = /[_a-zA-Z][_0-9a-zA-Z]*\b/y;
const COMMENT_PREFIX = /#>*/y;
const TEXT_LINE = /[^\r\n]*/y;

export type ParserReport = {
  file: string,
  line: number,
  column: number,
  message: string,
};

export class ParserState {
  str: string;
  n: number;
  scopes: Scope[];
  allStatements: Statement[];

  currentLine: number;
  currentLineStartIndex: number;

  fileName: string;
  messages: ParserReport[];

  constructor(
    inputString: string,
    startIndex: number = 0,
    parentScope: Scope | null = null,
    fileName: string = ""
  ) {
    this.str = inputString;
    this.n = startIndex;
    this.scopes = [parentScope || new Scope()];
    this.allStatements = [];

    this.currentLine = 0;
    this.currentLineStartIndex = startIndex;

    this.fileName = fileName;
    this.messages = [];
  }

  eof() {
    return this.n === this.str.length;
  }

  peek() {
    return this.eof() ? "" : this.str[this.n];
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

  appendStatement(statement: Statement) {
    this.allStatements.push(statement);
  }

  reportError(message: string) {
    // convert from 0-based to 1-based for output log
    const line = this.currentLine + 1;
    const column = this.n - this.currentLineStartIndex + 1;

    this.messages.push({
      file: this.fileName,
      line,
      column,
      message
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

  return new NumberLiteral(negative ? -value : value);
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

  const scope = state.scopes[state.scopes.length - 1];
  return new Identifier(names[0], scope);
}

export function parseBlock(state: ParserState): Block | null {
  if (!state.match("{")) {
    return null;
  }

  // create a child scope for this block
  const parentScope = state.scopes[state.scopes.length - 1];
  const scope = new Scope(parentScope);
  state.scopes.push(scope);

  // parse inside the block
  const statements = parseStatementList(state);

  // exit the scope
  state.scopes.pop();

  if (!state.match("}")) {
    state.reportError("Unterminated block, missing '}'");
    return null;
  }

  return new Block(statements, scope);
}

export function parseTerm(state: ParserState) {
  return parseNumberLiteral(state) || parseIdentifier(state) || parseBlock(state);
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

export function parseComment(state: ParserState) {
  const currentLine = state.currentLine;

  const prefix = state.match(COMMENT_PREFIX);
  if (!prefix) {
    state.reportError("Invalid comment prefix");
    return null;
  }
  const markerLevel = prefix.length - 1; // don't count the # in the marker level

  const text = state.match(TEXT_LINE) || "";

  const scope = state.scopes[state.scopes.length - 1];

  const comment = new Comment(currentLine, text, markerLevel, scope);
  state.appendStatement(comment);

  return comment;
}

export function parseAssignment(state: ParserState) {
  const currentLine = state.currentLine;

  const identifier = parseIdentifier(state);
  if (!identifier) {
    state.reportError("Invalid identifier");
    return null;
  }

  parseWhitespace(state);
  if (!state.match("=")) {
    state.reportError("Expected '=' here");
    return null;
  }

  parseWhitespace(state);
  if (state.eof()) {
    state.reportError("Unexpected end of file");
    return null;
  }

  const scope = state.scopes[state.scopes.length - 1];
  const assignment = new Assignment(currentLine, identifier, scope);

  // make sure the statement is registered before its child expression
  state.appendStatement(assignment);

  const expression = parseExpression(state);
  if (!expression) {
    state.reportError("Invalid expression");
    return null;
  }
  assignment.expression = expression;

  return assignment;
}

export function parseStatement(state: ParserState) {
  if (state.peek() == "#") {
    return parseComment(state);
  } else {
    return parseAssignment(state);
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
