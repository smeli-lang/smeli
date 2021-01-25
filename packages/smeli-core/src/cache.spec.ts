import { Cache, evaluate, evaluateRoot } from "./cache";
import { Scope } from "./scope";
import { TypedValue, NumberValue } from "./types";

test("evaluate the same binding twice, should be cached", () => {
  let evaluationCount = 0;

  const scope = new Scope();
  const binding = {
    name: "a",
    evaluate: () => {
      evaluationCount++;
      return new NumberValue(42);
    },
  };

  scope.push(binding);

  expect(evaluationCount).toBe(0);

  expect(evaluateRoot(() => evaluate("a"), scope)).toEqual(new NumberValue(42));
  expect(evaluationCount).toBe(1);

  expect(evaluateRoot(() => evaluate("a"), scope)).toEqual(new NumberValue(42));
  expect(evaluationCount).toBe(1);

  scope.dispose();
});

test("reevaluates dependencies when required", () => {
  const scope = new Scope();
  scope.push([
    {
      name: "a",
      evaluate: () => new NumberValue(42),
    },
    {
      name: "b",
      evaluate: (scope: Scope) => scope.evaluate("a"),
    },
    {
      name: "c",
      evaluate: (scope: Scope) => scope.evaluate("b"),
    },
  ]);

  evaluateRoot(() => {
    expect(evaluate("a")).toEqual(new NumberValue(42));
    expect(evaluate("b")).toEqual(new NumberValue(42));
    expect(evaluate("c")).toEqual(new NumberValue(42));

    return new NumberValue(0);
  }, scope);

  const newBinding = {
    name: "a",
    evaluate: () => new NumberValue(21),
  };
  scope.push(newBinding);

  evaluateRoot(() => {
    expect(evaluate("a")).toEqual(new NumberValue(21));
    expect(evaluate("b")).toEqual(new NumberValue(21));
    expect(evaluate("c")).toEqual(new NumberValue(21));

    return new NumberValue(0);
  }, scope);

  scope.pop(newBinding);

  evaluateRoot(() => {
    expect(evaluate("a")).toEqual(new NumberValue(42));
    expect(evaluate("b")).toEqual(new NumberValue(42));
    expect(evaluate("c")).toEqual(new NumberValue(42));

    return new NumberValue(0);
  }, scope);

  scope.dispose();
});

class FakeValue extends TypedValue {
  static typeName = "fake";

  disposed: boolean = false;

  dispose() {
    this.disposed = true;
  }
}

test("deprecated bindings should be disposed in the GC phase", () => {
  let value0 = new FakeValue();
  let value1 = new FakeValue();

  const scope = new Scope();
  scope.push({
    name: "a",
    evaluate: () => {
      value0 = new FakeValue();
      return value0;
    },
  });

  expect(value0.disposed).toBe(false);
  expect(value1.disposed).toBe(false);

  expect(evaluateRoot(() => evaluate("a"), scope)).toEqual(value0);

  scope.push({
    name: "a",
    evaluate: () => {
      value1 = new FakeValue();
      return value1;
    },
  });

  Cache.gc();

  expect(value0.disposed).toBe(true);
  expect(value1.disposed).toBe(false);

  expect(evaluateRoot(() => evaluate("a"), scope)).toEqual(value1);

  expect(value0.disposed).toBe(true);
  expect(value1.disposed).toBe(false);

  Cache.gc();

  expect(value0.disposed).toBe(true);
  expect(value1.disposed).toBe(true);

  scope.dispose();
});

test("cache root prevents garbage collection", () => {
  let value = new FakeValue();

  const rootEvaluator = () => evaluate("a");

  const scope = new Scope();
  scope.push({
    name: "a",
    evaluate: () => {
      value = new FakeValue();
      return value;
    },
  });

  evaluateRoot(rootEvaluator, scope);
  expect(value.disposed).toBe(false);

  // outside of the root evaluation, the value should become unreferenced
  Cache.gc();
  expect(value.disposed).toBe(true);

  scope.dispose();
});

test("temporary bindings are garbage collected", () => {
  const scope = new Scope();

  const value = evaluateRoot(() => new FakeValue(), scope).as(FakeValue);
  expect(value.disposed).toBe(false);

  Cache.gc();
  expect(value.disposed).toBe(true);

  scope.dispose();
});

