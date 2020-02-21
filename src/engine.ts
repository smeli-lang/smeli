import { Statement, Literal } from "./ast";
import { ParserState, parseStatementList, ParserReport } from "./parser";
import Scope from "./scope";
import { TypedValue, NumberType, FunctionType, FunctionValue } from "./types";
import { max } from "./builtins";

export default class Engine {
  globalScope: Scope;
  rootStatements: Statement[];
  messages: ParserReport[];

  allStatements: Statement[];
  nextStatement: number = 0;

  constructor(code: string, plugins: TypedValue[] = []) {
    this.globalScope = new Scope();

    // add builtins here
    this.globalScope.bind("number", new Literal(NumberType));
    this.globalScope.bind("closure", new Literal(FunctionType));
    this.globalScope.bind("max", new Literal(new FunctionValue(max)));

    const state = new ParserState(code, 0, this.globalScope, "smeli");
    this.rootStatements = parseStatementList(state);
    this.allStatements = state.allStatements;
    this.messages = state.messages;
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
