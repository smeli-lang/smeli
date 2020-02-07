export class Program {}

export class Assignment {}

export class Expression {}

export class NumberLiteral {
  value: number;

  constructor(value: number) {
    this.value = value;
  }
}

export class Identifier {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}