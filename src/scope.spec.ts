import Scope from "./scope";
import { NumberLiteral } from "./ast";
import Binding from "./binding";

test("binds a symbol", () => {
  const scope = new Scope();
  const binding = new Binding(scope, "a", new NumberLiteral(42));
  expect(scope.lookup("a")).toBe(binding);
});
