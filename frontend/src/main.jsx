import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RoleSimulatorProvider } from "./context/RoleSimulatorContext.jsx";
import { LudotecaProvider } from "./context/LudotecaContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RoleSimulatorProvider>
      <LudotecaProvider>
        <App />
      </LudotecaProvider>
    </RoleSimulatorProvider>
  </StrictMode>
);