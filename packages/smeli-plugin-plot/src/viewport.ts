import { Scope, StringValue, Vec2 } from "@smeli/core";

// handles all view-space transforms, to and from
// actual pixels
export class Viewport {
  // stored as xmin, ymin, xmax, ymax
  bounds: number[];

  // viewport space to canvas pixels (scale + offset)
  pixelTransformX: number[];
  pixelTransformY: number[];

  // pixel size of the canvas
  pixelSize: Vec2;

  constructor(scope: Scope, pixelSize: Vec2) {
    const center = scope.evaluate("center").as(Vec2);
    const size = scope.evaluate("size").as(Vec2);
    const ratio = scope.evaluate("ratio").as(Vec2);
    const mode = scope.evaluate("mode").as(StringValue).value;

    this.pixelSize = pixelSize;

    let viewportWidth = Math.abs(size.x);
    let viewportHeight = Math.abs(size.y);

    const viewportRatio =
      (viewportWidth * ratio.x) / (viewportHeight * ratio.y);
    const pixelRatio = pixelSize.x / pixelSize.y;

    if (mode === "fit") {
      if (pixelRatio > viewportRatio) {
        viewportWidth = pixelRatio * viewportHeight;
      } else {
        viewportHeight = viewportWidth / pixelRatio;
      }
    } else if (mode === "fill") {
      if (pixelRatio > viewportRatio) {
        viewportHeight = viewportWidth / pixelRatio;
      } else {
        viewportWidth = pixelRatio * viewportHeight;
      }
    } else if (mode !== "stretch") {
      throw new Error(
        `Invalid mode: '${mode}', should be "fit", "fill" or "stretch"`
      );
    }

    // convert to xmin, ymin, xmax, ymax
    const halfWidth = viewportWidth * 0.5;
    const halfHeight = viewportHeight * 0.5;
    this.bounds = [
      center.x - halfWidth,
      center.y - halfHeight,
      center.x + halfWidth,
      center.y + halfHeight,
    ];

    // transform from viewport space to canvas space in pixels
    // invert Y axis to match the math convention
    const scaleX = pixelSize.x / viewportWidth;
    const scaleY = -pixelSize.y / viewportHeight;
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
