import { TypeTraits, TypedValue } from "./types";

export type Binding = {
  name: string;
  evaluate: (scope: Scope) => TypedValue;
  invalidate?: () => void;
};

export class Scope implements TypedValue {
  parent: Scope | null;
  prefix: Scope | null;

  bindings: Map<string, Binding[]>;

  constructor(parent: Scope | null = null, prefix: Scope | null = null) {
    this.parent = parent;
    this.prefix = prefix;

    this.bindings = new Map();
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
    const result = this.evaluateFrom(name, this);
    if (result) {
      // enforce type if provided
      if (type && result.type() !== type) {
        const typeName = result.type().__name__();
        const expectedTypeName = type.__name__();
        throw new Error(
          `Type error: '${name}' has type '${typeName}' instead of '${expectedTypeName}'`
        );
      }

      return result;
    }

    if (this.parent) {
      return this.parent.evaluate(name);
    }

    throw new Error(`No previous definition found for '${name}'`);
  }

  evaluateFrom(name: string, scope: Scope): TypedValue | null {
    const stack = this.bindings.get(name);
    if (stack && stack.length > 0) {
      const binding = stack.pop() as Binding;
      const result = binding.evaluate(scope);
      stack.push(binding);
      return result;
    }

    return this.prefix?.evaluateFrom(name, scope) || null;
  }

  type() {
    return ScopeType;
  }
}

export const ScopeType: TypeTraits = {
  __name__: () => "scope"
};
