const fs = require("fs");
const { compile } = require("@smeli/compiler");

module.exports = (source) => {
  const result = compile({
    entry: "mainChunk",
    resolveChunk: (filename) => {
      if (filename === "mainChunk") {
        return source;
      }

      this.addDependency(filename);
      return fs.readFileSync(filename);
    },
  });

  const output = `
		${result.plugins.map(
      (name, index) =>
        `import  { loadPlugin as loadPlugin${index} } from "${name}"`
    )}

		export default (pluginOptions = {}) => {
      const plugins = [${result.plugins.map(
        (name, index) => `loadPlugin${index}(pluginOptions["${name}"]),`
      )}];

      return {
        code: \`${result.fullCode}\`,
        plugins,
      };
		};
  `;

  return output;
};
