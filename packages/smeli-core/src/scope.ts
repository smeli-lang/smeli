import {
  ContextCache,
  currentEvaluationContext,
  evaluate,
  EvaluationContext,
  ImmediateTransients,
} from "./cache";
import { Evaluator } from "./evaluation";
import { TypedValue, TypedConstructor } from "./types";

export type Binding = {
  name: string;
  evaluate: Evaluator;
  ast?: any;
};

type NestedBindings = {
  [key: string]: NestedBindings | TypedConstructor<TypedValue> | null;
};

type NestedValues = {
  [key: string]: NestedValues | TypedValue;
};

export class Scope extends TypedValue implements EvaluationContext {
  static typeName = "scope";

  parent: Scope | null;
  prefix: Scope | null;

  bindings: Map<string, Binding[]>;
  cache: ContextCache;
  transients: ImmediateTransients;

  childScopes: Set<Scope>;
  derivedScopes: Set<Scope>;

  constructor(parent: Scope | null = null, prefix: Scope | null = null) {
    super();

    this.parent = parent;
    this.prefix = prefix;

    this.bindings = new Map();
    this.cache = new Map();
    this.transients = new Map();

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
    const previousBinding = this.lookup(binding.name);
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
    this.invalidateDerivedBinding(binding.evaluate);

    if (stack.length === 0) {
      this.bindings.delete(binding.name);
    }
  }

  evaluateNested(nestedBindings: NestedBindings): NestedValues {
    const result: NestedValues = {};

    for (const [name, rhs] of Object.entries(nestedBindings)) {
      if (rhs === null) {
        // evaluate as anything
        result[name] = evaluate(name, this);
      } else if (rhs.typeName !== undefined) {
        const constructor = rhs as TypedConstructor<TypedValue>;
        result[name] = evaluate(name, this).as(constructor);
      } else {
        const childBindings = rhs as NestedBindings;
        const childScope = evaluate(name, this).as(Scope);
        result[name] = childScope.evaluateNested(childBindings);
      }
    }

    return result;
  }

  lookup(name: string): Evaluator | null {
    return this.prefixLookup(name, this);
  }

  private prefixLookup(name: string, scope: Scope): Evaluator | null {
    const stack = this.bindings.get(name);
    if (stack) {
      for (let i = stack.length - 1; i >= 0; i--) {
        const binding = stack[i] as Binding;

        // if this binding is already being evaluated
        // from the same scope, skip it
        const cacheEntry = scope.cache.get(binding.evaluate);
        if (cacheEntry && cacheEntry.isEvaluating) {
          continue;
        }

        return binding.evaluate;
      }
    }

    return this.prefix?.prefixLookup(name, scope) || null;
  }

  private deprecateDerivedBinding(evaluator: Evaluator) {
    const cacheEntry = this.cache.get(evaluator);
    if (cacheEntry) {
      cacheEntry.deprecate();
    }

    // recursively deprecate the binding on all derived scopes
    for (let derivedScope of this.derivedScopes.values()) {
      derivedScope.deprecateDerivedBinding(evaluator);
    }
  }

  private invalidateDerivedBinding(evaluator: Evaluator) {
    const cacheEntry = this.cache.get(evaluator);
    if (cacheEntry) {
      cacheEntry.invalidate();
    }

    // recursively invalidate all derived scopes
    for (let derivedScope of this.derivedScopes.values()) {
      derivedScope.invalidateDerivedBinding(evaluator);
    }
  }

  root(): Scope {
    return this.parent?.root() || this;
  }
}

// create a child scope in the current evaluation context
// (with no prefix scope)
export const createChildScope = (bindings: Binding[] = []) => {
  const parentScope = currentEvaluationContext().as(Scope);
  const scope = new Scope(parentScope);
  scope.push(bindings);
  return scope;
};
