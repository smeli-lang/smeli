import path from "path";

import webpack from "webpack";

import HtmlWebpackPlugin from "html-webpack-plugin";
import HtmlWebpackInlineSourcePlugin from "html-webpack-inline-source-plugin";
import FilterChunkWebpackPlugin from "filter-chunk-webpack-plugin";

export const makeWebpackConfig = ({
  rootFile,
  outputPath,
}: {
  rootFile: string;
  outputPath: string;
}): webpack.Configuration => ({
  mode: "production",
  entry: path.join(__dirname, "../public/index.js"),
  output: {
    path: outputPath,
  },
  module: {
    rules: [
      {
        test: /\.smeli$/,
        use: "@smeli/loader",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      __root_smeli_file_alias__: rootFile,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Smeli Slides",
      inlineSource: ".(js|css)$", // embed all javascript and css inline
    }),
    new (HtmlWebpackInlineSourcePlugin as any)(HtmlWebpackPlugin),
    new FilterChunkWebpackPlugin({
      patterns: ["*.js", "*.css"], // remove all javascript and css from the output folder
    }),
  ],
});
