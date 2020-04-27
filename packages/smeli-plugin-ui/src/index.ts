import { Scope, ScopeType } from "@smeli/core";
import { DomNode, DomNodeType } from "./types";

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
          // guard against multiple evaluations
          container.innerHTML = "";

          const styles = evaluateStyles(scope);
          container.className = styles.container;

          const page = scope.evaluate("page", ScopeType) as Scope;
          const node = page.evaluate("#node", DomNodeType) as DomNode;
          container.appendChild(node.node);

          return node;
        },
      },
      layout,
      outline,
      plot,
      slider,
      styles,
    ],
  };
};
