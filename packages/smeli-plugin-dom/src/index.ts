import { Scope, TypedValue, TypeDefinition, TypeTraits } from "@smeli/core";
import { SliderType } from "./slider";

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