test("popping a binding should dispose the cached value", () => {
  let value = new FakeValue();

  const scope = new Scope();
  const binding = {
    name: "a",
    evaluate: () => {
      value = new FakeValue();
      return value;
    },
  };
  scope.push(binding);

  expect(value.disposed).toBe(false);
  expect(evaluateRoot(() => evaluate("a"), scope)).toEqual(value);
  expect(value.disposed).toBe(false);

  scope.pop(binding);

  expect(value.disposed).toBe(true);

  scope.dispose();
});

test("pushing a new binding on the prefix invalidates cache in derived scopes", () => {
  const prefix = new Scope();
  prefix.push({
    name: "x",
    evaluate: () => new NumberValue(42),
  });

  const scope = new Scope(null, prefix);
  scope.push({
    name: "y",
    evaluate: (scope: Scope) => scope.evaluate("x"),
  });
  expect(evaluateRoot(() => evaluate("y"), scope)).toEqual(new NumberValue(42));

  prefix.push({
    name: "x",
    evaluate: () => new NumberValue(84),
  });
  expect(evaluateRoot(() => evaluate("y"), scope)).toEqual(new NumberValue(84));

  scope.dispose();
  prefix.dispose();
});

test("multi-stage evaluation: simple case", () => {
  let stage0 = 0;
  let stage1 = 0;

  const scope = new Scope();
  scope.push({
    name: "x",
    evaluate: () => {
      stage0++;
      return () => {
        stage1++;
        return new NumberValue(125);
      };
    },
  });

  expect(stage0).toBe(0);
  expect(stage1).toBe(0);

  expect(evaluateRoot(() => evaluate("x"), scope)).toEqual(
    new NumberValue(125)
  );

  expect(stage0).toBe(1);
  expect(stage1).toBe(1);

  expect(evaluateRoot(() => evaluate("x"), scope)).toEqual(
    new NumberValue(125)
  );

  // second time should be fully cached
  expect(stage0).toBe(1);
  expect(stage1).toBe(1);
});

test("multi-stage evaluation: caches intermediate stages", () => {
  let stage0 = 0;
  let stage1 = 0;

  const scope = new Scope();
  scope.push([
    {
      name: "dependency",
      evaluate: () => new NumberValue(125),
    },
    {
      name: "x",
      evaluate: () => {
        stage0++;
        return () => {
          stage1++;
          return scope.evaluate("dependency");
        };
      },
    },
  ]);

  expect(stage0).toBe(0);
  expect(stage1).toBe(0);

  expect(evaluateRoot(() => evaluate("x"), scope)).toEqual(
    new NumberValue(125)
  );

  expect(stage0).toBe(1);
  expect(stage1).toBe(1);

  // update the dependency (should invalidate only stage 1)
  scope.push({
    name: "dependency",
    evaluate: () => new NumberValue(3600),
  });

  expect(evaluateRoot(() => evaluate("x"), scope)).toEqual(
    new NumberValue(3600)
  );

  // only stage1 should be recomputed
  expect(stage0).toBe(1);
  expect(stage1).toBe(2);
});

test("multi-stage evaluation: invalidates intermediate stages correctly", () => {
  const scope = new Scope();
  scope.push([
    {
      name: "a",
      evaluate: () => new NumberValue(10),
    },
    {
      name: "b",
      evaluate: () => new NumberValue(20),
    },
    {
      name: "x",
      evaluate: (scope: Scope) => {
        const a = scope.evaluate("a").as(NumberValue);

        return (scope: Scope) => {
          // artificially add a second dependency to 'a'
          // from a later stage
          scope.evaluate("a");

          const b = scope.evaluate("b").as(NumberValue);

          return new NumberValue(a.value + b.value);
        };
      },
    },
  ]);

  expect(evaluateRoot(() => evaluate("x"), scope)).toEqual(new NumberValue(30));

  // update one of the dependencies (should invalidate only stage 1)
  scope.push({
    name: "b",
    evaluate: () => new NumberValue(200),
  });

  // update the other one (should invalidate everything)
  scope.push({
    name: "a",
    evaluate: () => new NumberValue(100),
  });

  expect(evaluateRoot(() => evaluate("x"), scope)).toEqual(
    new NumberValue(300)
  );
});

test("transients: are not cached", () => {
  const scope = new Scope();

  const transients = {
    x: new NumberValue(10),
  };

  const evaluator = () => evaluate("x");

  evaluateRoot(() => {
    expect(evaluate(evaluator, undefined, false, transients)).toEqual(
      new NumberValue(10)
    );

    transients.x = new NumberValue(20);

    expect(evaluate(evaluator, undefined, false, transients)).toEqual(
      new NumberValue(20)
    );

    return new NumberValue(0);
  }, scope);
});
