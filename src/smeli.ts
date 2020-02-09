import { NumberLiteral, Program } from "./ast";
import { parseNumberLiteral, ParserState, parseProgram } from "./parser";

export default class Smeli {
  program: Program | null;

  constructor(code: string) {
    const state = new ParserState(code, 0, "smeli");
    this.program = parseProgram(state);
    console.log(code);
    state.messages.forEach(message => console.error(message));
  }
}
