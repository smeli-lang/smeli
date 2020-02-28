import { Statement, Literal } from "./ast";
import { ParserState, parseStatementList, ParserReport } from "./parser";
import { Scope } from "./scope";
import { TypedValue } from "./types";
import { Builtins } from "./builtins";

export class Engine {
  globalScope: Scope;
  rootStatements: Statement[];
  messages: ParserReport[];

  allStatements: Statement[];
  nextStatement: number = 0;

  constructor(code: string, plugins: TypedValue[] = []) {
    this.globalScope = new Scope();

    // add builtins here
    const builtins = new Builtins(this.globalScope);

    // plugins
    plugins.forEach(plugin => {
      const pluginName = plugin.type().__name__();
      this.globalScope.bind(pluginName, new Literal(plugin));
    });

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
