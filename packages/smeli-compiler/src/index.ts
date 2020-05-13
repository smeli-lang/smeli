const compilerDirectiveRegex = /@([A-Za-z_][A-Za-z0-9_]*)\("([^"]*)"\)/g;

function executeDirective(
  name: string,
  parameter: string,
  plugins: string[]
): string {
  switch (name) {
    case "plugin": {
      // accumulate the plugin in the shared list
      if (plugins.indexOf(parameter) === -1) {
        plugins.push(parameter);
      }

      // remove the plugin directive from the runtime code
      return "";
    }

    case "inline": {
      // replace the directive with inlined chunk
      return "";
    }
  }

  throw new Error("Unknown compiler directive: " + name);
}

function compileChunk(code: string, plugins: string[]) {
  return code.replace(
    compilerDirectiveRegex,
    (match: string, name: string, parameter: string) => {
      return executeDirective(name, parameter, plugins);
    }
  );
}

export type CompileOptions = {
  mainChunk?: string;
  resolveChunk?: (filename: string) => string;
};

export type CompileResult = {
  plugins: string[];
  fullCode: string;
};

export function compile({
  mainChunk = "",
  resolveChunk = () => "",
}: CompileOptions = {}): CompileResult {
  const plugins: string[] = [];
  const fullCode = compileChunk(mainChunk, plugins);

  return {
    plugins,
    fullCode,
  };
}
