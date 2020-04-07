import { smeli } from "@smeli/core";
import makeSmeliConfig from "__root_smeli_file_alias__";

window.onload = () => {
  console.log("hello!");
  const engine = smeli(makeSmeliConfig());
  engine.step(1);
  console.log(engine.globalScope.evaluate("a"));
};
