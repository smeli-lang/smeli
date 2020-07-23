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

  expect(result.compiledCode.trim()).toEqual("a: 42");
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

  expect(result.compiledCode.trim()).toEqual("# hello");
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
  expect(result.compiledCode.trim()).toEqual("# hello\n      # hello");
});

test("source map: simple inline", () => {
  const code: { [key: string]: string } = {
    "index.smeli": `
      # before inline

      @inline("lib")

      # after inline`,

    "lib.smeli": `# inlined thing`,
  };

  const result = compile({
    resolveChunk: (filename) => code[filename],
  });

  const expectedOutput = `
      # before inline

      # inlined thing

      # after inline`;

  expect(result).toEqual({
    plugins: [],
    compiledCode: expectedOutput,
    sourceMap: [
      {
        start: 0,
        length: 30,
        sourceFile: "index.smeli",
        sourceOffset: 0,
      },
      {
        start: 30,
        length: 15,
        sourceFile: "lib.smeli",
        sourceOffset: 0,
      },
      {
        start: 45,
        length: 22,
        sourceFile: "index.smeli",
        sourceOffset: 44,
      },
    ],
  });
});

test("source map: simple plugin", () => {
  const code: { [key: string]: string } = {
    "index.smeli": `
      # before plugin
      @plugin("hello")
      # after plugin`,
  };

  const result = compile({
    resolveChunk: (filename) => code[filename],
  });

  const expectedOutput = `
      # before plugin
      
      # after plugin`;

  expect(result).toEqual({
    plugins: ["hello"],
    compiledCode: expectedOutput,
    sourceMap: [
      {
        start: 0,
        length: 29,
        sourceFile: "index.smeli",
        sourceOffset: 0,
      },
      {
        start: 29,
        length: 21,
        sourceFile: "index.smeli",
        sourceOffset: 45,
      },
    ],
  });
});

test("source map: recursive inline", () => {
  const code: { [key: string]: string } = {
    "index.smeli": `
      # main
      @inline("a")
      @inline("b")
      # end`,

    "a.smeli": `
      # A
      @inline("b")`,

    "b.smeli": `# B`,
  };

  const result = compile({
    resolveChunk: (filename) => code[filename],
  });

  const expectedOutput = `
      # main
      
      # A
      # B
      # B
      # end`;

  expect(result).toEqual({
    plugins: [],
    compiledCode: expectedOutput,
    sourceMap: [
      {
        start: 0,
        length: 20,
        sourceFile: "index.smeli",
        sourceOffset: 0,
      },
      {
        start: 20,
        length: 17,
        sourceFile: "a.smeli",
        sourceOffset: 0,
      },
      {
        start: 37,
        length: 3,
        sourceFile: "b.smeli",
        sourceOffset: 0,
      },
      {
        start: 40,
        length: 7,
        sourceFile: "index.smeli",
        sourceOffset: 32,
      },
      {
        start: 47,
        length: 3,
        sourceFile: "b.smeli",
        sourceOffset: 0,
      },
      {
        start: 50,
        length: 12,
        sourceFile: "index.smeli",
        sourceOffset: 51,
      },
    ],
  });
});
