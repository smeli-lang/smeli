import { Binding, NumberType, NumberValue, Scope } from "@smeli/core";
import { DomNode } from "./types";
import { evaluateStyles } from "./styles";

export const slider = {
  name: "slider",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "min",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "max",
        evaluate: () => new NumberValue(100),
      },
      {
        name: "value",
        evaluate: () => new NumberValue(0),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluateStyles(scope);

          const slider = document.createElement("input");
          slider.type = "range";
          slider.className = styles.slider;

          let override: Binding | null = null;
          let overrideActive = false;

          const result = scope.evaluate(
            () =>
              new DomNode(slider, {
                input: (event: Event) => {
                  if (override && overrideActive) {
                    scope.pop(override);
                  } else {
                    slider.classList.add("override");
                  }

                  const inputValue = parseFloat(slider.value);

                  override = {
                    name: "value",
                    evaluate: () => new NumberValue(inputValue),
                  };
                  scope.push(override);
                  overrideActive = true;
                },

                mousedown: ((event: MouseEvent) => {
                  // toggle override on right click
                  if (event.button === 2) {
                    event.preventDefault();

                    if (override) {
                      if (overrideActive) {
                        overrideActive = false;
                        scope.pop(override);
                        slider.classList.remove("override");
                      } else {
                        overrideActive = true;
                        scope.push(override);
                        slider.classList.add("override");
                      }
                    }
                  }
                }) as EventListener,

                mouseup: () => slider.blur(),

                contextmenu: (event: Event) => event.preventDefault(),
              })
          );

          // cache expensive setup in an intermediate stage
          // (also - it allows the slider to override its value binding
          // without destroying itself)
          return (scope: Scope) => {
            const min = scope.evaluate("min", NumberType) as NumberValue;
            const max = scope.evaluate("max", NumberType) as NumberValue;
            const value = scope.evaluate("value", NumberType) as NumberValue;

            slider.min = min.value.toString();
            slider.max = max.value.toString();
            slider.value = value.value.toString();

            return result;
          };
        },
      },
    ]);

    return scope;
  },
};
