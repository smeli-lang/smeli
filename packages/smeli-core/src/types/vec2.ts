import { TypedValue } from "./value";
import { NumberValue } from "./number";

export class Vec2 extends TypedValue {
  static typeName = "vec2";

  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
  }

  __add__(rhs: TypedValue): TypedValue {
    const vec2 = rhs.as(Vec2);
    return new Vec2(this.x + vec2.x, this.y + vec2.y);
  }

  __sub__(rhs: TypedValue): TypedValue {
    const vec2 = rhs.as(Vec2);
    return new Vec2(this.x - vec2.x, this.y - vec2.y);
  }

  __mul__(rhs: TypedValue): TypedValue {
    const factor = rhs.as(NumberValue).value;
    return new Vec2(this.x * factor, this.y * factor);
  }

  __div__(rhs: TypedValue): TypedValue {
    const factor = 1.0 / rhs.as(NumberValue).value;
    return new Vec2(this.x * factor, this.y * factor);
  }

  __str__() {
    return `vec2(${this.x}, ${this.y})`;
  }
}
