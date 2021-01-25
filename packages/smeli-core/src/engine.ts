import { ParserState, parseStatementList, ParserReport } from "./parser";
import { Scope } from "./scope";
import { builtins } from "./builtins";
import { PluginDefinition, pushPlugin } from "./plugins";
import { evaluate, evaluateRoot } from "./cache";
import { NumberValue } from "./types";
import { ScopeOverride } from "./override";
import { CompiledStatement, compileStatements, Evaluator } from "./evaluation";

export class Engine {
  globalScope: Scope;
  statements: CompiledStatement[];
  messages: ParserReport[];

  nextStatement: number = 0;

  sideEffects: Map<string, string[]> = new Map();

  rootEvaluator: Evaluator;

  startTime: number | null = null;
  timeOverride: ScopeOverride;

  constructor(code: string, plugins: PluginDefinition[] = []) {
    this.globalScope = new Scope();

    // add builtins here
    this.globalScope.push(builtins);

    this.timeOverride = new ScopeOverride(this.globalScope, "time");

    // plugins
    plugins.forEach((plugin) => {
      pushPlugin(this.globalScope, plugin);

      if (plugin.sideEffects) {
        this.sideEffects.set(plugin.name, plugin.sideEffects);
      }
    });

    this.rootEvaluator = () => {
      // evaluate only bindings with side effects,
      // everything else will be lazily evaluated
      // indirectly
      for (let [pluginName, bindingNames] of this.sideEffects) {
        const pluginScope = evaluate(pluginName).as(Scope);
        for (let binding of bindingNames) {
          pluginScope.evaluate(binding);
        }
      }

      return new NumberValue(0);
    };

    // parse code
    const state = new ParserState(code, 0, "smeli");
    this.statements = compileStatements(parseStatementList(state));
    this.messages = state.messages;
  }

  push(code: string, offset?: number, line?: number): ParserReport[] {
    const state = new ParserState(code, offset || 0, "smeli");
    state.currentLine = line || 0;

    const statements = compileStatements(parseStatementList(state));
    this.messages = state.messages;

    const success = state.messages.length === 0;
    if (success) {
      this.statements = this.statements.concat(statements);
    }

    return state.messages;
  }

  pop(count: number) {
    if (count > this.statements.length) {
      throw new Error(
        "Trying to remove more statements than the engine currently has"
      );
    }

    const targetCount = this.statements.length - count;
    if (this.nextStatement > targetCount) {
      this.step(targetCount - this.nextStatement);
    }

    this.statements.length = targetCount;
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

  update(time: number) {
    if (this.startTime === null) {
      this.startTime = time;
    }

    const currentTime = new NumberValue((time - this.startTime) * 0.001);
    this.timeOverride.bind(() => currentTime);

    try {
      // evaluate all the side effects
      // (things referenced from the cache root will not be garbage collected)
      evaluateRoot(this.rootEvaluator, this.globalScope);
    } catch (error) {
      let message = error.message + "\n";
      if (error.smeliStack) {
        message += error.smeliStack
          .map((bindingName: string) => "from: " + bindingName)
          .join("\n");
      }
      throw new Error(message);
    }
  }
}
