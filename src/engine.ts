import { Program } from "./ast";
import { ParserState, parseProgram } from "./parser";

export default class Engine {
  program: Program | null;

  constructor(code: string) {
    const state = new ParserState(code, 0, "smeli");
    this.program = parseProgram(state);
    console.log(code);
    state.messages.forEach(message => console.error(message));
  }
}
