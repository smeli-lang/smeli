import { Scope, ScopeType } from "@smeli/core";
import { DomNode, DomNodeType } from "./types";
import { slider } from "./slider";

export type UiPluginOptions = {
  container: HTMLElement;
};

const load = ({ container }: UiPluginOptions) => {
  container.innerHTML = "";

  return {
    name: "ui",
    bindings: [
      {
        name: "page",
        evaluate: (scope: Scope) => scope.evaluate("slider")
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
      slider
    ]
  };
};

export { load };
