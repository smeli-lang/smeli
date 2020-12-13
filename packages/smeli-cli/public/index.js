import { smeli, DebugInterface } from "@smeli/core";
import makeSmeliConfig from "__root_smeli_file_alias__";

import "./index.css";

function makeRootDiv(id) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  div.id = id;

  return div;
}

function showErrors(errors, text) {
  errors.innerHTML = "<h3>Error</h3><pre>" + text + "</pre>";
  errors.classList.add("visible");
}

function hideErrors(errors) {
  errors.classList.remove("visible");
}

window.onload = () => {
  const content = makeRootDiv("content");
  const errors = makeRootDiv("errors");

  const config = makeSmeliConfig({
    "@smeli/plugin-ui": {
      container: content,
    },
  });

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
      const text = engine.messages
        .map(
          (message) => `${message.line}:${message.column}: ${message.message}`
        )
        .join("\n");

      showErrors(errors, text);

      requestAnimationFrame(update);
      return;
    }

    try {
      engine.update();
      hideErrors(errors);
    } catch (e) {
      showErrors(errors, e.message);
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
};
