import jss from "jss";

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

export class DomStyles implements TypedValue {
  sheet: any;

  constructor(styles: any) {
    this.sheet = jss.createStyleSheet(styles).attach();
  }

  dispose() {
    jss.removeStyleSheet(this.sheet);
  }

  type() {
    return DomStylesType;
  }
}

export const DomStylesType: TypeTraits = {
  __name__: () => "dom_styles"
};
