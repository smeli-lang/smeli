import { Engine } from "./engine";
import { NumberValue } from "./types";

test("should run a basic statement", () => {
  const engine = new Engine("a: 42");
  expect(engine.statements.length).toBe(1);

  engine.step(1);

  const result = engine.globalScope.evaluate("a") || null;
  expect(result).not.toBeNull();

  const numberValue = result.as(NumberValue);
  expect(numberValue.value).toBe(42);

  engine.step(-1);
  expect(() => engine.globalScope.evaluate("a")).toThrowError();
});
