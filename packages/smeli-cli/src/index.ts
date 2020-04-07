#!/usr/bin/env node
import webpack from "webpack";
import path from "path";

console.log("hello!");

const template = require("@smeli/template-slides");

const templateOptions = {
  rootFile: path.resolve("index.smeli"),
  outputPath: path.resolve("dist")
};

const webpackConfig = template(templateOptions);

const compiler = webpack(webpackConfig);

compiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.log("failed!");
    console.log(err);
    console.log(stats);
  } else {
    console.log("output written to", templateOptions.outputPath);
  }
});
