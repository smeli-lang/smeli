import { Scope } from "./scope";
import { Literal } from "./ast";
import { NumberValue } from "./types";

test("binds a symbol", () => {
  const scope = new Scope();
  const binding = scope.bind("a", new Literal(new NumberValue(42)));
  expect(scope.lookup("a")).toBe(binding);
});
