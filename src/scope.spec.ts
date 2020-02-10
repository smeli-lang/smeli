import Scope from "./scope";
import { NumberLiteral } from "./ast";

test("binds a symbol", () => {
  const scope = new Scope();
  scope.bindSymbol("a", new NumberLiteral(42));
  const value = scope.evaluate("a");
  expect(value).toEqual({
    type: "number",
    value: 42
  });
});
