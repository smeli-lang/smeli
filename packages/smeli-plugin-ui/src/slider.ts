import { Scope, NumberValue, NumberType } from "@smeli/core";
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

          // temporary input handling, the binding override
          // also needs to be removed and displayed to the user
          function handleInput() {
            scope.push({
              name: "value",
              evaluate: () => new NumberValue(parseInt(slider.value)),
            });
          }

          slider.addEventListener("input", handleInput);

          const result = scope.evaluate(() => new DomNode(slider));

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
