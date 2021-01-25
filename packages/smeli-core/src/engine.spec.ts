import { evaluate, evaluateRoot } from "./cache";
import { Engine } from "./engine";
import { NumberValue } from "./types";

test("should run a basic statement", () => {
  const engine = new Engine("a: 42");
  expect(engine.statements.length).toBe(1);

  engine.step(1);

  const result = evaluateRoot(() => evaluate("a"), engine.globalScope);
  expect(result).not.toBeNull();

  const numberValue = result.as(NumberValue);
  expect(numberValue.value).toBe(42);

  engine.step(-1);
  expect(() =>
    evaluateRoot(() => evaluate("a"), engine.globalScope)
  ).toThrowError();
});
