import { smeli } from "@smeli/core";
import makeSmeliConfig from "__root_smeli_file_alias__";

window.onload = () => {
  const engine = smeli(makeSmeliConfig());

  // check for compile errors
  // (this should probably be moved to the webpack loader)
  if (engine.messages.length > 0) {
    document.body.innerHTML = engine.messages
      .map(message => `${message.line}:${message.column}: ${message.message}`)
      .join("<br />");
    return;
  }

  // run to the first marker
  engine.step(1);

  document.addEventListener("keydown", event => {
    // note: slide clickers typically send page up/down events
    switch (event.code) {
      case "PageDown":
      case "ArrowDown":
      case "ArrowRight":
        engine.step(1);
        //requestAnimationFrame(update);
        break;

      case "PageUp":
      case "ArrowUp":
      case "ArrowLeft":
        engine.step(-1);
        //requestAnimationFrame(update);
        break;
    }
  });

  function update() {
    try {
      engine.update();
      requestAnimationFrame(update);
    } catch (e) {
      console.log(e);
    }
  }

  requestAnimationFrame(update);
};
