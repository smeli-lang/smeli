import { TypedValue, TypeTraits } from "@smeli/core";

export class DomNode implements TypedValue {
  node: HTMLElement;

  constructor(node: HTMLElement) {
    this.node = node;
  }

  type() {
    return DomNodeType;
  }
}

export const DomNodeType: TypeTraits = {
  __name__: () => "dom_node",

  __str__: (self: DomNode) => `<${self.node.tagName.toLowerCase()} />`
};
