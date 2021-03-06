import { evaluate, nativeBinding, Scope, StringValue, Vec3 } from "@smeli/core";
import { DomNode } from "./types";

import { outline } from "./outline";
import { shader } from "./shader";
import { stack } from "./stack";
import { surface } from "./surface";
import { slider } from "./slider";
import { textbox } from "./textbox";

import { styles, evaluateUiStyles } from "./styles";
import { themeCode } from "./theme";

// this is temporary, it will be replaced by theme evaluation
// on the global scope
export * from "./theme";

export * from "./types";
export { evaluateUiStyles };

export type UiPluginOptions = {
  container?: HTMLElement;
};

export const loadPlugin = ({
  container = document.body,
}: UiPluginOptions = {}) => {
  container.innerHTML = "";

  return {
    name: "ui",
    sideEffects: ["#update"],
    bindings: [
      {
        name: "page",
        evaluate: () => evaluate("outline"),
      },
      nativeBinding("color_from_hex", [
        {
          argumentTypes: [StringValue],
          returnType: Vec3,
          call: (hexString: StringValue): Vec3 => {
            let hex = hexString.value;

            if (hex.length === 0) {
              throw new Error("Invalid color: empty string");
            }

            if (hex[0] === "#") {
              hex = hex.substr(1);
            }

            hex = hex.toLowerCase();
            if (hex.length === 3) {
              hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }

            if (!hex.match(/[0-9a-f]{6}/)) {
              throw new Error(
                "Invalid color: must be exactly 3 or 6 hex digits"
              );
            }

            const r = parseInt(hex.substr(0, 2), 16) / 255.0;
            const g = parseInt(hex.substr(2, 2), 16) / 255.0;
            const b = parseInt(hex.substr(4, 2), 16) / 255.0;

            return new Vec3(r, g, b);
          },
        },
      ]),
      {
        name: "#update",
        evaluate: () => {
          const styles = evaluateUiStyles();
          container.className = styles.container;

          // cache style
          return () => {
            const page = evaluate("page").as(Scope);

            // cache page
            return () => {
              const node = evaluate("#ui:node", page).as(DomNode);

              // diff with currently displayed page
              if (!container.hasChildNodes()) {
                container.appendChild(node.node);
              } else {
                const firstChild = container.firstChild;
                if (firstChild !== node.node) {
                  // the hasChildNode() test guarantees a valid first child here
                  container.replaceChild(node.node, firstChild as Node);
                }
              }

              return node;
            };
          };
        },
      },

      outline,
      shader,
      stack,
      surface,
      slider,
      textbox,

      styles,
    ],

    code: `
    ${themeCode}
    `,
  };
};
