import {
  createChildScope,
  currentEvaluationContext,
  evaluate,
  NumberValue,
  Scope,
  ScopeOverride,
  StringValue,
} from "@smeli/core";
import { DomNode } from "./types";
import { evaluateUiStyles } from "./styles";

export const slider = {
  name: "slider",
  evaluate: () =>
    createChildScope([
      {
        name: "label",
        evaluate: () => new StringValue(""),
      },
      {
        name: "min",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "max",
        evaluate: () => new NumberValue(100),
      },
      {
        name: "step",
        evaluate: () => new NumberValue(1),
      },
      {
        name: "value",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "#ui:node",
        evaluate: () => {
          const styles = evaluateUiStyles();

          const widget = document.createElement("div");
          widget.className = "widget " + styles.slider;

          const slider = document.createElement("input");
          widget.appendChild(slider);
          slider.type = "range";

          const labelDiv = document.createElement("div");
          widget.appendChild(labelDiv);
          labelDiv.className = "label normal";

          const scope = currentEvaluationContext().as(Scope);
          const valueOverride = new ScopeOverride(
            scope,
            "value",
            (activated: boolean) => {
              if (activated) {
                slider.classList.add("override");
              } else {
                slider.classList.remove("override");
              }
            }
          );

          const result = new DomNode(widget, {
            input: (event: Event) => {
              const inputValue = parseFloat(slider.value);
              valueOverride.bind(() => new NumberValue(inputValue));
            },

            mousedown: ((event: MouseEvent) => {
              // toggle override on right click
              if (event.button === 2) {
                event.preventDefault();
                valueOverride.toggle();
              }
            }) as EventListener,

            mouseup: () => slider.blur(),

            contextmenu: (event: Event) => event.preventDefault(),
          });

          // cache expensive setup in an intermediate stage
          // (also - it allows the slider to override its value binding
          // without destroying itself)
          return () => {
            const min = evaluate("min").as(NumberValue);
            const max = evaluate("max").as(NumberValue);
            const step = evaluate("step").as(NumberValue);
            const value = evaluate("value").as(NumberValue);

            slider.min = min.value.toString();
            slider.max = max.value.toString();
            slider.step = step.value.toString();
            slider.value = value.value.toString();

            const label = evaluate("label").as(StringValue);
            labelDiv.innerHTML = label.value;
            labelDiv.style.display = label.value !== "" ? "block" : "none";

            return result;
          };
        },
      },
    ]),
};
