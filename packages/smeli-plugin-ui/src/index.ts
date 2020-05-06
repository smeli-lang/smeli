import { Scope, ScopeType } from "@smeli/core";
import { DomNode, DomNodeType } from "./types";

import { formula } from "./formula";
import { layout } from "./layout";
import { plot } from "./plot";
import { outline } from "./outline";
import { slider } from "./slider";
import { styles, evaluateStyles } from "./styles";

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
          const styles = evaluateStyles(scope);
          container.className = styles.container;

          // cache style
          return (scope: Scope) => {
            const page = scope.evaluate("page", ScopeType) as Scope;

            // cache page
            return (scope: Scope) => {
              const node = page.evaluate("#ui:node", DomNodeType) as DomNode;

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
      formula,
      layout,
      outline,
      plot,
      slider,
      styles,
    ],
  };
};
