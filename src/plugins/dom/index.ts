import { Engine, Plugin, Scope } from "../../";
import { Value } from "../../ast";

type BlockTypeDefinition = {
  bindings?: {};
};

interface BlockType {
  define(): BlockTypeDefinition;

  evaluate(): Value;
}

class Hello implements BlockType {
  node: HTMLDivElement;

  constructor() {
    this.node = document.createElement("div") as HTMLDivElement;
  }

  define() {
    return {
      bindings: {
        world: {
          value: 42,
          watch: ({ world }: any) => (this.node.innerText = world.value)
        }
      }
    };
  }

  evaluate() {
    return {
      type: "dom.node",
      value: this.node
    };
  }
}

export default class DomPlugin implements Plugin {
  define() {
    return {
      bindings: {
        number: {
          immutable: true
        }
        /*Hello: {
          literal: new TypeDefinition({
            new: Hello
          })
        }*/
      }
    };
  }

  bind(engine: Engine, scope: Scope) {}

  unbind(engine: Engine, scope: Scope) {}
}
