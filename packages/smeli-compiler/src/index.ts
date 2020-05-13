export type CompileOptions = {
  mainChunk: string;
};

export type CompileResult = {
  plugins: string[];
};

export function compile(options: CompileOptions): CompileResult {
  return {
    plugins: [],
  };
}
