import Smeli from "./smeli";

test("should parse numbers", () => {
  const smeli = new Smeli("42");
  expect(smeli.program!.value).toBe(42);
});
