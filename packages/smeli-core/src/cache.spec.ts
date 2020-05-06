import { CacheEntry } from "./cache";
import { Scope } from "./scope";
import { TypedValue, NumberValue, TypeTraits } from "./types";

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

  expect(scope.evaluate("a")).toEqual(new NumberValue(42));
  expect(evaluationCount).toBe(1);

  expect(scope.evaluate("a")).toEqual(new NumberValue(42));
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

  expect(scope.evaluate("a")).toEqual(new NumberValue(42));
  expect(scope.evaluate("b")).toEqual(new NumberValue(42));
  expect(scope.evaluate("c")).toEqual(new NumberValue(42));

  const newBinding = {
    name: "a",
    evaluate: () => new NumberValue(21),
  };
  scope.push(newBinding);

  expect(scope.evaluate("a")).toEqual(new NumberValue(21));
  expect(scope.evaluate("b")).toEqual(new NumberValue(21));
  expect(scope.evaluate("c")).toEqual(new NumberValue(21));

  scope.pop(newBinding);

  expect(scope.evaluate("a")).toEqual(new NumberValue(42));
  expect(scope.evaluate("b")).toEqual(new NumberValue(42));
  expect(scope.evaluate("c")).toEqual(new NumberValue(42));

  scope.dispose();
});

class FakeValue implements TypedValue {
  disposed: boolean = false;

  dispose() {
    this.disposed = true;
  }

  type() {
    return FakeType;
  }
}

const FakeType: TypeTraits = {
  __name__: () => "fake",
};

test("deprecated bindings should be disposed in the GC phase", () => {
  const value0 = new FakeValue();
  const value1 = new FakeValue();

  const scope = new Scope();
  scope.push({
    name: "a",
    evaluate: () => value0,
  });

  expect(value0.disposed).toBe(false);
  expect(value1.disposed).toBe(false);

  expect(scope.evaluate("a")).toEqual(value0);

  scope.push({
    name: "a",
    evaluate: () => value1,
  });

  CacheEntry.gc();

  expect(value0.disposed).toBe(true);
  expect(value1.disposed).toBe(false);

  expect(scope.evaluate("a")).toEqual(value1);

  expect(value0.disposed).toBe(true);
  expect(value1.disposed).toBe(false);

  CacheEntry.gc();

  expect(value0.disposed).toBe(true);
  expect(value1.disposed).toBe(true);

  scope.dispose();
});

test("cache root prevents garbage collection", () => {
  const value = new FakeValue();

  const rootBinding = {
    name: "root",
    evaluate: (scope: Scope) => scope.evaluate("a"),
  };

  const scope = new Scope();
  scope.push([
    rootBinding,
    {
      name: "a",
      evaluate: () => value,
    },
  ]);

  const cacheRoot = new CacheEntry(scope, rootBinding);
  CacheEntry.pushRoot(cacheRoot);

  CacheEntry.evaluateRoot();
  CacheEntry.gc();
  expect(value.disposed).toBe(false);

  // outside of the root evaluation, the value should become unreferenced
  CacheEntry.popRoot();
  CacheEntry.gc();
  expect(value.disposed).toBe(true);

  scope.dispose();
});

test("popping a binding should dispose the cached value", () => {
  const value = new FakeValue();

  const scope = new Scope();
  const binding = {
    name: "a",
    evaluate: () => value,
  };
  scope.push(binding);

  expect(value.disposed).toBe(false);
  expect(scope.evaluate("a")).toEqual(value);
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
  expect(scope.evaluate("y")).toEqual(new NumberValue(42));

  prefix.push({
    name: "x",
    evaluate: () => new NumberValue(84),
  });
  expect(scope.evaluate("y")).toEqual(new NumberValue(84));

  scope.dispose();
  prefix.dispose();
});
