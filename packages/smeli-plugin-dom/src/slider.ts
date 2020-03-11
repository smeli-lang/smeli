import { Scope, TypedValue, TypeDefinition, TypeTraits } from "@smeli/core";
import template from "./slider.pug";

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
    this.update({ value: 42 });
  }

  update(evaluatedScope: any) {
    // render with the updated values
    this.node.innerHTML = template(evaluatedScope);

    const slider = this.node.querySelector(".slider") as HTMLInputElement;
    slider.addEventListener("input", () => {
      this.scope.bind("value", parseInt(slider.value));
    });

    const root = document.querySelector("#preview") as HTMLElement;
    root.appendChild(this.node);
  }

  unbind() {
    // destroy the whole subtree and the associated callbacks
    this.node.innerHTML = "";
  }

  type() {
    return SliderType;
  }
}

const SliderType: TypeTraits = {
  __name__: () => "slider",
  __str__: (self: Slider) =>
    `slider(${(self.node.querySelector(".slider") as HTMLInputElement).value})`,

  __bind__: (scope: Scope) => new Slider(scope),
  __unbind__: (self: Slider) => self.unbind(),

  type: () => TypeDefinition
};

export { SliderType };
