import template from "./slider.pug";
import { Scope, NumberValue, TypedValue } from "@smeli/core";
import { DomNode } from "./types";

export const slider = {
  name: "slider",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "min",
        evaluate: () => new NumberValue(0)
      },
      {
        name: "max",
        evaluate: () => new NumberValue(100)
      },
      {
        name: "value",
        evaluate: () => new NumberValue(42)
      },
      {
        name: "#node",
        evaluate: (scope: Scope) => {
          const node = document.createElement("div");
          node.innerHTML = template({
            styles: {
              slider: {
                // "-webkit-appearance": "none",
                // "-moz-appearance": "none",
                // "background-color": "#469"
              }
            }
          });

          const slider = node.querySelector(".slider") as HTMLInputElement;

          function handleInput() {
            scope.push({
              name: "value",
              evaluate: () => new NumberValue(parseInt(slider.value))
            });
          }

          slider.addEventListener("input", handleInput);

          slider.min = (scope.evaluate("min") as NumberValue).value.toString();
          slider.max = (scope.evaluate("max") as NumberValue).value.toString();
          slider.value = (scope.evaluate(
            "value"
          ) as NumberValue).value.toString();

          return new DomNode(node);
        }
      }
    ]);

    return scope;
  },
  invalidate: (value: TypedValue) => (value as Scope).dispose()
};

// evaluate: (scope: Scope) => {
//   const node = document.createElement("div");
//   node.innerHTML = template();

//   const slider = this.node.querySelector(".slider") as HTMLInputElement;

//   function handleInput() {
//     scope.bind("value", parseInt(slider.value));
//   }

//   return [
//     () => {
//       slider.addEventListener("input", handleInput);

//       return () => {
//         slider.min = scope.evaluate("min");
//         slider.max = scope.evaluate("max");

//         return () => {
//           slider.value = scope.evaluate("value");
//           return node;
//         };
//       };
//     },
//     () => {
//       slider.removeEventListener("input", handleInput);
//     }
//   ];
// }
