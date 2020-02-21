import {
  TypedScope,
  TypedValue,
  TypeDefinition,
  TypeTraits
} from "../../types";
import Scope, { ScopeDefinition } from "../../scope";
import { type } from "os";

/*class Hello extends TypeDefinition {
  node: HTMLDivElement;
  scope: Scope;

  constructor() {
    super();
    this.node = document.createElement("div") as HTMLDivElement;
    this.scope = new Scope(null, {
      world: 42,
      // world: {
      //   value: 42,
      //   watch: {( world }: any) => (this.node.innerText = world.value)
      // }
    });
  }

  static __new__() {
    return new Hello();
  }
}*/

interface DomNode extends TypedValue {
  node: HTMLElement;
}

class Slider implements DomNode {
  node: HTMLElement;

  constructor() {
    this.node = new HTMLElement();
  }

  type() {
    return SliderType;
  }
}

const SliderType: TypeTraits = {
  __name__: () => "slider",
  type: () => TypeDefinition
};

export default class DomPlugin implements TypedValue {
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
