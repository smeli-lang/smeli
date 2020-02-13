import { Statement } from "./ast";
import { ParserState, parseStatementList } from "./parser";
import Scope from "./scope";

export default class Engine {
  globalScope: Scope;
  rootStatemeents: Statement[];

  allStatements: Statement[];
  nextStatement: number = 0;

  constructor(code: string) {
    this.globalScope = new Scope();
    // add builtins here

    const state = new ParserState(code, 0, this.globalScope, "smeli");
    this.rootStatemeents = parseStatementList(state);
    this.allStatements = state.allStatements;

    console.log(this.allStatements);
    state.messages.forEach(message => console.error(message));
  }

  step(count: number) {
    while (count > 0 && this.nextStatement < this.allStatements.length) {
      const statement = this.allStatements[this.nextStatement++];
      statement.bind();
      count--;
    }

    while (count < 0 && this.nextStatement > 0) {
      const statement = this.allStatements[--this.nextStatement];
      statement.unbind();
      count++;
    }

    return this.globalScope;
  }
}
