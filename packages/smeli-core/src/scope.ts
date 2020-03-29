import { TypeTraits, TypedValue } from "./types";

export type Binding = {
  name: string;
  evaluate: (scope: Scope) => TypedValue;
  invalidate?: () => void;
};

export class Scope implements TypedValue {
  parent: Scope | null;
  bindings: Map<string, Binding[]>;

  constructor(
    parent: Scope | null = null,
    initialBindings: Binding | Binding[] | null = null
  ) {
    this.parent = parent;
    this.bindings = new Map();

    if (initialBindings) {
      this.push(initialBindings);
    }
  }

  push(binding: Binding | Binding[]) {
    if (Array.isArray(binding)) {
      binding.forEach(item => this.push(item));
      return;
    }

    let stack = this.bindings.get(binding.name);
    if (!stack) {
      stack = [];
      this.bindings.set(binding.name, stack);
    }
    stack.push(binding);
  }

  pop(binding: Binding | Binding[]) {
    if (Array.isArray(binding)) {
      // unbind in reverse order
      for (let i = binding.length - 1; i >= 0; i--) {
        this.pop(binding[i]);
      }
      return;
    }

    const stack = this.bindings.get(binding.name);
    if (!stack) {
      throw new Error(`No previous definition found for '${binding.name}'`);
    }

    const check = stack.pop();
    if (binding !== check) {
      throw new Error(`Wrong unbinding order for '${binding.name}'`);
    }

    if (stack.length === 0) {
      this.bindings.delete(binding.name);
    }
  }

  evaluate(name: string, type?: TypeTraits): TypedValue {
    const stack = this.bindings.get(name);
    if (stack) {
      const binding = stack.pop();
      if (!binding) {
        throw new Error(`Empty binding stack for ${name}`);
      }

      const result = binding.evaluate(this);
      stack.push(binding);

      // enforce type if provided
      if (type && result.type() !== type) {
        const typeName = result.type().__name__();
        const expectedTypeName = type.__name__();
        throw new Error(
          `Type error: ${name} has type ${typeName} instead of ${expectedTypeName}`
        );
      }

      return result;
    }

    if (this.parent) {
      return this.parent.evaluate(name);
    }

    throw new Error(`No previous definition found for '${name}'`);
  }

  type() {
    return ScopeType;
  }
}

export const ScopeType: TypeTraits = {
  __name__: () => "scope"
};
