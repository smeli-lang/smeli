import React, { CSSProperties, useEffect, useRef } from "react";
import { smeli } from "@smeli/core";
import { loadPlugin as loadAcePlugin } from "@smeli/plugin-ace";
import { loadPlugin as loadKatexPlugin } from "@smeli/plugin-katex";
import { loadPlugin as loadPlotPlugin } from "@smeli/plugin-plot";
import { loadPlugin as loadUiPlugin } from "@smeli/plugin-ui";

const fullDiv: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
};

const SmeliView = ({
  code,
  hasInnerShadow = false,
}: {
  code: string;
  hasInnerShadow?: boolean;
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const plugins = [
      loadAcePlugin(),
      loadKatexPlugin(),
      loadPlotPlugin(),
      loadUiPlugin({
        container: containerRef.current,
      }),
    ];

    const engine = smeli({ code, plugins });
    engine.next();

    let raf: number = null;
    function update(time: number) {
      engine.update(time);
      raf = requestAnimationFrame(update);
    }
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [containerRef.current, code]);

  return (
    <div style={{ flex: 1, position: "relative" }}>
      <div style={{ ...fullDiv }} ref={containerRef} />
      {hasInnerShadow && (
        <div
          style={{
            ...fullDiv,
            boxShadow: "inset 0 0 4px #444",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

export { SmeliView };
