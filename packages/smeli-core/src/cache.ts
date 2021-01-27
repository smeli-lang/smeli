import { Evaluator } from "./evaluation";
import { ExpressionValue, TypedValue } from "./types";

export interface EvaluationContext extends TypedValue {
  cache: ContextCache;
  parent: EvaluationContext | null;
  transients: ImmediateTransients;

  lookup: (name: string) => Evaluator | null;
}

export type ContextCache = Map<Evaluator, CacheEntry>;
export type ImmediateTransients = Map<string, TypedValue>;

type EvaluationStage = {
  evaluator: Evaluator;
  dependencies: Set<CacheEntry>;
  disposables: TypedValue[];
};

export class CacheEntry {
  public context: EvaluationContext;

  private value: TypedValue | null;

  private references: Set<CacheEntry>;

  private stages: EvaluationStage[];
  private currentStage: number;

  public isEvaluating: boolean;

  public static enableCache: boolean = true;

  constructor(context: EvaluationContext, evaluator: Evaluator) {
    this.context = context;

    this.value = null;

    this.references = new Set<CacheEntry>();

    // initial evaluation stage
    this.stages = [
      {
        dependencies: new Set<CacheEntry>(),
        evaluator,
        disposables: [],
      },
    ];
    this.currentStage = 0;

    this.isEvaluating = false;

    // entries are created unreferenced,
    // they will persist across the next gc call
    // if something references them,
    // or are used as evalution root
    Cache.unreferencedEntries.add(this);
  }

  evaluate(
    reference?: CacheEntry,
    expressionOnly?: boolean,
    expressionName?: string | null
  ): TypedValue {
    // keep track of new cache dependencies
    if (reference) {
      if (!this.references.has(reference)) {
        reference.stages[reference.currentStage].dependencies.add(this);

        if (this.references.size === 0) {
          Cache.unreferencedEntries.delete(this);
        }

        this.references.add(reference);
      }
    }

    if (expressionOnly) {
      const rootEvaluator = this.stages[0].evaluator;
      const meta = rootEvaluator.smeliMeta;
      if (meta && meta.sourceExpression) {
        return new ExpressionValue(expressionName || "", meta.sourceExpression);
      }

      throw new Error("No expression bound to this evaluator");
    }

    // early out if already cached
    if (this.value) {
      return this.value;
    }

    this.isEvaluating = true;

    try {
      return this.computeValue();
    } finally {
      this.isEvaluating = false;
    }
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
    if (this.isEvaluating) {
      throw new Error("Invalidating a cache entry being evaluated");
    }

    // discard references first, as they might need the
    // value stored in this entry
    this.invalidateReferences();

    // discard anything cached for this entry
    // and unregister from dependencies
    this.discard();
  }

  // this entry is being garbage collected
  uncache() {
    this.context.cache.delete(this.stages[0].evaluator);
  }

  private computeValue(): TypedValue {
    //console.log("start eval: " + this.binding.name);
    let stage = this.stages[this.currentStage];
    let result: Evaluator | TypedValue = stage.evaluator;

    while (typeof result === "function") {
      const previousOwner = TypedValue.disposableOwner;
      TypedValue.disposableOwner = stage.disposables;
      try {
        //console.log("stage #" + this.currentStage);
        result = result(this.context as any);

        if (CacheEntry.enableCache) {
          if (typeof result === "function") {
            // store the next evaluation stage
            stage = {
              dependencies: new Set<CacheEntry>(),
              evaluator: result,
              disposables: [],
            };
            this.stages.push(stage);
            this.currentStage++;
          } else {
            this.value = result;
          }
        }
      } catch (error) {
        // clear out any owned values
        const disposables = stage.disposables;
        for (const value of disposables.reverse()) {
          // values in that list must have a dispose() method,
          // if not, that's a bug, let it crash
          (value as any).dispose();
        }
        disposables.length = 0;

        // rethrow up the stack
        throw error;
      } finally {
        TypedValue.disposableOwner = previousOwner;
      }
    }

    //console.log("end eval:   " + this.binding.name, this.dependencies);

    return result;
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
    this.value = null;

    for (let i = this.currentStage; i >= targetStage; i--) {
      const stage = this.stages[i];

      // unregister from dependencies
      for (let dep of stage.dependencies) {
        dep.references.delete(this);

        if (dep.references.size === 0) {
          Cache.unreferencedEntries.add(dep);
        }
      }
      stage.dependencies.clear();

      // clear out any owned values
      const disposables = stage.disposables;
      for (const value of disposables.reverse()) {
        // values in that list must have a dispose() method,
        // if not, that's a bug, let it crash
        (value as any).dispose();
      }
      disposables.length = 0;
    }

    // destroy intermediate stages
    this.stages.length = targetStage + 1;
    this.currentStage = targetStage;
  }
}

