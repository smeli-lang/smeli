import { TypedValue } from "./value";

export class Vec2 extends TypedValue {
  static typeName = "vec2";

  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
  }

  swizzle(members: string) {
    const values = Array.from(members).map(name => {
      switch (name) {
        case "x":
        case "r":
          return this.x;

        case "y":
        case "g":
          return this.y;

        default: throw new Error(`Vec2 has no member named '${name}'`);
      }
    });

    return values;
  }
}
