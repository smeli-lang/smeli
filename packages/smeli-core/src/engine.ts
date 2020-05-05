import { Statement } from "./ast";
import { ParserState, parseStatementList, ParserReport } from "./parser";
import { Scope, ScopeType } from "./scope";
import { builtins } from "./builtins";
import { PluginDefinition, pushPlugin } from "./plugins";
import { CacheEntry } from "./cache";

export class Engine {
  globalScope: Scope;
  statements: Statement[];
  messages: ParserReport[];

  nextStatement: number = 0;

  sideEffects: Map<string, string[]> = new Map();

  constructor(code: string, plugins: PluginDefinition[] = []) {
    this.globalScope = new Scope();

    // add builtins here
    this.globalScope.push(builtins);

    // plugins
    plugins.forEach((plugin) => {
      pushPlugin(this.globalScope, plugin);

      if (plugin.sideEffects) {
        this.sideEffects.set(plugin.name, plugin.sideEffects);
      }
    });

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

    return this.globalScope;
  }

  next() {
    while (this.nextStatement < this.statements.length) {
      this.step(1);
      if (
        this.nextStatement < this.statements.length &&
        this.statements[this.nextStatement].isMarker
      ) {
        break;
      }
    }
  }

  previous() {
    while (this.nextStatement > 0) {
      this.step(-1);
      if (this.statements[this.nextStatement].isMarker) {
        break;
      }
    }
  }

  update() {
    // evaluate only bindings with side effects,
    // everything else will be lazily evaluated
    // indirectly
    for (let [pluginName, bindingNames] of this.sideEffects) {
      const pluginScope = this.globalScope.evaluate(
        pluginName,
        ScopeType
      ) as Scope;
      for (let binding of bindingNames) {
        pluginScope.evaluate(binding);
      }
    }

    // dispose of all unreferenced cached values
    CacheEntry.gc();
  }
}
