import { Scope, ScopeType } from "@smeli/core";
import { DomNode, DomNodeType } from "./types";

import { outline } from "./outline";
import { slider } from "./slider";

export type UiPluginOptions = {
  container?: HTMLElement;
};

export const loadPlugin = ({
  container = document.body
}: UiPluginOptions = {}) => {
  container.innerHTML = "";

  return {
    name: "ui",
    bindings: [
      {
        name: "page",
        evaluate: (scope: Scope) => scope.evaluate("outline")
      },
      {
        name: "#update",
        evaluate: (scope: Scope) => {
          // guard against multiple evaluations
          container.innerHTML = "";

          const page = scope.evaluate("page", ScopeType) as Scope;
          const node = page.evaluate("#node", DomNodeType) as DomNode;
          container.appendChild(node.node);

          return node;
        },
        invalidate: () => (container.innerHTML = "")
      },
      outline,
      slider
    ]
  };
};
