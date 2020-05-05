import { CacheEntry } from "./cache";
import { TypeTraits, TypedValue, ExpressionValue } from "./types";

export type Binding = {
  name: string;
  evaluate: (scope: Scope) => TypedValue;
  ast?: any;
};

export class Scope implements TypedValue {
  parent: Scope | null;
  prefix: Scope | null;

  bindings: Map<string, Binding[]>;
  cache: Map<Binding, CacheEntry>;
  childScopes: Set<Scope>;
  derivedScopes: Set<Scope>;

  constructor(parent: Scope | null = null, prefix: Scope | null = null) {
    this.parent = parent;
    this.prefix = prefix;

    this.bindings = new Map();
    this.cache = new Map();
    this.childScopes = new Set();
    this.derivedScopes = new Set();

    // register itself in parent and prefix scopes
    parent?.childScopes.add(this);
    prefix?.derivedScopes.add(this);
  }

  dispose() {
    // unregister from parent and prefix scopes
    this.parent?.childScopes.delete(this);
    this.prefix?.derivedScopes.delete(this);

    // dispose of all cache entries
    for (let cacheEntry of this.cache.values()) {
      cacheEntry.invalidate();
    }

    // verify all child scopes have properly unregistered
    if (this.childScopes.size > 0) {
      throw new Error("Child scope was not unregistered after invalidation");
    }
  }

  push(binding: Binding | Binding[]) {
    if (Array.isArray(binding)) {
      binding.forEach((item) => this.push(item));
      return;
    }

    // invalidate cache entries depending on the previously cached value
    const previousBinding = this.lookup(binding.name, this);
    if (previousBinding) {
      this.deprecateDerivedBinding(previousBinding);
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

    // destroy the associated cache entries
    this.invalidateDerivedBinding(binding);

    if (stack.length === 0) {
      this.bindings.delete(binding.name);
    }
  }

  evaluate(name: string, type?: TypeTraits): TypedValue {
    const binding = this.lookup(name, this);
    if (binding) {
      // create a cache entry if necessary
      let cacheEntry = this.cache.get(binding);
      if (!cacheEntry) {
        cacheEntry = new CacheEntry(this, binding);
        this.cache.set(binding, cacheEntry);
      }

      const value = cacheEntry.evaluate();

      // enforce type if provided
      if (type) {
        this.checkType(name, value, type);
      }

      return value;
    }

    if (this.parent) {
      return this.parent.evaluate(name);
    }

    throw new Error(`No previous definition found for '${name}'`);
  }

  partial(partialValue: TypedValue): void {
    CacheEntry.partial(partialValue);
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
        if (CacheEntry.isEvaluating(scope, binding)) {
          continue;
        }

        return binding;
      }
    }

    return this.prefix?.lookup(name, scope) || null;
  }

  // signaled by the cache system to discard a cache entry
  // during garbage collection
  uncache(binding: Binding) {
    this.cache.delete(binding);
  }

  private deprecateDerivedBinding(binding: Binding) {
    const cacheEntry = this.cache.get(binding);
    if (cacheEntry) {
      cacheEntry.deprecate();
    }

    // recursively deprecate the binding on all derived scopes
    for (let derivedScope of this.derivedScopes.values()) {
      derivedScope.deprecateDerivedBinding(binding);
    }
  }

  private invalidateDerivedBinding(binding: Binding) {
    const cacheEntry = this.cache.get(binding);
    if (cacheEntry) {
      cacheEntry.invalidate();
    }

    // recursively invalidate all derived scopes
    for (let derivedScope of this.derivedScopes.values()) {
      derivedScope.invalidateDerivedBinding(binding);
    }
  }

  private checkType(name: string, value: TypedValue, type: TypeTraits) {
    if (value.type() !== type) {
      const typeName = value.type().__name__();
      const expectedTypeName = type.__name__();
      throw new Error(
        `Type error: '${name}' has type '${typeName}' instead of '${expectedTypeName}'`
      );
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
