import { TypedValue } from "@smeli/core";

import { Viewport } from "./viewport";

export type RenderOptions = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  viewport: Viewport;
};

export type RenderFunction = (options: RenderOptions) => void;

export class PlotItem extends TypedValue {
  static typeName = "plot_item";

  render: RenderFunction;

  constructor(render: RenderFunction) {
    super();

    this.render = render;
  }
}
