import { RelativePattern } from "vscode";
import { evaluate, evaluateRoot } from "./cache";
import { Scope } from "./scope";
import { NumberValue } from "./types";

test("push and pop a single binding", () => {
  const scope = new Scope();
  const binding = {
    name: "a",
    evaluate: () => new NumberValue(42),
  };

  scope.push(binding);
  expect(evaluateRoot(() => evaluate("a"), scope)).toEqual(new NumberValue(42));

  scope.pop(binding);
  expect(() => evaluateRoot(() => evaluate("a"), scope)).toThrowError();

  scope.dispose();
});

test("evaluates binding history", () => {
  const scope = new Scope();
  const bindings = [
    {
      name: "a",
      evaluate: () => new NumberValue(42),
    },
    {
      name: "a",
      evaluate: () => {
        const a = evaluate("a").as(NumberValue);
        return new NumberValue(a.value + 22);
      },
    },
  ];

  scope.push(bindings);
  expect(evaluateRoot(() => evaluate("a"), scope)).toEqual(new NumberValue(64));

  scope.dispose();
});

test("evaluates bindings from prefix", () => {
  const prefix = new Scope();
  prefix.push({
    name: "x",
    evaluate: () => new NumberValue(10),
  });

  const scope = new Scope(null, prefix);
  expect(evaluateRoot(() => evaluate("x"), scope)).toEqual(new NumberValue(10));

  scope.dispose();
  prefix.dispose();
});

test("evaluates bindings from prefix against the derived scope", () => {
  const prefix = new Scope();
  prefix.push([
    {
      name: "x",
      evaluate: () => new NumberValue(10),
    },
    {
      name: "y",
      evaluate: () => evaluate("x"),
    },
  ]);

  const scope = new Scope(null, prefix);
  evaluateRoot(() => {
    expect(evaluate("x")).toEqual(new NumberValue(10));
    expect(evaluate("y")).toEqual(new NumberValue(10));

    return new NumberValue(0);
  }, scope);

  scope.push({
    name: "x",
    evaluate: () => new NumberValue(20),
  });

  evaluateRoot(() => {
    expect(evaluate("x")).toEqual(new NumberValue(20));
    expect(evaluate("y")).toEqual(new NumberValue(20));

    return new NumberValue(0);
  }, scope);

  scope.dispose();
  prefix.dispose();
});

test("using the same prefix from different scopes is reentrant", () => {
  const prefix = new Scope();
  prefix.push([
    {
      name: "x",
      evaluate: () => new NumberValue(10),
    },
    {
      name: "y",
      evaluate: () => evaluate("x"),
    },
  ]);

  const scope = new Scope(null, prefix);
  scope.push([
    {
      name: "child",
      evaluate: (parentScope: Scope) => new Scope(parentScope, prefix),
    },
    {
      name: "x",
      evaluate: () => {
        const childScope = evaluate("child").as(Scope);
        return evaluate("y", childScope);
      },
    },
  ]);

  expect(evaluateRoot(() => evaluate("y"), scope)).toEqual(new NumberValue(10));

  scope.dispose();
  prefix.dispose();
});

test("evaluates temporary bindings", () => {
  const scope = new Scope();

  const value = evaluateRoot(() => new NumberValue(42), scope);
  expect(value).toEqual(new NumberValue(42));

  scope.dispose();
});
