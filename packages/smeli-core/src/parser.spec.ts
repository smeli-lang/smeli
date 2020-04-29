import {
  ParserState,
  parseWhitespace,
  parseEndOfLine,
  parseNumberLiteral,
  parseStringLiteral,
  parseIdentifier,
  parseComment,
  parseStatement,
} from "./parser";
import { NumberValue, StringValue } from "./types";

/**
 * Parser state
 */

test("ParserState: line counting in error reports", () => {
  const state = new ParserState("hello world\n42 abc", 0, "src/test.smeli");
  parseIdentifier(state); // hello
  state.reportError("Something is broken!");
  parseWhitespace(state);
  parseIdentifier(state); // world
  parseEndOfLine(state);
  state.reportError("Something else is broken!");
  parseNumberLiteral(state); // 42
  parseWhitespace(state);
  state.reportError("Nothing works.");
  parseIdentifier(state); // abc

  // we should have read the whole string now
  expect(state.n).toBe(state.str.length);

  // check error messages
  expect(state.messages).toEqual([
    {
      file: "src/test.smeli",
      line: 1,
      column: 6,
      message: "Something is broken!",
    },
    {
      file: "src/test.smeli",
      line: 2,
      column: 1,
      message: "Something else is broken!",
    },
    {
      file: "src/test.smeli",
      line: 2,
      column: 4,
      message: "Nothing works.",
    },
  ]);
});

test("ParserState: simple match", () => {
  const state = new ParserState("aaaaa");
  const re = /a+/g;
  const match = state.match(re);
  expect(match).toBe("aaaaa");
  expect(state.n).toBe(5);
});

test("ParserState: simple non-match", () => {
  const state = new ParserState("bbbbbb");
  const re = /a+/g;
  const match = state.match(re);
  expect(match).toBeNull();
  expect(state.n).toBe(0);
});

test("ParserState: substring", () => {
  const state = new ParserState("hello world!", 6);
  const re = /[a-z]+/y;
  const match = state.match(re);
  expect(match).toBe("world");
  expect(state.n).toBe(11);
});

test("ParserState: multiple matches", () => {
  const state = new ParserState("hello72world!");
  const letters = /[a-z]+/g;
  const digits = /[0-9]+/g;
  expect(state.match(letters)).not.toBeNull();
  expect(state.n).toBe(5);
  expect(state.match(digits)).not.toBeNull();
  expect(state.n).toBe(7);
  expect(state.match(letters)).not.toBeNull();
  expect(state.n).toBe(12);
  expect(state.match(digits)).toBeNull();
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
  expect(state.currentLine).toBe(0);
  expect(parseEndOfLine(state)).toBe("\r");
  expect(state.n).toBe(1);
  expect(state.currentLine).toBe(1);
  expect(state.currentLineStartIndex).toBe(state.n);
  expect(parseEndOfLine(state)).toBe("\r\n");
  expect(state.n).toBe(3);
  expect(state.currentLine).toBe(2);
  expect(state.currentLineStartIndex).toBe(state.n);
  expect(parseEndOfLine(state)).toBe("\n");
  expect(state.n).toBe(4);
  expect(state.currentLine).toBe(3);
  expect(state.currentLineStartIndex).toBe(state.n);
  expect(parseEndOfLine(state)).toBe("\r\n");
  expect(state.n).toBe(6);
  expect(state.currentLine).toBe(4);
  expect(state.currentLineStartIndex).toBe(state.n);
  expect(parseEndOfLine(state)).toBe("\n");
  expect(state.n).toBe(7);
  expect(state.currentLine).toBe(5);
  expect(state.currentLineStartIndex).toBe(state.n);
  expect(parseEndOfLine(state)).toBeNull(); // no newlines left
  expect(state.n).toBe(7);
  expect(state.currentLine).toBe(5);
  expect(state.currentLineStartIndex).toBe(state.n);
});

test("parseEndOfLine: doesn't consume regular whitespace", () => {
  const state = new ParserState("   \t   \n    next line");
  expect(parseEndOfLine(state)).toBeNull();
  expect(state.n).toBe(0);
});

test("parseEndOfLine: substring", () => {
  const state = new ParserState("first line   \t   \r\n    next line", 17);
  expect(parseEndOfLine(state)).toBe("\r\n");
  expect(state.n).toBe(19);
});

/**
 * Number literal
 */

test("parseNumberLiteral: single number", () => {
  const state = new ParserState("125");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(125));
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: zero", () => {
  const state = new ParserState("0");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(0));
  expect(state.n).toBe(1);
});

test("parseNumberLiteral: negative number", () => {
  const state = new ParserState("-125");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(-125));
  expect(state.n).toBe(4);
});

test("parseNumberLiteral: decimal number", () => {
  const state = new ParserState("0.4");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(0.4));
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: decimal-only number", () => {
  const state = new ParserState(".2");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(0.2));
  expect(state.n).toBe(2);
});

test("parseNumberLiteral: negative decimal-only number", () => {
  const state = new ParserState("-.2");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(-0.2));
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: binary", () => {
  const state = new ParserState("0b101010");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(42));
  expect(state.n).toBe(8);
});

