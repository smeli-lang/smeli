import Scope from "./scope";
import { NumberLiteral } from "./ast";

test("binds a symbol", () => {
  const scope = new Scope();
  const binding = scope.bind("a", new NumberLiteral(42));
  expect(scope.lookup("a")).toBe(binding);
});
