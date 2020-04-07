import { smeli } from "@smeli/core";
import makeSmeliConfig from "__root_smeli_file_alias__";

window.onload = () => {
  const engine = smeli(makeSmeliConfig());

  document.addEventListener("keydown", event => {
    if (event.code === "PageDown") {
      engine.step(1);
    } else if (event.code === "PageUp") {
      engine.step(-1);
    }
  });

  function update() {
    try {
      engine.update();
    } catch (e) {
      console.log(e);
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
};
