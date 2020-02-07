import { ParserState, parseRegex, parseWhitespace, parseEndOfLine, parseNumberLiteral, parseIdentifier } from "./parser";

/**
 * Regex
 */

test("parseRegex: simple match", () => {
  const state = new ParserState("aaaaa");
  const re = /a+/g;
  const found = parseRegex(state, re);
  expect(found).toBe(true);
  expect(state.n).toBe(5);
});

test("parseRegex: simple non-match", () => {
  const state = new ParserState("bbbbbb");
  const re = /a+/g;
  const found = parseRegex(state, re);
  expect(found).toBe(false);
  expect(state.n).toBe(0);
});

test("parseRegex: substring", () => {
  const state = new ParserState("hello world!", 6);
  const re = /[a-z]+/y;
  const found = parseRegex(state, re);
  expect(found).toBe(true);
  expect(state.n).toBe(11);
  expect(state.str.substring(6, state.n)).toBe("world");
});

test("parseRegex: multiple matches", () => {
  const state = new ParserState("hello72world!");
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

/**
 * Whitespace
 */

test("parseWhitespace: simple", () => {
  const state = new ParserState("  \t  hello!");
  parseWhitespace(state);
  expect(state.n).toBe(5);
});

test("parseWhitespace: doesn't skip over non-whitespace", () => {
  const state = new ParserState("hello       world");
  parseWhitespace(state);
  expect(state.n).toBe(0);
});

test("parseWhitespace: stops before EOL", () => {
  const state = new ParserState("   \t   \n    next line");
  parseWhitespace(state);
  expect(state.n).toBe(7);
});

/**
 * End of line
 */

test("parseEndOfLine: accepts all EOL markers (\\r, \\n, or both)", () => {
  const state = new ParserState("\r\r\n\n\r\n\n"); // 5 lines with mixed markers
  expect(parseEndOfLine(state)).toBe(true); // \r
  expect(state.n).toBe(1);
  expect(parseEndOfLine(state)).toBe(true); // \r\n
  expect(state.n).toBe(3);
  expect(parseEndOfLine(state)).toBe(true); // \n
  expect(state.n).toBe(4);
  expect(parseEndOfLine(state)).toBe(true); // \r\n
  expect(state.n).toBe(6);
  expect(parseEndOfLine(state)).toBe(true); // \n
  expect(state.n).toBe(7);
  expect(parseEndOfLine(state)).toBe(false); // no newlines left
  expect(state.n).toBe(7);
});

test("parseEndOfLine: doesn't consume regular whitespace", () => {
  const state = new ParserState("   \t   \n    next line");
  expect(parseEndOfLine(state)).toBe(false);
  expect(state.n).toBe(0);
});

test("parseEndOfLine: substring", () => {
  const state = new ParserState("first line   \t   \r\n    next line", 17);
  expect(parseEndOfLine(state)).toBe(true);
  expect(state.n).toBe(19);
});

/**
 * Number literal
 */

test("parseNumberLiteral: single number", () => {
  const state = new ParserState("125");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(125);
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: negative number", () => {
  const state = new ParserState("-125");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-125);
  expect(state.n).toBe(4);
});

test("parseNumberLiteral: decimal number", () => {
  const state = new ParserState("0.4");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(0.4);
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: decimal-only number", () => {
  const state = new ParserState(".2");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(0.2);
  expect(state.n).toBe(2);
});

test("parseNumberLiteral: negative decimal-only number", () => {
  const state = new ParserState("-.2");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-.2);
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: binary", () => {
  const state = new ParserState("0b101010");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(42);
  expect(state.n).toBe(8);
});

test("parseNumberLiteral: binary (negative)", () => {
  const state = new ParserState("-0b101010");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-42);
  expect(state.n).toBe(9);
});

test("parseNumberLiteral: binary (invalid)", () => {
  const state = new ParserState("0b141090");
  const literal = parseNumberLiteral(state);
  expect(literal).toBeNull();
  expect(state.n).toBe(0);
});

test("parseNumberLiteral: octal", () => {
  const state = new ParserState("0o123");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(83);
  expect(state.n).toBe(5);
});

test("parseNumberLiteral: octal (negative)", () => {
  const state = new ParserState("-0o123");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-83);
  expect(state.n).toBe(6);
});

test("parseNumberLiteral: octal (invalid)", () => {
  const state = new ParserState("0o749");
  const literal = parseNumberLiteral(state);
  expect(literal).toBeNull();
  expect(state.n).toBe(0);
});

test("parseNumberLiteral: hex", () => {
  const state = new ParserState("0x32");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(50);
  expect(state.n).toBe(4);
});

test("parseNumberLiteral: hex (negative)", () => {
  const state = new ParserState("-0x32");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(-50);
  expect(state.n).toBe(5);
});

test("parseNumberLiteral: hex (invalid)", () => {
  const state = new ParserState("0xabfgz");
  const literal = parseNumberLiteral(state);
  expect(literal).toBeNull();
  expect(state.n).toBe(0);
});

test("parseNumberLiteral: followed by operator", () => {
  const state = new ParserState("87456+12");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(87456);
  expect(state.n).toBe(5);
});

test("parseNumberLiteral: inside substring", () => {
  const state = new ParserState("123 + 0xff + 987", 6);
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toBe(255);
  expect(state.n).toBe(10);
});

/**
 * Identifier
 */

test("parseIdentifier: valid", () => {
  const state = new ParserState("hello_Variable123");
  const id = parseIdentifier(state);
  expect(id).not.toBeNull();
  expect(id!.name).toBe("hello_Variable123");
  expect(state.n).toBe(17);
});

test("parseIdentifier: invalid", () => {
  const state = new ParserState("5name");
  const id = parseIdentifier(state);
  expect(id).toBeNull();
  expect(state.n).toBe(0);
});
