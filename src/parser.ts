import { NumberLiteral } from "./ast";
import { cpus } from "os";

export type ParsingState = {
  str: string;
  n: number;
};

export function skipWhitespace(state: ParsingState) {
  while (state.n < state.str.length && /[ \t\r\n]/.test(state.str[state.n])) {
    state.n++;
  }
}

export function parseNumberLiteral(state: ParsingState) {
  const start = state.n;
  while (
    state.n < state.str.length &&
    /[0123456789]/.test(state.str[state.n])
  ) {
    state.n++;
  }

  const value = Number(state.str.substring(start, state.n));
  return new NumberLiteral(value);
}
