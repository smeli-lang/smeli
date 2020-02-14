import Engine from "./engine";

test("should parse a basic statement", () => {
  const engine = new Engine("a = 42");
  expect(engine.rootStatements.length).toBe(1);
  expect(engine.allStatements.length).toBe(1);
});
