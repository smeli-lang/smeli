import ace from "ace-builds";

import { Scope, StringValue, StringType } from "@smeli/core";
import { DomNode } from "@smeli/plugin-ui";

import { evaluateAceStyles } from "./styles";

export const editor = {
  name: "editor",
  evaluate: (parentScope: Scope) => {
    const scope = new Scope(parentScope);
    scope.push([
      {
        name: "code",
        evaluate: () => new StringValue("# Hello, World!"),
      },
      {
        name: "#ui:node",
        evaluate: (scope: Scope) => {
          const aceStyles = evaluateAceStyles(scope);

          const code = scope.evaluate("code", StringType) as StringValue;

          const element = document.createElement("pre");
          element.className = aceStyles.editor;

          ace.edit(element, {
            value: code.value,
          });

          return new DomNode(element);
        },
      },
    ]);

    return scope;
  },
};
