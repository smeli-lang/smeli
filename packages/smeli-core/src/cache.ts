import { Binding, Evaluator, Scope } from "./scope";
import { TypedValue } from "./types";

type EvaluationStage = {
  evaluate: Evaluator;
  dependencies: Set<CacheEntry>;
};

export class CacheEntry {
  private scope: Scope;
  private binding: Binding;

  private value: TypedValue | null;

  private references: Set<CacheEntry>;

  private stages: EvaluationStage[];
  private currentStage: number;

  // dynamic dependency graph construction
  private static evaluationStack: CacheEntry[] = [];

  // garbage collection
  private static unreferencedEntries: Set<CacheEntry> = new Set();

  // ownership of TypedValue objects
  private static valueOwner: Map<TypedValue, CacheEntry> = new Map();

  // values evaluated directly without caching, they
  // only need to be disposed after the evaluator returns
  private static transients: TypedValue[] = [];

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

    const value = root.computeValue();
    return value;
  }

  static gc() {
    const unreferenced = CacheEntry.unreferencedEntries;

    // invalidating entries may generate more garbage, as
    // they will dereference their dependencies along the way
    while (unreferenced.size > 0) {
      for (let entry of unreferenced) {
        entry.invalidate();

        // signal the scope that this cache entry can be unregistered
        entry.scope.uncache(entry.binding);

        unreferenced.delete(entry);
      }
    }
  }

  static transient(value: TypedValue) {
    // values owned by something else will
    // be disposed later by their owners
    if (CacheEntry.valueOwner.has(value)) {
      return;
    }

    const evaluationStack = CacheEntry.evaluationStack;
    if (evaluationStack.length === 0) {
      throw new Error("Cannot start evaluation with a transient");
    }

    // give ownership to the top of the stack
    const entry = evaluationStack[evaluationStack.length - 1];
    CacheEntry.valueOwner.set(value, entry);

    // store it for disposal
    CacheEntry.transients.push(value);
  }

  constructor(scope: Scope, binding: Binding) {
    this.scope = scope;
    this.binding = binding;

    this.value = null;

    this.references = new Set<CacheEntry>();

    // initial evaluation stage
    this.stages = [
      {
        dependencies: new Set<CacheEntry>(),
        evaluate: (scope: Scope) => this.binding.evaluate(scope),
      },
    ];
    this.currentStage = 0;

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
      entry.stages[entry.currentStage].dependencies.add(this);
      this.addReference(entry);
    }

    // early out if already cached
    if (this.value) {
      return this.value;
    }

    evaluationStack.push(this);

    try {
      const value = this.computeValue();
      return value;
    } catch (error) {
      error.smeliStack = error.smeliStack || [];
      error.smeliStack.push(this.binding.name);
      throw error;
    } finally {
      evaluationStack.pop();
    }
  }

  ast(): any {
    const evaluationStack = CacheEntry.evaluationStack;

    // keep track of cache dependencies
    if (evaluationStack.length > 0) {
      const entry = evaluationStack[evaluationStack.length - 1];
      entry.stages[entry.currentStage].dependencies.add(this);
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

  private computeValue(): TypedValue {
    //console.log("start eval: " + this.binding.name);

    while (!this.value) {
      try {
        //console.log("stage #" + this.currentStage);
        const result = this.stages[this.currentStage].evaluate(this.scope);

        if (typeof result === "function") {
          // move to the next evaluation stage
          this.stages.push({
            dependencies: new Set<CacheEntry>(),
            evaluate: result,
          });
          this.currentStage++;
        } else {
          // this value might be owned by another entry
          if (!CacheEntry.valueOwner.has(result)) {
            CacheEntry.valueOwner.set(result, this);
          }
          this.value = result;
        }
      } finally {
        // clear out any owned transient values
        for (let transientValue of CacheEntry.transients) {
          CacheEntry.valueOwner.delete(transientValue);
          if (transientValue.dispose) {
            transientValue.dispose();
          }
        }
        CacheEntry.transients.length = 0;
      }
    }

    //console.log("end eval:   " + this.binding.name, this.dependencies);

    return this.value;
  }

  private invalidateReferences() {
    // invalidate other entries depending on this one
    // (which will in turn remove themselves from our reference list)
    while (this.references.size > 0) {
      const ref = this.references.values().next().value;
      ref.invalidateReferences();

      // discard only the impacted stages
      for (let i = 0; i <= ref.currentStage; i++) {
        const stage = ref.stages[i];
        if (stage.dependencies.has(this)) {
          ref.discard(i);
          break;
        }
      }
    }
  }

  // unregister from the dependencies
  // then dispose of all the values owned by this cache entry,
  private discard(targetStage: number = 0) {
    // unregister from dependencies
    for (let i = targetStage; i <= this.currentStage; i++) {
      const stage = this.stages[i];
      for (let dep of stage.dependencies) {
        dep.removeReference(this);
      }
      stage.dependencies.clear();
    }

    // destroy intermediate stages
    this.stages.length = targetStage + 1;
    this.currentStage = targetStage;

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
