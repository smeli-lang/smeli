import { assert } from "console";

const compilerDirectiveRegex = /@([A-Za-z_][A-Za-z0-9_]*)\("([^"]*)"\)/g;

export type SourceRange = {
  start: number;
  length: number;

  sourceFile: string;
  sourceOffset: number;
};

export type SourceMap = SourceRange[];

type Chunk = {
  compiledCode: string;
  sourceMap: SourceMap;
};

type CompileContext = {
  plugins: string[];
  chunks: Map<string, Chunk>;
  resolveChunk: (filename: string) => Promise<string>;
};

async function executeDirective(
  name: string,
  parameter: string,
  context: CompileContext
): Promise<Chunk | null> {
  switch (name) {
    case "plugin": {
      // accumulate the plugin in the shared list
      if (context.plugins.indexOf(parameter) === -1) {
        context.plugins.push(parameter);
      }

      // remove the plugin directive from the runtime code
      return null;
    }

    case "inline": {
      // replace the directive with inlined chunk
      return compileChunk(parameter + ".smeli", context);
    }
  }

  throw new Error("Unknown compiler directive: " + name);
}

async function compileChunk(
  filename: string,
  context: CompileContext
): Promise<Chunk> {
  // early out if that chunk has been compiled already
  const cachedChunk = context.chunks.get(filename);
  if (cachedChunk) {
    return cachedChunk;
  }

  const code = await context.resolveChunk(filename);

  // initialize with a single source range covering the whole chunk
  const chunk: Chunk = {
    compiledCode: "",
    sourceMap: [
      {
        start: 0,
        length: code.length,
        sourceFile: filename,
        sourceOffset: 0,
      },
    ],
  };

  // stub execution to find all the matches, this is required
  // because replace doesn't support async callbacks, so we
  // need two passes
  const matches: [string, string][] = [];
  chunk.compiledCode = code.replace(
    compilerDirectiveRegex,
    (match: string, name: string, parameter: string, offset: number) => {
      matches.push([name, parameter]);
      return match;
    }
  );

  // execute all directives in that chunk
  const subChunks: (Chunk | null)[] = [];
  for (const match of matches) {
    const subChunk = await executeDirective(match[0], match[1], context);
    subChunks.push(subChunk);
  }

  // actual replacement and source map update
  chunk.compiledCode = code.replace(
    compilerDirectiveRegex,
    (match: string, name: string, parameter: string, offset: number) => {
      const subChunk = subChunks.shift();
      const replacement = subChunk ? subChunk.compiledCode : "";

      // split ranges around the directive
      const currentRange = chunk.sourceMap[chunk.sourceMap.length - 1];
      const relativeOffset = offset - currentRange.sourceOffset;

      if (subChunk) {
        const inlinedRange: SourceRange = {
          start: currentRange.start + relativeOffset,
          length: replacement.length,
          sourceFile: parameter + ".smeli",
          sourceOffset: 0,
        };

        chunk.sourceMap.push(inlinedRange);
      }

      // this will leave an intentional hole in the source ranges,
      // as part of the source code is completely removed from the output
      const newRange: SourceRange = {
        start: currentRange.start + relativeOffset + replacement.length,
        length: currentRange.length - relativeOffset - match.length,
        sourceFile: filename,
        sourceOffset: offset + match.length,
      };

      currentRange.length = relativeOffset;
      chunk.sourceMap.push(newRange);

      return replacement;
    }
  );

  // clean useless ranges
  chunk.sourceMap = chunk.sourceMap.filter((range) => range.length !== 0);

  // cache the compiled chunk
  context.chunks.set(filename, chunk);

  return chunk;
}

function flattenSourceMap(
  filename: string,
  context: CompileContext,
  startOffset: number = 0
): SourceMap {
  // all chunks must have been compiled at this point
  const chunk = context.chunks.get(filename) as Chunk;

  let output: SourceMap = [];
  let offset = startOffset;

  for (const range of chunk.sourceMap) {
    if (range.sourceFile === filename) {
      output.push({
        ...range,
        start: offset,
      });
      offset += range.length;
    } else {
      const inlinedRange = flattenSourceMap(range.sourceFile, context, offset);
      output = output.concat(inlinedRange);

      const lastRange = inlinedRange[inlinedRange.length - 1];
      offset = lastRange.start + lastRange.length;
    }
  }

  return output;
}

export type CompileOptions = {
  entry?: string;
  resolveChunk?: (filename: string) => Promise<string>;
};

export type CompileResult = {
  plugins: string[];
  compiledCode: string;
  sourceMap: SourceMap;
};

export async function compile({
  entry = "index.smeli",
  resolveChunk = () => {
    throw new Error("No resolveChunk() callback provided");
  },
}: CompileOptions = {}): Promise<CompileResult> {
  const context = {
    plugins: [],
    chunks: new Map<string, Chunk>(),
    resolveChunk,
  };

  const entryChunk = await compileChunk(entry, context);

  return {
    plugins: context.plugins,
    compiledCode: entryChunk.compiledCode,
    sourceMap: flattenSourceMap(entry, context),
  };
}
