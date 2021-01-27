import {
  createChildScope,
  StringValue,
  BoolValue,
  NumberValue,
  evaluate,
} from "@smeli/core";

import { evaluateUiStyles } from "./styles";
import { DomNode } from "./types";

export const textbox = {
  name: "textbox",
  evaluate: () =>
    createChildScope([
      {
        name: "text",
        evaluate: () => new StringValue(""),
      },
      {
        name: "important",
        evaluate: () => new BoolValue(false),
      },
      {
        name: "size",
        evaluate: () => new NumberValue(1.0),
      },
      {
        name: "#ui:node",
        evaluate: () => {
          const styles = evaluateUiStyles();

          const text = evaluate("text").as(StringValue);
          const important = evaluate("important").as(BoolValue);
          const size = evaluate("size").as(NumberValue);

          const box = document.createElement("div");
          box.className = "widget " + styles.textbox;

          const content = document.createElement("p");
          content.innerHTML = text.value.replace(/\n/g, "<br />");
          content.className = important.value ? "important" : "normal";
          content.style.fontSize = size.value + "em";

          box.appendChild(content);

          return new DomNode(box);
        },
      },
    ]),
};
