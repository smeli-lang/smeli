import { Scope, TypedValue, TypeDefinition, TypeTraits } from "@smeli/core";
import template from "./plop.pug";

interface DomNode extends TypedValue {
  node: HTMLElement;
}

class Slider implements DomNode {
  node: HTMLElement;
  scope: Scope;

  constructor(scope: Scope) {
    this.node = document.createElement("div");
    (document.querySelector("#preview") as HTMLElement).innerHTML = template({
      name: "LOL"
    });
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

export { SliderType };
