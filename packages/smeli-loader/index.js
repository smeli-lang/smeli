const fs = require("fs");
const { compile } = require("@smeli/compiler");

module.exports = async function smeliLoader(source) {
  const callback = this.async();

  const result = await compile({
    entry: "mainChunk",
    resolveChunk: async (filename) => {
      if (filename === "mainChunk") {
        return source;
      }

      this.addDependency(filename);
      return fs.readFileSync(filename, { encoding: "utf8" });
    },
  });

  const output = `
		${result.plugins
      .map(
        (name, index) =>
          `import  { loadPlugin as loadPlugin${index} } from "${name}";`
      )
      .join("\n")}

		export default (pluginOptions = {}) => {
      const plugins = [${result.plugins.map(
        (name, index) => `loadPlugin${index}(pluginOptions["${name}"]),`
      )}];

      return {
        code: "${result.compiledCode.replace(
          /\\|\n|\r|"/g,
          (match) =>
            ({ "\\": "\\\\", "\n": "\\n", "\r": "\\r", '"': '\\"' }[match])
        )}",
        plugins,
      };
		};
  `;

  callback(null, output);
};
