const path = require("path");

const makeTypescriptLibrary = (distName, globalName) => {
  /*const packageFilename = path.resolve(
    __dirname,
    "packages",
    distName,
    "package.json"
  );
  const package = require(packageFilename);

  const dependencies = package.hasOwnProperty("dependencies")
    ? Object.keys(package.dependencies)
    : [];

  const peerDependencies = package.hasOwnProperty("peerDependencies")
    ? Object.keys(package.peerDependencies)
    : [];

  const externals = dependencies + peerDependencies;*/

  // Thanks Vladimir :)
  // https://medium.com/@vladimirtolstikov/how-to-merge-d-ts-typings-with-dts-bundle-and-webpack-e8903d699576
  function DtsBundlePlugin() {}
  DtsBundlePlugin.prototype.apply = function(compiler) {
    compiler.plugin("done", function() {
      var dts = require("dts-bundle");

      dts.bundle({
        name: distName,
        main: "dist/index.d.ts",
        //out: `${distName}.min.d.ts`,
        removeSource: true,
        outputAsModuleFolder: true // to use npm in-package typings
      });
    });
  };

  return {
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
    externals: [
      // make sure we don't bundle dependencies with a library
      // (i.e. exclude anything that doesn't start with a '.')
      /^[^.]/
    ],
    output: {
      library: globalName,
      libraryTarget: "umd",
      filename: `${distName}.min.js`,
      path: path.resolve(__dirname, "packages", distName, "dist")
    }
    //plugins: [new DtsBundlePlugin()]
  };
};

module.exports = {
  makeTypescriptLibrary
};
