import { Scope } from "./scope";
import { NumberValue } from "./types";

test("push and pop a single binding", () => {
  const scope = new Scope();
  const binding = {
    name: "a",
    evaluate: () => new NumberValue(42)
  };

  scope.push(binding);
  expect(scope.evaluate("a")).toEqual(new NumberValue(42));

  scope.pop(binding);
  expect(() => scope.evaluate("a")).toThrowError();
});

test("evaluates binding history", () => {
  const scope = new Scope();
  const bindings = [
    {
      name: "a",
      evaluate: () => new NumberValue(42)
    },
    {
      name: "a",
      evaluate: scope => new NumberValue(scope.evaluate("a").value + 22)
    }
  ];

  scope.push(bindings);
  expect(scope.evaluate("a")).toEqual(new NumberValue(64));
});

test("evaluates bindings from prefix", () => {
  const prefix = new Scope();
  prefix.push({
    name: "x",
    evaluate: () => new NumberValue(10)
  });

  const scope = new Scope(null, prefix);
  expect(scope.evaluate("x")).toEqual(new NumberValue(10));
});

test("evaluates bindings from prefix against the derived scope", () => {
  const prefix = new Scope();
  prefix.push([
    {
      name: "x",
      evaluate: () => new NumberValue(10)
    },
    {
      name: "y",
      evaluate: scope => scope.evaluate("x")
    }
  ]);

  const scope = new Scope(null, prefix);
  expect(scope.evaluate("x")).toEqual(new NumberValue(10));
  expect(scope.evaluate("y")).toEqual(new NumberValue(10));

  scope.push([
    {
      name: "x",
      evaluate: () => new NumberValue(20)
    }
  ]);

  expect(scope.evaluate("x")).toEqual(new NumberValue(20));
  expect(scope.evaluate("y")).toEqual(new NumberValue(20));
});
