import { OverloadedFunction } from "./overload"
import { NumberValue, StringValue } from "./types";

test("basic call", () => {
  const f = new OverloadedFunction("f");

  f.implement({
    argumentTypes: [],
    returnType: NumberValue,
    call: () => new NumberValue(42),
  });

  const result = f.call();
  expect(result).toEqual(new NumberValue(42));
});

test("basic overloading", () => {
  const f = new OverloadedFunction("f");

  f.implement({
    argumentTypes: [NumberValue],
    returnType: StringValue,
    call: (number: NumberValue) => new StringValue("number: " + number.value),
  });

  f.implement({
    argumentTypes: [StringValue],
    returnType: StringValue,
    call: (str: StringValue) => new StringValue("string: " + str.value),
  });

  const fromNumber = f.call(new NumberValue(125)).as(StringValue);
  const fromString = f.call(new StringValue("hello")).as(StringValue);

  expect(fromNumber.value).toEqual("number: 125");
  expect(fromString.value).toEqual("string: hello");
});


test("error: wrong number of arguments", () => {
  const f = new OverloadedFunction("f");

  f.implement({
    argumentTypes: [NumberValue, NumberValue],
    returnType: NumberValue,
    call: (number1: NumberValue, number2: NumberValue) => new NumberValue(number1.value + number2.value),
  });

  // too few
  expect(() => f.call(new NumberValue(1))).toThrowError();

  // too many
  expect(() => f.call(new NumberValue(1), new NumberValue(2), new NumberValue(3))).toThrowError();

  // sanity check on the correct case
  expect(f.call(new NumberValue(1), new NumberValue(2))).toEqual(new NumberValue(3));
});

test("error: wrong argument type", () => {
  const f = new OverloadedFunction("f");

  f.implement({
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (number: NumberValue) => new NumberValue(number.value * 2),
  });

  expect(() => f.call(new StringValue("hello"))).toThrowError();

  // sanity check on the correct case
  expect(f.call(new NumberValue(1))).toEqual(new NumberValue(2));
});

test("validation: argument count", () => {
  const f = new OverloadedFunction("f", overload => {
    if (overload.argumentTypes.length !== 2) {
      throw new Error("All the overloads must have two arguments");
    }
  });

  // this overload is valid
  f.implement({
    argumentTypes: [NumberValue, NumberValue],
    returnType: NumberValue,
    call: (number1: NumberValue, number2: NumberValue) => new NumberValue(number1.value + number2.value),
  });

  // this one is not
  expect(() => f.implement({
    argumentTypes: [NumberValue],
    returnType: NumberValue,
    call: (number: NumberValue) => new NumberValue(number.value * 2),
  })).toThrowError();

  // sanity check on the correct case
  expect(f.call(new NumberValue(1), new NumberValue(2))).toEqual(new NumberValue(3));
});
