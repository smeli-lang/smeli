import { TypedValue } from "@smeli/core";

import { Renderer } from "./renderer";

export type PrepareFunction = (renderer: Renderer) => void;

export class PlotItem extends TypedValue {
  static typeName = "plot_item";

  prepareFunction: PrepareFunction;

  constructor(prepareFunction: PrepareFunction) {
    super();

    this.prepareFunction = prepareFunction;
  }
}
