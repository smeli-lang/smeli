import { Scope, TypedValue, TypeDefinition, TypeTraits } from "@smeli/core";

interface DomNode extends TypedValue {
  node: HTMLElement;
}

class Slider implements DomNode {
  node: HTMLElement;
  scope: Scope;

  constructor(scope: Scope) {
    this.node = new HTMLElement();
    this.scope = scope;
  }

  type() {
    return SliderType;
  }
}

const SliderType: TypeTraits = {
  __name__: () => "slider",
  __new__: (scope: Scope) => new Slider(scope),

  type: () => TypeDefinition
};

export class DomPlugin implements TypedValue {
  container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  type() {
    return DomPluginType;
  }
}

export const DomPluginType: TypeTraits = {
  __name__: () => "dom",

  type: () => TypeDefinition
};

const smeliPluginDom = (container: HTMLElement) => {
  return new DomPlugin(container);
};

// following the same pattern as @smeli/core, see index file there
// for more information
const namedExports = module.exports;

module.exports = smeliPluginDom;
for (const name in namedExports) {
  module.exports[name] = namedExports[name];
}
