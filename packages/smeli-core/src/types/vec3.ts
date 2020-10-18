import { TypedValue } from "./value";
import { NumberValue } from "./number";
import { traits } from "./traits";
import { StringValue } from "./string";

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
}

traits.add.implement({
  argumentTypes: [Vec3, Vec3],
  returnType: Vec3,
  call(lhs: Vec3, rhs: Vec3): Vec3 {
    return new Vec3(lhs.x + rhs.x, lhs.y + rhs.y, lhs.z + rhs.y);
  },
});

traits.add.implement({
  argumentTypes: [NumberValue, Vec3],
  returnType: Vec3,
  call(lhs: NumberValue, rhs: Vec3): Vec3 {
    return new Vec3(lhs.value + rhs.x, lhs.value + rhs.y, lhs.value + rhs.z);
  },
});

traits.add.implement({
  argumentTypes: [Vec3, NumberValue],
  returnType: Vec3,
  call(lhs: Vec3, rhs: NumberValue): Vec3 {
    return new Vec3(lhs.x + rhs.value, lhs.y + rhs.value, lhs.z + rhs.value);
  },
});

traits.sub.implement({
  argumentTypes: [Vec3, Vec3],
  returnType: Vec3,
  call(lhs: Vec3, rhs: Vec3): Vec3 {
    return new Vec3(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.y);
  },
});

traits.sub.implement({
  argumentTypes: [NumberValue, Vec3],
  returnType: Vec3,
  call(lhs: NumberValue, rhs: Vec3): Vec3 {
    return new Vec3(lhs.value - rhs.x, lhs.value - rhs.y, lhs.value - rhs.z);
  },
});

traits.sub.implement({
  argumentTypes: [Vec3, NumberValue],
  returnType: Vec3,
  call(lhs: Vec3, rhs: NumberValue): Vec3 {
    return new Vec3(lhs.x - rhs.value, lhs.y - rhs.value, lhs.z - rhs.value);
  },
});

traits.mul.implement({
  argumentTypes: [Vec3, Vec3],
  returnType: Vec3,
  call(lhs: Vec3, rhs: Vec3): Vec3 {
    return new Vec3(lhs.x * rhs.x, lhs.y * rhs.y, lhs.z * rhs.y);
  },
});

traits.mul.implement({
  argumentTypes: [NumberValue, Vec3],
  returnType: Vec3,
  call(lhs: NumberValue, rhs: Vec3): Vec3 {
    return new Vec3(lhs.value * rhs.x, lhs.value * rhs.y, lhs.value * rhs.z);
  },
});

traits.mul.implement({
  argumentTypes: [Vec3, NumberValue],
  returnType: Vec3,
  call(lhs: Vec3, rhs: NumberValue): Vec3 {
    return new Vec3(lhs.x * rhs.value, lhs.y * rhs.value, lhs.z * rhs.value);
  },
});

traits.div.implement({
  argumentTypes: [Vec3, Vec3],
  returnType: Vec3,
  call(lhs: Vec3, rhs: Vec3): Vec3 {
    return new Vec3(lhs.x / rhs.x, lhs.y / rhs.y, lhs.z / rhs.y);
  },
});

traits.div.implement({
  argumentTypes: [NumberValue, Vec3],
  returnType: Vec3,
  call(lhs: NumberValue, rhs: Vec3): Vec3 {
    return new Vec3(lhs.value / rhs.x, lhs.value / rhs.y, lhs.value / rhs.z);
  },
});

traits.div.implement({
  argumentTypes: [Vec3, NumberValue],
  returnType: Vec3,
  call(lhs: Vec3, rhs: NumberValue): Vec3 {
    return new Vec3(lhs.x / rhs.value, lhs.y / rhs.value, lhs.z / rhs.value);
  },
});

traits.str.implement({
  argumentTypes: [Vec3],
  returnType: StringValue,
  call: (vec: Vec3) => new StringValue(`vec3(${vec.x}, ${vec.y}, ${vec.z})`),
});
