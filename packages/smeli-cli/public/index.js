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
  const navigation = makeRootDiv("navigation");
  const errors = makeRootDiv("errors");

  navigation.innerHTML =
    '<span id="previous" class="arrow">&lt;----</span><span id="fullscreen"></span><span id="next" class="arrow">----&gt;</span>';

  const config = makeSmeliConfig({
    "@smeli/plugin-ui": {
      container: content,
    },
  });

  const engine = smeli(config);
  const debug = new DebugInterface(engine, config.code);

  // run to the first marker
  engine.next();

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  };

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

      case "KeyF":
        toggleFullscreen();
        break;

      case "Escape":
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  });

  document
    .querySelector("#next")
    .addEventListener("click", () => engine.next());

  document
    .querySelector("#previous")
    .addEventListener("click", () => engine.previous());

  document
    .querySelector("#fullscreen")
    .addEventListener("click", toggleFullscreen);

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

  function update(time) {
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
      engine.update(time);
      hideErrors(errors);
    } catch (e) {
      showErrors(errors, e.message);
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
};
