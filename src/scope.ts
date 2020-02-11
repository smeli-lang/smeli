import Binding from "./binding";

export default class Scope {
  parent: Scope | null;
  bindings: Map<string, Binding>;

  constructor(parent: Scope | null = null) {
    this.parent = parent;
    this.bindings = new Map();
  }

  bind(name: string, binding: Binding | null) {
    const previousBinding = this.bindings.get(name) || null;

    if (binding) {
      this.bindings.set(name, binding);
    } else {
      this.bindings.delete(name);
    }

    return previousBinding;
  }

  lookup(name: string): Binding | null {
    const localBinding = this.bindings.get(name);
    if (localBinding) {
      return localBinding;
    }

    return this.parent?.lookup(name) || null;
  }
}
