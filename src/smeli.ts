import { NumberLiteral } from "./ast";
import { parseNumberLiteral, ParserState } from "./parser";

export default class Smeli {
  program: NumberLiteral | null;

  constructor(code: string) {
    const state = new ParserState(code);
    this.program = parseNumberLiteral(state);
  }
}
