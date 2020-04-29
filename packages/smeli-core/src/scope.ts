import { TypeTraits, TypedValue } from "./types";

export type Binding = {
  name: string;
  evaluate: (scope: Scope) => TypedValue;
  ast?: any;
};

type EvaluationContext = {
  scope: Scope;
  binding: Binding;
};

export class Scope implements TypedValue {
  parent: Scope | null;
  prefix: Scope | null;

  bindings: Map<string, Binding[]>;
  cache: Map<Binding, TypedValue>;
  childScopes: Set<Scope>;

  static evaluationStack: EvaluationContext[] = [];

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
      binding.forEach((item) => this.push(item));
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
    const binding = this.lookup(name, this);
    if (binding) {
      // early out if this evaluation is already cached
      let value = this.cache.get(binding);
      if (value) {
        //console.log("cache hit:", scope, binding, value);
        return value;
      }

      //console.log("cache miss:", scope, binding);
      Scope.evaluationStack.push({
        scope: this,
        binding,
      });

      value = binding.evaluate(this);

      Scope.evaluationStack.pop();

      //console.log("cache store:", scope, binding, value);
      this.cache.set(binding, value);

      // enforce type if provided
      if (type && value.type() !== type) {
        const typeName = value.type().__name__();
        const expectedTypeName = type.__name__();
        throw new Error(
          `Type error: '${name}' has type '${typeName}' instead of '${expectedTypeName}'`
        );
      }

      return value;
    }

    if (this.parent) {
      return this.parent.evaluate(name);
    }

    throw new Error(`No previous definition found for '${name}'`);
  }

  ast(name: string): any {
    const binding = this.lookup(name, this);

    if (binding) {
      if (!binding.ast) {
        throw new Error(`Binding '${name}' has no expression`);
      }

      return binding.ast;
    } else if (this.parent) {
      return this.parent.ast(name);
    }

    throw new Error(`No previous definition found for '${name}'`);
  }

  lookup(name: string, scope: Scope): Binding | null {
    const stack = this.bindings.get(name);
    if (stack) {
      for (let i = stack.length - 1; i >= 0; i--) {
        const binding = stack[i] as Binding;

        // if this binding is already being evaluated
        // from the same scope, skip it
        if (this.isEvaluating(scope, binding)) {
          continue;
        }

        return binding;
      }
    }

    return this.prefix?.lookup(name, scope) || null;
  }

  isEvaluating(scope: Scope, binding: Binding) {
    for (let i = Scope.evaluationStack.length - 1; i >= 0; i--) {
      const context = Scope.evaluationStack[i];
      if (context.scope === scope && context.binding === binding) {
        return true;
      }
    }

    return false;
  }

  clearCache() {
    // clear child scopes first
    for (let childScope of this.childScopes) {
      childScope.clearCache();
    }

    // dispose of all cache entries
    for (let value of this.cache.values()) {
      if (value.dispose) {
        value.dispose();
      }
    }
    this.cache.clear();

    // verify all child scopes have properly unregistered
    if (this.childScopes.size > 0) {
      throw new Error("Child scope was not unregistered after invalidation");
    }
  }

  root(): Scope {
    return this.parent?.root() || this;
  }

  type() {
    return ScopeType;
  }
}

export const ScopeType: TypeTraits = {
  __name__: () => "scope",
};
