import { Scope, StringValue, BoolValue } from "@smeli/core";

import { evaluateUiStyles } from "./styles";
import { DomNode } from "./types";

export const textbox = {
  name: "textbox",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "text",
        evaluate: () => new StringValue(""),
      },
      {
        name: "important",
        evaluate: () => new BoolValue(false),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const styles = evaluateUiStyles(scope);

          const text = scope.evaluate("text").as(StringValue);
          const important = scope.evaluate("important").as(BoolValue);

          const box = document.createElement("div");
          box.className = "widget " + styles.textbox;

          const content = document.createElement("p");
          content.innerHTML = text.value.replace(/\n/g, "<br />");
          content.className = important.value ? "important" : "normal";

          box.appendChild(content);

          return new DomNode(box);
        },
      },
    ]);

    return scope;
  },
};
