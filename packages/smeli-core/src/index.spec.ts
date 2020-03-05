import { load, NumberValue } from "./index";

test("basic usage", () => {
  const engine = load("a: 42");
  engine.step(1);
  const result = engine.globalScope.lookup("a")?.expression.evaluate();
  expect(result).toEqual(new NumberValue(42));
});
