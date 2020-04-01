import { pushPlugin, PluginDefinition } from "./plugins";
import { NumberValue } from "./types";
import { Scope, ScopeType } from "./scope";

test("loads a basic plugin", () => {
  const plugin: PluginDefinition = {
    name: "hello",
    bindings: [
      {
        name: "world",
        evaluate: () => new NumberValue(42)
      }
    ]
  };

  const scope = new Scope();
  pushPlugin(scope, plugin);

  const pluginScope = scope.evaluate("hello") as Scope;
  expect(pluginScope.type()).toBe(ScopeType);

  const world = pluginScope.evaluate("world");
  expect(world).toEqual(new NumberValue(42));
});

test("loads a code plugin", () => {
  const plugin: PluginDefinition = {
    name: "hello",
    code: `
      world: 42
    `
  };

  const scope = new Scope();
  pushPlugin(scope, plugin);

  const pluginScope = scope.evaluate("hello") as Scope;
  expect(pluginScope.type()).toBe(ScopeType);

  const world = pluginScope.evaluate("world");
  expect(world).toEqual(new NumberValue(42));
});

test("loads bindings first, then code", () => {
  const plugin: PluginDefinition = {
    name: "hello",
    bindings: [
      {
        name: "world",
        evaluate: () => new NumberValue(42)
      }
    ],
    code: `
      world: world + 20
    `
  };

  const scope = new Scope();
  pushPlugin(scope, plugin);

  const pluginScope = scope.evaluate("hello") as Scope;
  expect(pluginScope.type()).toBe(ScopeType);

  console.log(pluginScope);
  const world = pluginScope.evaluate("world");
  expect(world).toEqual(new NumberValue(62));
});