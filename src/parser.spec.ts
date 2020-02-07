import { parseNumberLiteral, ParsingState } from "./parser";

test("parseNumberLiteral: single number", () => {
  let state: ParsingState = { str: "125", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal.value).toBe(125);
  expect(state.n).toBe(3);
});

test("parseNumberLiteral: followed by operator", () => {
  let state: ParsingState = { str: "87456+12", n: 0 };
  const literal = parseNumberLiteral(state);
  expect(literal.value).toBe(87456);
  expect(state.n).toBe(5);
});
