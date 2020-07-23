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

test("plugin directive: strips directive from output", () => {
  const code: { [key: string]: string } = {
    "index.smeli": `
      @plugin("hello")
      a: 42
    `,
  };
  const result = compile({
    resolveChunk: (filename) => code[filename],
  });

  expect(result.fullCode.trim()).toEqual("a: 42");
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

test("chunk cache: never resolve the same chunk twice", () => {
  const code: { [key: string]: string } = {
    "index.smeli": `
      @inline("lib")
      @inline("lib")
    `,

    "lib.smeli": `# hello`,
  };

  const resolveCount: { [key: string]: number } = {};

  const result = compile({
    resolveChunk: (filename) => {
      resolveCount[filename] = resolveCount[filename]
        ? resolveCount[filename] + 1
        : 1;
      return code[filename];
    },
  });

  // if chunks are resolved more than once, something is wrong
  // with the cache
  expect(resolveCount).toEqual({
    "index.smeli": 1,
    "lib.smeli": 1,
  });

  // optional sanity check on the output
  expect(result.fullCode.trim()).toEqual("# hello\n      # hello");
});
