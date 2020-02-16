import Engine from "./engine";

test("should run a basic statement", () => {
  const engine = new Engine("a = 42");
  expect(engine.rootStatements.length).toBe(1);
  expect(engine.allStatements.length).toBe(1);

  engine.step(1);
  expect(engine.globalScope.lookup("a")?.expression.evaluate().value).toBe(42);

  engine.step(-1);
  expect(engine.globalScope.lookup("a")).toBeNull();
});