export class Cache {
  // dynamic dependency graph construction
  private static currentEntry: CacheEntry | null = null;

  // garbage collection
  public static unreferencedEntries: Set<CacheEntry> = new Set();

  private static activeTransients: Map<TypedValue, number> = new Map();
  private static stackSize: number = 0;

  static evaluateRoot(
    evaluator: Evaluator,
    context: EvaluationContext
  ): TypedValue {
    // create a cache entry if necessary
    let rootEntry = context.cache.get(evaluator);
    if (!rootEntry) {
      rootEntry = new CacheEntry(context, evaluator);
      context.cache.set(evaluator, rootEntry);
    }

    Cache.currentEntry = rootEntry;

    try {
      return rootEntry.evaluate();
    } finally {
      Cache.currentEntry = null;

      // this entry shouldn't have been referenced
      if (Cache.unreferencedEntries.has(rootEntry)) {
        // collect everything not referenced through the root
        Cache.unreferencedEntries.delete(rootEntry);
        Cache.gc();
        Cache.unreferencedEntries.add(rootEntry);
      } else {
        throw new Error(
          "Evaluation root has been referenced during evaluation"
        );
      }
    }
  }

  static gc() {
    const unreferenced = Cache.unreferencedEntries;

    // invalidating entries may generate more garbage, as
    // they will dereference their dependencies along the way
    while (unreferenced.size > 0) {
      for (let entry of unreferenced) {
        entry.invalidate();

        // unreference the cache entry
        entry.uncache();

        unreferenced.delete(entry);
      }
    }
  }

  static evaluate(
    nameOrEvaluator: string | Evaluator,
    newContext?: EvaluationContext,
    expressionOnly?: boolean,
    transients?: { [key: string]: TypedValue }
  ): TypedValue {
    const previousEntry = Cache.currentEntry;

    if (!previousEntry) {
      throw new Error("Evaluation must start with evaluateRoot()");
    }

    const context = newContext || previousEntry.context;

    let name: string | null;
    let evaluator: Evaluator | null;
    if (typeof nameOrEvaluator === "string") {
      const transient = context.transients.get(nameOrEvaluator);
      if (transient) {
        Cache.activeTransients.set(transient, Cache.stackSize);
        CacheEntry.enableCache = false;
        return transient;
      }

      name = nameOrEvaluator;
      evaluator = context.lookup(nameOrEvaluator);
    } else {
      name = null;
      evaluator = nameOrEvaluator;
    }

    if (evaluator) {
      // create a cache entry if necessary
      let cacheEntry = context.cache.get(evaluator);
      if (!cacheEntry) {
        cacheEntry = new CacheEntry(context, evaluator);
        context.cache.set(evaluator, cacheEntry);
      }

      if (transients) {
        for (const name in transients) {
          if (context.transients.has(name)) {
            throw new Error(
              "Multiple overrides of the same name on the same context, this is not supported"
            );
          }
          context.transients.set(name, transients[name]);
        }
      }

      Cache.currentEntry = cacheEntry;
      Cache.stackSize++;

      CacheEntry.enableCache = true;

      let value;
      try {
        value = cacheEntry.evaluate(
          previousEntry || undefined,
          expressionOnly,
          name
        );
      } catch (error) {
        const debugName = name || "[anonymous evaluator]";

        // append debug info for this call
        error.smeliStack = error.smeliStack || [];
        error.smeliStack.push(debugName);

        // then rethrow up the stack
        throw error;
      } finally {
        Cache.currentEntry = previousEntry;
        Cache.stackSize--;

        if (transients) {
          for (const name in transients) {
            context.transients.delete(name);
            Cache.activeTransients.delete(transients[name]);
          }
        }

        CacheEntry.enableCache = true;
        for (let [transient, stackMax] of Cache.activeTransients) {
          stackMax = Math.min(stackMax, Cache.stackSize);
          Cache.activeTransients.set(transient, stackMax);

          if (stackMax === Cache.stackSize) {
            CacheEntry.enableCache = false;
          }
        }
      }

      return value;
    }

    const parent = context.parent;
    if (parent) {
      return evaluate(nameOrEvaluator, parent, expressionOnly);
    }

    throw new Error(`No previous definition found for '${nameOrEvaluator}'`);
  }

  static currentEvaluationContext(): EvaluationContext {
    const entry = Cache.currentEntry;
    if (!entry) {
      throw new Error("Not currently evaluating");
    }

    return entry.context;
  }
}

export const evaluate = Cache.evaluate;
export const evaluateRoot = Cache.evaluateRoot;

export const currentEvaluationContext = Cache.currentEvaluationContext;
