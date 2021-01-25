import { evaluate, evaluateRoot } from "./cache";
import { smeli, NumberValue } from "./index";

test("basic usage", () => {
  const engine = smeli({ code: "a: 42" });
  engine.step(1);
  const result = evaluateRoot(() => evaluate("a"), engine.globalScope);
  expect(result).toEqual(new NumberValue(42));
});
