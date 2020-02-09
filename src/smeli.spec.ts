import Smeli from "./smeli";

test("should parse numbers", () => {
  const smeli = new Smeli("a = 42");
  expect(smeli.program).not.toBeNull();
});
