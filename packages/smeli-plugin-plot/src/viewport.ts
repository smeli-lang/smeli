import { Scope, Vec2 } from "@smeli/core";

// handles all view-space transforms, to and from
// actual pixels
export class Viewport {
  // stored as xmin, ymin, xmax, ymax
  bounds: number[];

  // viewport space to canvas pixels (scale + offset)
  pixelTransformX: number[];
  pixelTransformY: number[];

  constructor(scope: Scope, pixelSize: Vec2) {
    const center = scope.evaluate("center").as(Vec2);
    const size = scope.evaluate("size").as(Vec2);

    // convert to xmin, ymin, xmax, ymax
    const halfWidth = Math.abs(size.x) * 0.5;
    const halfHeight = Math.abs(size.y) * 0.5;
    this.bounds = [
      center.x - halfWidth,
      center.y - halfHeight,
      center.x + halfWidth,
      center.y + halfHeight,
    ];

    // transform from viewport space to canvas space in pixels
    // invert Y axis to match the math convention
    const scaleX = pixelSize.x / size.x;
    const scaleY = -pixelSize.y / size.y;
    this.pixelTransformX = [scaleX, -this.bounds[0] * scaleX];
    this.pixelTransformY = [scaleY, -this.bounds[3] * scaleY]; // use max because of axis inversion
  }

  toPixels(x: number, y: number) {
    return {
      x: x * this.pixelTransformX[0] + this.pixelTransformX[1],
      y: y * this.pixelTransformY[0] + this.pixelTransformY[1],
    };
  }
}
