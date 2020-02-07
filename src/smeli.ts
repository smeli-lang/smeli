import { NumberLiteral } from "./ast";
import { parseNumberLiteral } from "./parser";

export default class Smeli {
  program: NumberLiteral;

  constructor(code: string) {
    this.program = parseNumberLiteral({ str: code, n: 0 });
  }
}
