import { compile } from "./index";

test("plugin list", () => {
  const result = compile({
    mainChunk: `
      @plugin("@smeli/plugin-ui")
      @plugin("hello")
    `,
  });

  expect(result.plugins).toEqual(["@smeli/plugin-ui", "hello"]);
});
