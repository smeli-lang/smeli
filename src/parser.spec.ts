import { parseRegex, parseNumberLiteral, ParsingState } from "./parser";

test("parseRegex: simple match", () => {
  const state: ParsingState = { str: "aaaaa", n: 0 };
  const re = /a+/g;
  const found = parseRegex(state, re);
  expect(found).toBe(true);
  expect(state.n).toBe(5);
});

test("parseRegex: simple non-match", () => {
  const state: ParsingState = { str: "bbbbbb", n: 0 };
  const re = /a+/g;
  const found = parseRegex(state, re);
  expect(found).toBe(false);
  expect(state.n).toBe(0);
});

test("parseRegex: substring", () => {
  const state: ParsingState = { str: "hello world!", n: 6 };
  const re = /[a-z]+/g;
  const found = parseRegex(state, re);
  expect(found).toBe(true);
  expect(state.n).toBe(11);
  expect(state.str.substring(6, state.n)).toBe("world");
});

test("parseRegex: multiple matches", () => {
  const state: ParsingState = { str: "hello72world!", n: 0 };
  const letters = /[a-z]+/g;
  const digits = /[0-9]+/g;
  expect(parseRegex(state, letters)).toBe(true);
  expect(state.n).toBe(5);
  expect(parseRegex(state, digits)).toBe(true);
  expect(state.n).toBe(7);
  expect(parseRegex(state, letters)).toBe(true);
  expect(state.n).toBe(12);
  expect(parseRegex(state, digits)).toBe(false);
  expect(state.n).toBe(12);
});

test("parseNumberLiteral: single number", () => {
  const state: ParsingState = { str: "125", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(125);
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: negative number", () => {
  const state: ParsingState = { str: "-125", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-125);
  expect(state.n).toBe(4);
});

test("parseNumberLiteral: decimal number", () => {
  const state: ParsingState = { str: "0.4", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(0.4);
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: decimal-only number", () => {
  const state: ParsingState = { str: ".2", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(0.2);
  expect(state.n).toBe(2);
});

test("parseNumberLiteral: negative decimal-only number", () => {
  const state: ParsingState = { str: "-.2", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-.2);
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: binary", () => {
  const state: ParsingState = { str: "0b101010", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(42);
  expect(state.n).toBe(8);
});

test("parseNumberLiteral: binary (negative)", () => {
  const state: ParsingState = { str: "-0b101010", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-42);
  expect(state.n).toBe(9);
});

test("parseNumberLiteral: binary (invalid)", () => {
  const state: ParsingState = { str: "0b141090", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).toBeNull();
  expect(state.n).toBe(0);
});

test("parseNumberLiteral: octal", () => {
  const state: ParsingState = { str: "0o123", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(83);
  expect(state.n).toBe(5);
});

test("parseNumberLiteral: octal (negative)", () => {
  const state: ParsingState = { str: "-0o123", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-83);
  expect(state.n).toBe(6);
});

test("parseNumberLiteral: octal (invalid)", () => {
  const state: ParsingState = { str: "0o749", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).toBeNull();
  expect(state.n).toBe(0);
});

test("parseNumberLiteral: hex", () => {
  const state: ParsingState = { str: "0x32", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(50);
  expect(state.n).toBe(4);
});

test("parseNumberLiteral: hex (negative)", () => {
  const state: ParsingState = { str: "-0x32", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-50);
  expect(state.n).toBe(5);
});

test("parseNumberLiteral: hex (invalid)", () => {
  const state: ParsingState = { str: "0xabfgz", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).toBeNull();
  expect(state.n).toBe(0);
});

test("parseNumberLiteral: followed by operator", () => {
  const state: ParsingState = { str: "87456+12", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(87456);
  expect(state.n).toBe(5);
});

test("parseNumberLiteral: inside substring", () => {
  const state: ParsingState = { str: "123 + 0xff + 987", n: 6 };
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(255);
  expect(state.n).toBe(10);
});
