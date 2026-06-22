import React from "react";
import ReactDOM from "react-dom/client";
import { ComponentPreview } from "./preview/ComponentPreview";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ComponentPreview />
  </React.StrictMode>,
);

