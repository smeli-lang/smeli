import { TypeTraits, TypedValue } from "./types";

export type Binding = {
  name: string;
  evaluate: (scope: Scope) => TypedValue;
  invalidate?: (value: TypedValue) => void;
};

export class Scope implements TypedValue {
  parent: Scope | null;
  prefix: Scope | null;

  bindings: Map<string, Binding[]>;
  cache: Map<Binding, TypedValue>;
  childScopes: Set<Scope>;

  constructor(parent: Scope | null = null, prefix: Scope | null = null) {
    this.parent = parent;
    this.prefix = prefix;

    this.bindings = new Map();
    this.cache = new Map();
    this.childScopes = new Set();

    // register itself in parent scope
    if (parent) {
      parent.childScopes.add(this);
    }
  }

  dispose() {
    // unregister from parent scope
    if (this.parent) {
      this.parent.childScopes.delete(this);
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

      let value = scope.cache.get(binding);
      if (!value) {
        value = binding.evaluate(scope);
        scope.cache.set(binding, value);
      }

      stack.push(binding);

      return value;
    }

    return this.prefix?.evaluateFrom(name, scope) || null;
  }

  clearCache() {
    // clear child scopes first
    for (let childScope of this.childScopes) {
      childScope.clearCache();
    }

    // invalidate all cache entries
    for (let [binding, value] of this.cache) {
      if (binding.invalidate) {
        binding.invalidate(value);
      }
    }
    this.cache.clear();

    // verify all child scopes have properly unregistered
    if (this.childScopes.size > 0) {
      throw new Error("Child scope was not unregistered after invalidation");
    }
  }

  populateCache() {
    // collect all binding names
    const names = new Set<string>();
    let scope: Scope | null = this;
    while (scope) {
      for (let name of scope.bindings.keys()) {
        names.add(name);
      }
      scope = scope.prefix;
    }

    // evaluate all bindings
    for (let name of names) {
      this.evaluate(name);
    }

    // then child scopes
    for (let childScope of this.childScopes) {
      childScope.populateCache();
    }
  }

  type() {
    return ScopeType;
  }
}

export const ScopeType: TypeTraits = {
  __name__: () => "scope"
};
