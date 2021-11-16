import React from "react";
import { Link } from "@reach/router";

export default () => (
  <div style={{ textAlign: "center" }}>
    <p>
      <img src="/images/logo.svg" alt="Smeli" />
    </p>
    <p>
      Checkout the <Link to="/samples">Samples</Link> or{" "}
      <a href="https://github.com/smeli-lang/smeli">GitHub Project</a>
    </p>
  </div>
);
