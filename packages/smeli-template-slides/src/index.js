import { smeli, DebugInterface } from "@smeli/core";
import makeSmeliConfig from "__root_smeli_file_alias__";

window.onload = () => {
  const config = makeSmeliConfig();
  const engine = smeli(config);
  const debug = new DebugInterface(engine, config.code);

  // run to the first marker
  engine.next();

  document.addEventListener("keydown", (event) => {
    // note: slide clickers typically send page up/down events
    switch (event.code) {
      case "PageDown":
      case "ArrowDown":
      case "ArrowRight":
        engine.next();
        //requestAnimationFrame(update);
        break;

      case "PageUp":
      case "ArrowUp":
      case "ArrowLeft":
        engine.previous();
        //requestAnimationFrame(update);
        break;
    }
  });

  // debug connection for the vs code extension
  window.addEventListener("message", (event) => {
    const command = event.data;
    //console.log(command);
    if (command.type === "smeli:reset") {
      debug.reset(command);
    } else if (command.type === "smeli:patch") {
      debug.patch(command);
    } else if (command.type === "smeli:step") {
      debug.step(command);
    }
    //console.log(engine);
  });

  function update() {
    // check for compile errors
    // (this should probably be moved somewhere else)
    if (engine.messages.length > 0) {
      document.body.innerHTML = engine.messages
        .map(
          (message) => `${message.line}:${message.column}: ${message.message}`
        )
        .join("<br />");

      requestAnimationFrame(update);
      return;
    }

    try {
      engine.update();
    } catch (e) {
      document.body.innerHTML = "<pre>" + e.message + "</pre>";
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
};
