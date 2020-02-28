const path = require("path");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".ts"]
  },
  output: {
    library: "smeli",
    libraryTarget: "umd",
    filename: `smeli-core.min.js`,
    path: path.resolve(__dirname, "dist")
  },
  plugins: [new DtsBundlePlugin()]
};

// Thanks Vladimir :)
// https://medium.com/@vladimirtolstikov/how-to-merge-d-ts-typings-with-dts-bundle-and-webpack-e8903d699576
function DtsBundlePlugin() {}
DtsBundlePlugin.prototype.apply = function(compiler) {
  compiler.plugin("done", function() {
    var dts = require("dts-bundle");

    dts.bundle({
      name: "smeli",
      main: "dist/index.d.ts",
      out: "smeli-core.min.d.ts",
      removeSource: true,
      outputAsModuleFolder: true // to use npm in-package typings
    });
  });
};
