export type DrawFunction = (context: CanvasRenderingContext2D) => void;

export class Renderer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  viewport: number[];

  // viewport space to canvas pixels (scale + offset)
  pixelTransformX: number[];
  pixelTransformY: number[];

  private draws: DrawFunction[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;

    // xmin, ymin, xmax, ymax
    this.viewport = [-1, -1, 1, 1];

    this.pixelTransformX = [1, 0];
    this.pixelTransformY = [1, 0];
  }

  queueDraw(drawFunction: DrawFunction) {
    this.draws.push(drawFunction);
  }

  viewportPositionToPixels(x: number, y: number) {
    return {
      x: x * this.pixelTransformX[0] + this.pixelTransformX[1],
      y: y * this.pixelTransformY[0] + this.pixelTransformY[1],
    };
  }

  renderAsync() {
    const allDraws = this.draws.slice(0);
    this.draws.length = 0;

    // redraw next frame (ensures correct layout, aspect ratio, etc.)
    requestAnimationFrame(() => {
      const container = this.canvas.parentElement as HTMLElement;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // avoid dividing by zero later; also there's no point
      // drawing in this case
      if (width === 0 || height === 0) {
        return;
      }

      this.canvas.width = width;
      this.canvas.height = height;

      const viewportWidth = this.viewport[2] - this.viewport[0];
      const viewportHeight = this.viewport[3] - this.viewport[1];

      // transform from viewport space to canvas space in pixels
      const scaleX = width / viewportWidth;
      const scaleY = height / viewportHeight;
      this.pixelTransformX = [scaleX, -this.viewport[0] * scaleX];
      this.pixelTransformY = [scaleY, -this.viewport[1] * scaleY];

      // invert Y axis to match the math convention
      this.context.scale(1, -1);
      this.context.translate(0, -height);

      this.context.font = "16px verdana";

      allDraws.forEach((draw) => draw(this.context));
    });
  }
}
