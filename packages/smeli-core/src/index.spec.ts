import { smeli, NumberValue } from "./index";

test("basic usage", () => {
  const engine = smeli({ code: "a: 42" });
  engine.step(1);
  const result = engine.globalScope.evaluate("a");
  expect(result).toEqual(new NumberValue(42));
});
