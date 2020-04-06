import { smeli } from "@smeli/core";

window.onload = () => {
  console.log("hello!");
  const engine = smeli({
    code: "a: 10 + 20"
  });
  engine.step(1);
  console.log(engine.globalScope.evaluate("a"));
};
