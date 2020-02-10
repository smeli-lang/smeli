import Engine from "./engine";

test("should parse a basic statement", () => {
  const engine = new Engine("a = 42");
  expect(engine.program).not.toBeNull();
});
