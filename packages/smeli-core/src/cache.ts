import { Binding, Scope } from "./scope";
import { TypedValue } from "./types";

export class CacheEntry {
  private scope: Scope;
  private binding: Binding;

  private value: TypedValue | null;

  private dependencies: Set<CacheEntry>;
  private references: Set<CacheEntry>;

  // dynamic dependency graph construction
  private static evaluationStack: CacheEntry[] = [];

  // garbage collection
  private static unreferencedEntries: Set<CacheEntry> = new Set();

  // ownership of TypedValue objects
  private static valueOwner: Map<TypedValue, CacheEntry> = new Map();

  static isEvaluating(scope: Scope, binding: Binding) {
    for (let i = CacheEntry.evaluationStack.length - 1; i >= 0; i--) {
      const entry = CacheEntry.evaluationStack[i];
      if (entry.scope === scope && entry.binding === binding) {
        return true;
      }
    }

    return false;
  }

  static pushRoot(entry: CacheEntry) {
    CacheEntry.unreferencedEntries.delete(entry);
    CacheEntry.evaluationStack.push(entry);
  }

  static popRoot() {
    const entry = CacheEntry.evaluationStack.pop();

    if (!entry) {
      throw new Error("No cache root found on the evaluation stack");
    }

    if (entry.references.size > 0) {
      throw new Error("Cache root has references, this is not supported");
    }

    CacheEntry.unreferencedEntries.add(entry);
  }

  static evaluateRoot() {
    if (CacheEntry.evaluationStack.length === 0) {
      throw new Error("No cache root found on the evaluation stack");
    }

    const root =
      CacheEntry.evaluationStack[CacheEntry.evaluationStack.length - 1];

    const value = root.binding.evaluate(root.scope);

    // this value might be owned by another entry
    if (!CacheEntry.valueOwner.has(value)) {
      CacheEntry.valueOwner.set(value, root);
    }

    root.value = value;

    return value;
  }

  static gc() {
    const unreferenced = CacheEntry.unreferencedEntries;

    // invalidating entries may generate more garbage, as
    // they will dereference their dependencies along the way
    while (unreferenced.size > 0) {
      const entry = unreferenced.values().next().value;
      entry.invalidate();

      // signal the scope that this cache entry can be unregistered
      entry.scope.uncache(entry.binding);

      unreferenced.delete(entry);
    }
  }

  constructor(scope: Scope, binding: Binding) {
    this.scope = scope;
    this.binding = binding;

    this.value = null;

    this.dependencies = new Set<CacheEntry>();
    this.references = new Set<CacheEntry>();

    // entries are created unreferenced,
    // they will persist across the next gc call
    // if something uses them
    CacheEntry.unreferencedEntries.add(this);
  }

  evaluate(): TypedValue {
    const evaluationStack = CacheEntry.evaluationStack;

    // keep track of cache dependencies
    if (evaluationStack.length > 0) {
      const entry = evaluationStack[evaluationStack.length - 1];
      entry.dependencies.add(this);
      this.addReference(entry);
    }

    // early out if already cached
    if (this.value) {
      return this.value;
    }

    evaluationStack.push(this);
    //console.log("start eval: " + this.binding.name);
    const value = this.binding.evaluate(this.scope);
    //console.log("end eval:   " + this.binding.name, this.dependencies);
    evaluationStack.pop();

    // this value might be owned by another entry
    if (!CacheEntry.valueOwner.has(value)) {
      CacheEntry.valueOwner.set(value, this);
    }

    this.value = value;

    return value;
  }

  ast(): any {
    const evaluationStack = CacheEntry.evaluationStack;

    // keep track of cache dependencies
    if (evaluationStack.length > 0) {
      const entry = evaluationStack[evaluationStack.length - 1];
      entry.dependencies.add(this);
      this.addReference(entry);
    }

    if (!this.binding.ast) {
      throw new Error(`Binding '${this.binding.name}' has no expression`);
    }

    return this.binding.ast;
  }

  // a new binding with the same name has been bound
  // to the scope (or one of its prefixes)
  deprecate() {
    //console.log("deprecating: " + this.binding.name, this.references);
    this.invalidateReferences();
  }

  // the binding has been removed, the scope was destroyed, or
  // one of the dependencies was deprecated or invalidated
  invalidate() {
    //console.log("invalidating: " + this.binding.name, this.references);

    // we should never be invalidating a value currently being evaluated
    for (let i = CacheEntry.evaluationStack.length - 1; i >= 0; i--) {
      if (CacheEntry.evaluationStack[i] === this) {
        throw new Error(
          `Invalidating a cache entry being evaluated (${this.binding.name})`
        );
      }
    }

    // discard references first, as they might need the
    // value stored in this entry
    this.invalidateReferences();

    // discard anything cached for this entry
    // and unregister from dependencies
    this.discard();
  }

  private invalidateReferences() {
    // invalidate other entries depending on this one
    // (which will in turn remove themselves from our reference list)
    while (this.references.size > 0) {
      const ref = this.references.values().next().value;
      ref.invalidate();
    }
  }

  // unregister from the dependencies
  // then dispose of all the values owned by this cache entry,
  private discard() {
    // unregister from dependencies
    for (let dep of this.dependencies.values()) {
      dep.removeReference(this);
    }
    this.dependencies.clear();

    // this entry might not own its value
    if (this.value && CacheEntry.valueOwner.get(this.value) === this) {
      if (this.value.dispose) {
        this.value.dispose();
      }
      CacheEntry.valueOwner.delete(this.value);
    }
    this.value = null;
  }

  private addReference(entry: CacheEntry) {
    if (this.references.size === 0) {
      CacheEntry.unreferencedEntries.delete(this);
    }

    this.references.add(entry);
  }

  private removeReference(entry: CacheEntry) {
    this.references.delete(entry);

    if (this.references.size === 0) {
      CacheEntry.unreferencedEntries.add(this);
    }
  }
}
