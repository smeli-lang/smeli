import { Program } from "./ast";
import { ParserState, parseProgram } from "./parser";
import Scope from "./scope";

export default class Engine {
  program: Program;
  nextStatement: number = 0;
  globalScope: Scope;

  constructor(code: string) {
    const state = new ParserState(code, 0, "smeli");
    this.program = parseProgram(state);
    this.globalScope = new Scope();
    console.log(code);
    state.messages.forEach(message => console.error(message));
  }

  step(count: number) {
    while (count > 0 && this.nextStatement < this.program.statements.length) {
      const statement = this.program.statements[this.nextStatement++];
      statement.bind(this.globalScope);
      count--;
    }

    while (count < 0 && this.nextStatement > 0) {
      const statement = this.program.statements[--this.nextStatement];
      statement.unbind(this.globalScope);
      count++;
    }

    return this.globalScope;
  }
}
