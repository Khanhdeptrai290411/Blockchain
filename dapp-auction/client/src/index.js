import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HelmetProvider } from "react-helmet-async";
import ThemeProvider from "./theme/ThemeProvider";
import { SnackbarProvider } from "notistack";
import { EthProvider } from "./contexts/EthContext";
import ErrorBoundary from "./components/ErrorBoundary";

require("dotenv").config();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <EthProvider>
          <SnackbarProvider
            maxSnack={3}
            iconVariant={{
              success: "✅",
              error: "✖️",
              warning: "⚠️",
              info: "ℹ️",
            }}
          >
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </SnackbarProvider>
        </EthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
