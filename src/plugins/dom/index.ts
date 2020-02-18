import { TypedScope, TypedValue } from "../../types";
import Scope, {ScopeDefinition} from "../../scope";

class Hello implements TypedValue {
  node: HTMLDivElement;
  scope: Scope;

  constructor() {
    this.node = document.createElement("div") as HTMLDivElement;
    this.scope = new Scope(null, {
      world: 42,
      // world: {
      //   value: 42,
      //   watch: {( world }: any) => (this.node.innerText = world.value)
      // }
    });
  }

  type() {
    return Hello;
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
      Hello
    };
  }

  static __new__() {
    return new DomPlugin();
  }
}
