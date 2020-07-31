import { CacheEntry } from "./cache";
import { TypedValue } from "./types/value";

export type Evaluator = (scope: Scope) => TypedValue | Evaluator;

export type Binding = {
  name: string;
  evaluate: Evaluator;
  ast?: any;
};

export class Scope extends TypedValue {
  static typeName = "scope";

  parent: Scope | null;
  prefix: Scope | null;

  bindings: Map<string, Binding[]>;
  cache: Map<Binding, CacheEntry>;
  childScopes: Set<Scope>;
  derivedScopes: Set<Scope>;

  constructor(parent: Scope | null = null, prefix: Scope | null = null) {
    super();

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

  evaluate<T extends TypedValue>(nameOrEvaluator: (scope: Scope) => T): T;
  evaluate<T extends TypedValue>(
    nameOrEvaluator: string | Evaluator
  ): TypedValue;
  evaluate(nameOrEvaluator: string | Evaluator): any {
    let binding;
    if (typeof nameOrEvaluator === "function") {
      // create a temporary binding for this evaluator
      binding = {
        name: "#temp",
        evaluate: nameOrEvaluator,
      };
    } else {
      binding = this.lookup(nameOrEvaluator, this);
    }

    if (binding) {
      // create a cache entry if necessary
      let cacheEntry = this.cache.get(binding);
      if (!cacheEntry) {
        cacheEntry = new CacheEntry(this, binding);
        this.cache.set(binding, cacheEntry);
      }

      const value = cacheEntry.evaluate();

      return value;
    }

    if (this.parent) {
      return this.parent.evaluate(nameOrEvaluator);
    }

    throw new Error(`No previous definition found for '${nameOrEvaluator}'`);
  }

  transient(evaluator: Evaluator) {
    let value: Evaluator | TypedValue;
    value = evaluator;

    while (typeof value === "function") {
      value = value(this);
    }

    CacheEntry.transient(value);

    return value;
  }

  ast(name: string): any {
    const binding = this.lookup(name, this);

    if (binding) {
      // create a cache entry if necessary
      let cacheEntry = this.cache.get(binding);
      if (!cacheEntry) {
        cacheEntry = new CacheEntry(this, binding);
        this.cache.set(binding, cacheEntry);
      }

      return cacheEntry.ast();
    }

    if (this.parent) {
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

  root(): Scope {
    return this.parent?.root() || this;
  }
}
