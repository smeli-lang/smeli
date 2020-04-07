module.exports = source => {
  return `
		import  { loadPlugin as loadPluginUi } from "@smeli/plugin-ui";

		export default (pluginOptions = {}) => {
				const ui = loadPluginUi(pluginOptions["@smeli/plugin-ui"])

				return {
					code: \`${source}\`,
					plugins: [ui]
				};
		};
	`;
};
