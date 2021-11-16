import React from "react";
import { Root, Routes, addPrefetchExcludes } from "react-static";
import { Link, Router } from "@reach/router";
import Sandbox from "./pages/sandbox";

import "./app.css";

// Any routes that start with 'sandbox' will be treated as non-static routes
addPrefetchExcludes(["sandbox"]);

function App() {
  return (
    <Root>
      <nav>
        <div className="start">
          <Link to="/" className="logo">
            <img src="/images/logo.svg" alt="Smeli" />
          </Link>
        </div>
        <div className="end">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/samples">Samples</Link>
          <Link to="/sandbox">Sandbox</Link>
        </div>
      </nav>
      <div className="content">
        <React.Suspense fallback={<em>Loading...</em>}>
          <Router>
            <Sandbox path="sandbox/*" />
            <Routes path="*" />
          </Router>
        </React.Suspense>
      </div>
      <footer>
        <p>Copyright (c) 2020-2022 Rémi Papillié (@wsmind)</p>
      </footer>
    </Root>
  );
}

export default App;
