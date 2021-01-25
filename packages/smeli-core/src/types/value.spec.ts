import { TypedValue } from "./value";

class DisposableValue extends TypedValue {
  dispose() {
    // just needs to be there :)
  }
}

class NonDisposableValue extends TypedValue {}

test("registers itself as a disposable", () => {
  const disposables: TypedValue[] = [];

  const value0 = new DisposableValue();
  expect(disposables.length).toBe(0);

  TypedValue.disposableOwner = disposables;

  const value1 = new DisposableValue();
  expect(disposables).toEqual([value1]);

  const value2 = new DisposableValue();
  expect(disposables).toEqual([value1, value2]);

  const value3 = new NonDisposableValue();
  expect(disposables).toEqual([value1, value2]);

  TypedValue.disposableOwner = null;

  const value4 = new DisposableValue();
  expect(disposables).toEqual([value1, value2]);
});
