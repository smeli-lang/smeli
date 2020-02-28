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
    filename: `smeli.min.js`,
    path: path.resolve(__dirname, "dist")
  }
};