test("parseNumberLiteral: binary (negative)", () => {
  const state = new ParserState("-0b101010");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(-42));
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
  expect(literal!.value).toEqual(new NumberValue(83));
  expect(state.n).toBe(5);
});

test("parseNumberLiteral: octal (negative)", () => {
  const state = new ParserState("-0o123");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(-83));
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
  expect(literal!.value).toEqual(new NumberValue(50));
  expect(state.n).toBe(4);
});

test("parseNumberLiteral: hex (negative)", () => {
  const state = new ParserState("-0x32");
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(-50));
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
  expect(literal!.value).toEqual(new NumberValue(87456));
  expect(state.n).toBe(5);
});

test("parseNumberLiteral: inside substring", () => {
  const state = new ParserState("123 + 0xff + 987", 6);
  const literal = parseNumberLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new NumberValue(255));
  expect(state.n).toBe(10);
});

/**
 * String literal
 */
test("parseStringLiteral: basic", () => {
  const state = new ParserState(`"hello"`);
  const literal = parseStringLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new StringValue("hello"));
  expect(state.n).toBe(7);
});

test("parseStringLiteral: stops at quote boundary", () => {
  const state = new ParserState(`"hello"123`);
  const literal = parseStringLiteral(state);
  expect(literal).not.toBeNull();
  expect(literal!.value).toEqual(new StringValue("hello"));
  expect(state.n).toBe(7);
});

test("parseStringLiteral: invalid (non-terminated)", () => {
  const state = new ParserState(`"hello`);
  const literal = parseStringLiteral(state);
  expect(literal).toBeNull();
  expect(state.n).toBe(0);
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

test("parseIdentifier: expression-of operator", () => {
  const state = new ParserState("&name");
  const id = parseIdentifier(state);
  expect(id).not.toBeNull();
  expect(id!.name).toBe("&name");
  expect(state.n).toBe(5);
});

/**
 * Comment
 */

test("parseComment: valid", () => {
  const state = new ParserState(
    '# some text with unicode éçà and some "special charaters"'
  );
  const comment = parseComment(state);
  expect(comment).not.toBeNull();
  expect(comment!.line).toBe(state.currentLine);
  expect(comment!.text).toBe(
    'some text with unicode éçà and some "special charaters"'
  );
  expect(state.n).toBe(state.str.length);
});

test("parseComment: trims whitespace at start and end", () => {
  const state = new ParserState("#   \t block text here  \t  \t");
  const comment = parseComment(state);
  expect(comment).not.toBeNull();
  expect(state.n).toBe(state.str.length);
  expect(comment!.line).toBe(state.currentLine);
  expect(comment!.text).toBe("block text here");
});

test("parseComment: stops before EOL", () => {
  const state = new ParserState("# hello \n next line");
  const comment = parseComment(state);
  expect(comment).not.toBeNull();
  expect(state.n).toBe(8);
  expect(comment!.line).toBe(state.currentLine);
  expect(comment!.text).toBe("hello");
});

test("parseComment: invalid (doesn't start with #)", () => {
  const state = new ParserState("a = 12");
  const comment = parseComment(state);
  expect(comment).toBeNull();
  expect(state.n).toBe(0);
});

test("parseComment: heading level 1", () => {
  const state = new ParserState("# title comment");
  const comment = parseComment(state);
  expect(comment).not.toBeNull();
  expect(comment!.text).toBe("title comment");
  expect(comment!.headingLevel).toBe(1);
});

test("parseComment: heading level 2", () => {
  const state = new ParserState("## subtitle");
  const comment = parseComment(state);
  expect(comment).not.toBeNull();
  expect(comment!.text).toBe("subtitle");
  expect(comment!.headingLevel).toBe(2);
});

test("parseComment: heading level 6", () => {
  const state = new ParserState("###### sixth level");
  const comment = parseComment(state);
  expect(comment).not.toBeNull();
  expect(comment!.text).toBe("sixth level");
  expect(comment!.headingLevel).toBe(6);
});

test("parseComment: markerless", () => {
  const state = new ParserState("# hello");
  const comment = parseComment(state);
  expect(comment).not.toBeNull();
  expect(comment!.text).toBe("hello");
  expect(comment!.headingLevel).toBe(1);
  expect(comment!.isMarker).toBe(false);
});

test("parseComment: marker", () => {
  const state = new ParserState("#> hello");
  const comment = parseComment(state);
  expect(comment).not.toBeNull();
  expect(comment!.text).toBe("hello");
  expect(comment!.headingLevel).toBe(1);
  expect(comment!.isMarker).toBe(true);
});

test("parseComment: sublevel marker", () => {
  const state = new ParserState("###> hello");
  const comment = parseComment(state);
  expect(comment).not.toBeNull();
  expect(comment!.text).toBe("hello");
  expect(comment!.headingLevel).toBe(3);
  expect(comment!.isMarker).toBe(true);
});

/**
 * Statement
 */

test("parseStatement: single line", () => {
  const state = new ParserState("a: 12 + 15");
  const statement = parseStatement(state);
  expect(statement).not.toBeNull();
  expect(state.n).toBe(state.str.length);
});
