import { Program } from "./ast";
import { ParserState, parseProgram } from "./parser";
import Scope from "./scope";

export default class Engine {
  program: Program;
  nextStatement: number = 0;
  globalScope: Scope;

  constructor(code: string) {
    this.globalScope = new Scope();
    const state = new ParserState(code, 0, this.globalScope, "smeli");
    this.program = parseProgram(state);
    console.log(code);
    state.messages.forEach(message => console.error(message));
  }

  step(count: number) {
    while (count > 0 && this.nextStatement < this.program.statements.length) {
      const statement = this.program.statements[this.nextStatement++];
      statement.bind();
      count--;
    }

    while (count < 0 && this.nextStatement > 0) {
      const statement = this.program.statements[--this.nextStatement];
      statement.unbind();
      count++;
    }

    return this.globalScope;
  }
}
