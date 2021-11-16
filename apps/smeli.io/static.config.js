import path from "path";

import { compile } from "@smeli/compiler";
import fs from "fs";

// Typescript support in static.config.js is not yet supported, but is coming in a future update!

const compileSample = async (sample) => {
  const root = path.join(__dirname, "../../samples", sample.name);

  const result = await compile({
    entry: "index.smeli",
    resolveChunk: (filename) =>
      fs.readFileSync(path.join(root, filename), { encoding: "utf8" }),
  });

  return {
    ...sample,
    code: result.compiledCode,
  };
};

export default {
  entry: path.join(__dirname, "src", "index.tsx"),
  getRoutes: async () => {
    let samples = [
      {
        name: "layout",
        title: "Layout",
        description: "UI Layout Examples",
      },
      {
        name: "plots",
        title: "Plots",
        description: "Graph toolkit",
      },
      {
        name: "readme",
        title: "README",
        description: "Example from project README",
      },
      {
        name: "shaders",
        title: "Shaders",
        description: "GLSL shaders embedding",
      },
      {
        name: "shader-editor",
        title: "Shader Editor",
        description: "Basic live shader editor",
      },
      {
        name: "widgets",
        title: "Widgets",
        description: "UI building blocks",
      },
    ];

    samples = await Promise.all(samples.map(compileSample));

    const background = await compileSample({
      name: "explore-background",
      title: "Background",
      description: "Hidden sample - menu background",
    });

    return [
      {
        path: "/samples",
        getData: () => ({ samples, background }),
        children: samples.map((currentSample) => ({
          path: `/${currentSample.name}`,
          template: "src/pages/samples",
          getData: () => ({ samples, currentSample }),
        })),
      },
    ];
  },
  plugins: [
    "react-static-plugin-typescript",
    [
      require.resolve("react-static-plugin-source-filesystem"),
      {
        location: path.resolve("./src/pages"),
      },
    ],
    require.resolve("react-static-plugin-reach-router"),
    require.resolve("react-static-plugin-sitemap"),
  ],
};
