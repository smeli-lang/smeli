const compilerDirectiveRegex = /@([A-Za-z_][A-Za-z0-9_]*)\("([^"]*)"\)/g;

type CompileContext = {
  plugins: string[];
  chunks: Map<string, string>;
  resolveChunk: (filename: string) => string;
};

function executeDirective(
  name: string,
  parameter: string,
  context: CompileContext
): string {
  switch (name) {
    case "plugin": {
      // accumulate the plugin in the shared list
      if (context.plugins.indexOf(parameter) === -1) {
        context.plugins.push(parameter);
      }

      // remove the plugin directive from the runtime code
      return "";
    }

    case "inline": {
      // replace the directive with inlined chunk
      return compileChunk(parameter + ".smeli", context);
    }
  }

  throw new Error("Unknown compiler directive: " + name);
}

function compileChunk(filename: string, context: CompileContext) {
  // early out if that chunk has been compiled already
  const cachedChunk = context.chunks.get(filename);
  if (cachedChunk) {
    return cachedChunk;
  }

  const code = context.resolveChunk(filename);
  return code.replace(
    compilerDirectiveRegex,
    (match: string, name: string, parameter: string) => {
      return executeDirective(name, parameter, context);
    }
  );
}

export type CompileOptions = {
  entry?: string;
  resolveChunk?: (filename: string) => string;
};

export type CompileResult = {
  plugins: string[];
  fullCode: string;
};

export function compile({
  entry = "index.smeli",
  resolveChunk = () => "",
}: CompileOptions = {}): CompileResult {
  const context = {
    plugins: [],
    chunks: new Map<string, string>(),
    resolveChunk,
  };

  const fullCode = compileChunk(entry, context);

  return {
    plugins: context.plugins,
    fullCode,
  };
}
