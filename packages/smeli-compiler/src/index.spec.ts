import { compile } from "./index";

test("plugin directive: simple case", () => {
  const code: { [key: string]: string } = {
    "index.smeli": `
      @plugin("@smeli/plugin-ui")
      @plugin("hello")
    `,
  };
  const result = compile({
    resolveChunk: (filename) => code[filename],
  });

  expect(result.plugins).toEqual(["@smeli/plugin-ui", "hello"]);
});

test("plugin directive: duplicates", () => {
  const code: { [key: string]: string } = {
    "index.smeli": `
      @plugin("hello")
      @plugin("hello")
    `,
  };
  const result = compile({
    resolveChunk: (filename) => code[filename],
  });

  expect(result.plugins).toEqual(["hello"]);
});

test("unknown directive", () => {
  const code: { [key: string]: string } = {
    "index.smeli": `
      @dinosaur("meteorite")
    `,
  };

  expect(() =>
    compile({
      resolveChunk: (filename) => code[filename],
    })
  ).toThrowError("Unknown compiler directive: dinosaur");
});

test("inline directive: simple case", () => {
  const code: { [key: string]: string } = {
    "index.smeli": `
      @inline("lib")
    `,

    "lib.smeli": `
      # hello
    `,
  };

  const result = compile({
    resolveChunk: (filename) => code[filename],
  });

  expect(result.fullCode.trim()).toEqual("# hello");
});
