import webpack from "webpack";
import path from "path";

import { makeWebpackConfig } from "./template";

const run = () => {
  const templateOptions = {
    rootFile: path.resolve("index.smeli"),
    outputPath: path.resolve("dist"),
  };

  const webpackConfig = makeWebpackConfig(templateOptions);

  const compiler = webpack(webpackConfig);

  const handler: webpack.ICompiler.Handler = (err, stats) => {
    if (err || stats.hasErrors()) {
      console.log("failed!");
      console.log(err);
      console.log(stats);
      process.exit(1);
    } else {
      console.log("output written to", templateOptions.outputPath);
    }
  };

  // this will be replaced by a proper argument parsing library
  // when implemented
  if (process.argv.length > 2 && process.argv[2] === "-w") {
    compiler.watch({}, handler);
  } else {
    compiler.run(handler);
  }
};

export { run };
