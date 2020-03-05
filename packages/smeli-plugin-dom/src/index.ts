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

const load = (container: HTMLElement) => {
  return new DomPlugin(container);
};

export { load };
