import { TypedValue } from "./value";
import { NumberValue } from "./number";

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

  toCssColor(alpha?: number): string {
    if (alpha !== undefined) {
      return `rgba(${this.x * 255.0}, ${this.y * 255.0}, ${
        this.z * 255.0
      }, ${alpha})`;
    } else {
      return `rgb(${this.x * 255.0}, ${this.y * 255.0}, ${this.z * 255.0})`;
    }
  }

  __add__(rhs: TypedValue): TypedValue {
    const vec3 = rhs.as(Vec3);
    return new Vec3(this.x + vec3.x, this.y + vec3.y, this.z + vec3.z);
  }

  __sub__(rhs: TypedValue): TypedValue {
    const vec3 = rhs.as(Vec3);
    return new Vec3(this.x - vec3.x, this.y - vec3.y, this.z - vec3.z);
  }

  __mul__(rhs: TypedValue): TypedValue {
    const factor = rhs.as(NumberValue).value;
    return new Vec3(this.x * factor, this.y * factor, this.z * factor);
  }

  __div__(rhs: TypedValue): TypedValue {
    const factor = 1.0 / rhs.as(NumberValue).value;
    return new Vec3(this.x * factor, this.y * factor, this.z * factor);
  }

  __str__() {
    return `vec3(${this.x}, ${this.y}, ${this.z})`;
  }
}
