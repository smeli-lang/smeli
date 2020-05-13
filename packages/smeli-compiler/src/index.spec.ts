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

test("plugin duplicates", () => {
  const result = compile({
    mainChunk: `
      @plugin("hello")
      @plugin("hello")
    `,
  });

  expect(result.plugins).toEqual(["hello"]);
});

test("unknown directive", () => {
  expect(() =>
    compile({
      mainChunk: `
      @dinosaur("meteorite")
    `,
    })
  ).toThrowError("Unknown compiler directive: dinosaur");
});
