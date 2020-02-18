import { Expression } from "./ast";
import { TypedValue } from "./types";

export type Binding = {
  name: string;
  expression: Expression;
  previousBinding: Binding | null;
};

export default class Scope implements TypedValue {
  parent: Scope | null;
  bindings: Map<string, Binding>;

  constructor(parent: Scope | null = null) {
    this.parent = parent;
    this.bindings = new Map();
  }

  type() {
    return Scope;
  }

  bind(name: string, expression: Expression): Binding {
    const previousBinding = this.bindings.get(name) || null;
    const binding = {
      name,
      expression,
      previousBinding
    };

    this.bindings.set(name, binding);

    return binding;
  }

  unbind(binding: Binding) {
    const previousBinding = binding.previousBinding;

    if (previousBinding) {
      this.bindings.set(binding.name, previousBinding);
    } else {
      this.bindings.delete(binding.name);
    }
  }

  lookup(name: string): Binding | null {
    const localBinding = this.bindings.get(name);
    if (localBinding) {
      return localBinding;
    }

    return this.parent?.lookup(name) || null;
  }

  static __new__() {
    return new Scope();
  }
}
