import { Scope } from "@smeli/core";
import { DomNode, DomNodeType } from "./types";
import { slider } from "./slider";

export type DomPluginOptions = {
  container: HTMLElement;
};

const load = ({ container }: DomPluginOptions) => ({
  name: "dom",
  bindings: [
    {
      name: "page",
      evaluate: () => new DomNode(document.createElement("div"))
    },
    {
      name: "#update",
      evaluate: (scope: Scope) => {
        container.innerHTML = "Hello World!";

        const page = scope.evaluate("page", DomNodeType) as DomNode;
        container.appendChild(page.node);

        return page;
      },
      invalidate: () => (container.innerHTML = "DOM plugin unbound")
    },
    slider
  ]
});

export { load };
