import { TypedValue } from "./value";

export class Vec3 extends TypedValue {
  static typeName = "vec3";

  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    super();

    this.x = x;
    this.y = y;
    this.z = z;
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

        case "z":
        case "b":
          return this.z;
    
        default: throw new Error(`Vec2 has no member named '${name}'`);
      }
    });

    return values;
  }

  toCssColor(alpha?: number): string {
    if (alpha !== undefined) {
      return `rgba(${this.x * 255.0}, ${this.y * 255.0}, ${
        this.z * 255.0
      }, ${alpha})`;
    } else {
      return `rgb(${this.x * 255.0}, ${this.y * 255.0}, ${this.z * 255.0})`;
    }
  }
}
