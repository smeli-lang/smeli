import { Statement, Literal, ScopeExpression, Identifier } from "./ast";
import { ParserState, parseStatementList, ParserReport } from "./parser";
import { Scope } from "./scope";
import { builtins } from "./builtins";
import { PluginDefinition, pushPlugin } from "./plugins";

export class Engine {
  globalScope: Scope;
  rootStatements: Statement[];
  messages: ParserReport[];

  nextStatement: number = 0;

  constructor(code: string, plugins: PluginDefinition[] = []) {
    this.globalScope = new Scope();

    // add builtins here
    this.globalScope.push(builtins);

    // plugins
    plugins.forEach(plugin => pushPlugin(this.globalScope, plugin));

    const state = new ParserState(code, 0, "smeli");
    this.rootStatements = parseStatementList(state);
    this.messages = state.messages;
  }

  step(count: number) {
    while (count > 0 && this.nextStatement < this.rootStatements.length) {
      const statement = this.rootStatements[this.nextStatement++];
      this.globalScope.push(statement.binding);
      count--;
    }

    while (count < 0 && this.nextStatement > 0) {
      const statement = this.rootStatements[--this.nextStatement];
      this.globalScope.pop(statement.binding);
      count++;
    }

    return this.globalScope;
  }
}
