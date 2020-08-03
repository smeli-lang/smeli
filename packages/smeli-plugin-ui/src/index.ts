import { Scope } from "@smeli/core";
import { DomNode } from "./types";

import { layout } from "./layout";
import { plot } from "./plot";
import { outline } from "./outline";
import { surface } from "./surface";
import { slider } from "./slider";
import { styles, evaluateUiStyles } from "./styles";

// this is temporary, it will be replaced by theme evaluation
// on the global scope
export * from "./theme";

export * from "./types";
export { evaluateUiStyles };

export type UiPluginOptions = {
  container?: HTMLElement;
};

export const loadPlugin = ({
  container = document.body,
}: UiPluginOptions = {}) => {
  container.innerHTML = "";

  return {
    name: "ui",
    sideEffects: ["#update"],
    bindings: [
      {
        name: "page",
        evaluate: (scope: Scope) => scope.evaluate("outline"),
      },
      {
        name: "#update",
        evaluate: (scope: Scope) => {
          const styles = evaluateUiStyles(scope);
          container.className = styles.container;

          // cache style
          return (scope: Scope) => {
            const page = scope.evaluate("page").as(Scope);

            // cache page
            return (scope: Scope) => {
              const node = page.evaluate("#ui:node").as(DomNode);

              // diff with currently displayed page
              if (!container.hasChildNodes()) {
                container.appendChild(node.node);
              } else {
                const firstChild = container.firstChild;
                if (firstChild !== node.node) {
                  // the hasChildNode() test guarantees a valid first child here
                  container.replaceChild(node.node, firstChild as Node);
                }
              }

              return node;
            };
          };
        },
      },

      layout,
      outline,
      plot,
      surface,
      slider,

      styles,
    ],
  };
};
