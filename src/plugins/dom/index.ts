import { TypedScope } from "../../types";

class Hello implements TypedScope {
  node: HTMLDivElement;

  constructor() {
    this.node = document.createElement("div") as HTMLDivElement;
  }

  type() {
    return Hello;
  }

  scope() {
    return {
      bindings: {
        world: 42,
        // world: {
        //   value: 42,
        //   watch: {( world }: any) => (this.node.innerText = world.value)
        // }
      }
    };
  }

  static __new__() {
    return new Hello();
  }
}

export default class DomPlugin implements TypedScope {
  type() {
    return DomPlugin;
  }

  scope() {
    return {
      bindings: {
        Hello
      }
    };
  }

  static __new__() {
    return new DomPlugin();
  }
}
