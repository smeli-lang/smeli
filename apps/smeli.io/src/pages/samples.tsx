import React from "react";
import { useRouteData } from "react-static";
import { Link } from "@reach/router";
import { Sample } from "types";
import { SmeliView } from "../components";

import "./samples.css";

export default () => {
  const {
    samples,
    currentSample,
    background,
  }: { samples: Sample[]; currentSample?: Sample; background?: Sample } =
    useRouteData();

  return (
    <div className={"sample-page" + (currentSample ? "" : " display-menu")}>
      <div className="sample-list">
        <h2>
          {currentSample ? (
            <>
              <Link to="/samples">Samples</Link>
              {` > ${currentSample.title}`}
            </>
          ) : (
            "All Samples"
          )}
        </h2>
        <hr />
        <ul>
          {samples.map((sample) => (
            <li key={sample.name}>
              <Link
                to={`/samples/${sample.name}`}
                className={
                  currentSample && sample.name === currentSample.name
                    ? "selected"
                    : ""
                }
              >
                <h3>{sample.title}</h3>
                <p>{sample.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {currentSample ? (
        <SmeliView code={currentSample.code} hasInnerShadow={true} />
      ) : (
        <div className="explore">
          <div className="background">
            <SmeliView code={background.code} />
          </div>
          <div>
            <h1>Explore Samples</h1>
            <p>Use the left panel to browse samples.</p>
          </div>
          <div className="spacer" />
          <div className="highlights">
            <h2>Highlights</h2>
            <ul>
              <li>
                <Link to="/samples/shaders">
                  <img src="/images/shaders.jpg" />
                  <h2>Shaders</h2>
                </Link>
              </li>
              <li>
                <Link to="/samples/plots">
                  <img src="/images/plots.jpg" />
                  <h2>Plots</h2>
                </Link>
              </li>
              <li>
                <Link to="/samples/shader-editor">
                  <img src="/images/shader-editor.jpg" />
                  <h2>Shader Editor</h2>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
