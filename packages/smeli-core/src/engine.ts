import { Statement } from "./ast";
import { ParserState, parseStatementList, ParserReport } from "./parser";
import { Scope } from "./scope";
import { builtins } from "./builtins";
import { PluginDefinition, pushPlugin } from "./plugins";

export class Engine {
  globalScope: Scope;
  statements: Statement[];
  messages: ParserReport[];

  nextStatement: number = 0;

  constructor(code: string, plugins: PluginDefinition[] = []) {
    this.globalScope = new Scope();

    // add builtins here
    this.globalScope.push(builtins);

    // plugins
    plugins.forEach(plugin => pushPlugin(this.globalScope, plugin));

    const state = new ParserState(code, 0, "smeli");
    this.statements = parseStatementList(state);
    this.messages = state.messages;
  }

  step(count: number) {
    while (count > 0 && this.nextStatement < this.statements.length) {
      const statement = this.statements[this.nextStatement++];
      this.globalScope.push(statement.binding);
      count--;
    }

    while (count < 0 && this.nextStatement > 0) {
      const statement = this.statements[--this.nextStatement];
      this.globalScope.pop(statement.binding);
      count++;
    }

    this.globalScope.clearCache();

    return this.globalScope;
  }

  update() {
    this.globalScope.clearCache();
    this.globalScope.populateCache();
  }
}
