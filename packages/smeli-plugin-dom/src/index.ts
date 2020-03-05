import {
  Scope,
  Binding,
  TypedValue,
  TypeDefinition,
  TypeTraits
} from "@smeli/core";

interface DomNode extends TypedValue {
  node: HTMLElement;
}

class Slider implements DomNode {
  node: HTMLElement;
  scope: Scope;

  constructor(scope: Scope) {
    this.node = document.createElement("div");
    this.scope = scope;

    this.scope.bind("value", 42);
  }

  unbind() {}

  type() {
    return SliderType;
  }
}

const SliderType: TypeTraits = {
  __name__: () => "slider",

  __bind__: (scope: Scope) => new Slider(scope),
  __unbind__: (self: Slider) => self.unbind(),

  type: () => TypeDefinition
};

export class DomPlugin implements TypedValue {
  container: HTMLElement;
  scope: Scope;
  dynamicType: TypeTraits;

  plop: any;

  constructor(container: HTMLElement, scope: Scope, dynamicType: TypeTraits) {
    this.container = container;
    this.scope = scope;
    this.dynamicType = dynamicType;

    this.container.innerHTML = "Hello World!";

    this.plop = this.scope.bind("hello", 42);
    this.scope.bind("slider", SliderType);
  }

  unbind() {
    this.scope.unbind(this.plop);
    this.plop = null;

    this.container.innerHTML = "DOM plugin unbound";
  }

  type() {
    return this.dynamicType;
  }
}

const load = (container: HTMLElement) => {
  const DomPluginType: TypeTraits = {
    __name__: () => "dom",

    __bind__: (scope: Scope) => new DomPlugin(container, scope, DomPluginType),
    __unbind__: (self: DomPlugin) => self.unbind(),

    type: () => TypeDefinition
  };

  return DomPluginType;
};

export { load };
