import { Identifier, NumberLiteral } from "./ast";

// terminals
const lineEnd = /(\r\n|\r|\n)/y;
const whitespace = /[ \t]*/y;
const number = /-?(([1-9]+[0-9]*)|([0-9]*\.[0-9]+)|(0b[01]+)|(0o[0-7]+)|(0x[0-9a-fA-F]+))\b/y;
const identifier = /[_a-zA-Z][_0-9a-zA-Z]*\b/y;

export type ParsingState = {
  str: string;
  n: number;
};

export function parseRegex(state: ParsingState, regex: RegExp) {
  // setup parser to read from the current string location
  regex.lastIndex = state.n;

  const found = regex.test(state.str);
  if (found) {
    // update the position only when found
    state.n = regex.lastIndex;
  }

  return found;
}

export function parseWhitespace(state: ParsingState) {
  parseRegex(state, whitespace);
}

export function parseEndOfLine(state: ParsingState) {
  const found = parseRegex(state, lineEnd);
  if (found) {
    // update state to next line
  }

  return found;
}

export function parseNumberLiteral(state: ParsingState) {
  let start = state.n;
  if (!parseRegex(state, number)) {
    return null;
  }

  // skip the minus sign before parsing with the Number constructor
  // (some cases don't work with a string as input, such as negative binary)
  let negative = false;
  if (state.str[start] === '-') {
    negative = true;
    start++;
  }

  const stringValue = state.str.substring(start, state.n);
  const value = Number(stringValue);

  return new NumberLiteral(negative ? -value : value);
}

export function parseIdentifier(state: ParsingState) {
  let start = state.n;
  if (!parseRegex(state, identifier)) {
    return null;
  }

  const name = state.str.substring(start, state.n);
  return new Identifier(name);
}
