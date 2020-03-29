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
