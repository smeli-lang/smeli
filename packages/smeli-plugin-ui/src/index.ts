import { Scope } from "@smeli/core";
import { DomNode, DomNodeType } from "./types";
import { slider } from "./slider";

export type UiPluginOptions = {
  container: HTMLElement;
};

const load = ({ container }: UiPluginOptions) => ({
  name: "ui",
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
      invalidate: () => (container.innerHTML = "UI plugin unbound")
    },
    slider
  ]
});

export { load };
