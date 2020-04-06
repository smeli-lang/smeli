const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const FilterChunkWebpackPlugin = require("filter-chunk-webpack-plugin");

module.exports = ({ entry, outputPath }) => ({
  mode: "production",
  entry: path.join(__dirname, "src/index.js"),
  output: {
    path: outputPath
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Smeli Slides",
      inlineSource: ".(js|css)$" // embed all javascript and css inline
    }),
    new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
    new FilterChunkWebpackPlugin({
      patterns: ["*.js", "*.css"] // remove all javascript and css from the output folder
    })
  ]
});
