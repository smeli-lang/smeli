import { TypedValue } from "./value";
import { NumberValue } from "./number";
import { traits } from "./traits";
import { StringValue } from "./string";

export class Vec2 extends TypedValue {
  static typeName = "vec2";

  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
  }
}

traits.add.implement({
  argumentTypes: [Vec2, Vec2],
  returnType: Vec2,
  call(lhs: Vec2, rhs: Vec2): Vec2 {
    return new Vec2(lhs.x + rhs.x, lhs.y + rhs.y);
  },
});

traits.add.implement({
  argumentTypes: [NumberValue, Vec2],
  returnType: Vec2,
  call(lhs: NumberValue, rhs: Vec2): Vec2 {
    return new Vec2(lhs.value + rhs.x, lhs.value + rhs.y);
  },
});

traits.add.implement({
  argumentTypes: [Vec2, NumberValue],
  returnType: Vec2,
  call(lhs: Vec2, rhs: NumberValue): Vec2 {
    return new Vec2(lhs.x + rhs.value, lhs.y + rhs.value);
  },
});

traits.sub.implement({
  argumentTypes: [Vec2, Vec2],
  returnType: Vec2,
  call(lhs: Vec2, rhs: Vec2): Vec2 {
    return new Vec2(lhs.x - rhs.x, lhs.y - rhs.y);
  },
});

traits.sub.implement({
  argumentTypes: [NumberValue, Vec2],
  returnType: Vec2,
  call(lhs: NumberValue, rhs: Vec2): Vec2 {
    return new Vec2(lhs.value - rhs.x, lhs.value - rhs.y);
  },
});

traits.sub.implement({
  argumentTypes: [Vec2, NumberValue],
  returnType: Vec2,
  call(lhs: Vec2, rhs: NumberValue): Vec2 {
    return new Vec2(lhs.x - rhs.value, lhs.y - rhs.value);
  },
});

traits.mul.implement({
  argumentTypes: [Vec2, Vec2],
  returnType: Vec2,
  call(lhs: Vec2, rhs: Vec2): Vec2 {
    return new Vec2(lhs.x * rhs.x, lhs.y * rhs.y);
  },
});

traits.mul.implement({
  argumentTypes: [NumberValue, Vec2],
  returnType: Vec2,
  call(lhs: NumberValue, rhs: Vec2): Vec2 {
    return new Vec2(lhs.value * rhs.x, lhs.value * rhs.y);
  },
});

traits.mul.implement({
  argumentTypes: [Vec2, NumberValue],
  returnType: Vec2,
  call(lhs: Vec2, rhs: NumberValue): Vec2 {
    return new Vec2(lhs.x * rhs.value, lhs.y * rhs.value);
  },
});

traits.div.implement({
  argumentTypes: [Vec2, Vec2],
  returnType: Vec2,
  call(lhs: Vec2, rhs: Vec2): Vec2 {
    return new Vec2(lhs.x / rhs.x, lhs.y / rhs.y);
  },
});

traits.div.implement({
  argumentTypes: [NumberValue, Vec2],
  returnType: Vec2,
  call(lhs: NumberValue, rhs: Vec2): Vec2 {
    return new Vec2(lhs.value / rhs.x, lhs.value / rhs.y);
  },
});

traits.div.implement({
  argumentTypes: [Vec2, NumberValue],
  returnType: Vec2,
  call(lhs: Vec2, rhs: NumberValue): Vec2 {
    return new Vec2(lhs.x / rhs.value, lhs.y / rhs.value);
  },
});

traits.str.implement({
  argumentTypes: [Vec2],
  returnType: StringValue,
  call: (vec: Vec2) => new StringValue(`vec2(${vec.x}, ${vec.y})`),
});
