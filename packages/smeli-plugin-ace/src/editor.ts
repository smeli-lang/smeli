import ace from "ace-builds";

import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-python";

import { Binding, Scope, StringValue } from "@smeli/core";
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

          const element = document.createElement("pre");
          element.className = "container " + aceStyles.editor;

          const editor = ace.edit(element, {
            theme: "ace/theme/monokai",
            mode: "ace/mode/python",
          });

          let override: Binding | null = null;
          editor.session.on("change" as any, () => {
            const code = editor.session.getValue();

            // make sure the override is bound outside the engine update
            setTimeout(() => {
              if (override) {
                scope.pop(override);
              }

              override = {
                name: "code",
                evaluate: () => new StringValue(code),
              };

              scope.push(override);
            }, 0);
          });

          const result = new DomNode(element);

          // cache editor
          return (scope: Scope) => {
            const code = scope.evaluate("code").as(StringValue);

            // guard against infinite recursion
            if (!override) {
              editor.session.setValue(code.value);
              editor.selection.clearSelection();
            }

            return result;
          };
        },
      },
    ]);

    return scope;
  },
};
