import React from "react";
import * as ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Error boundary for the entire app
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please try refreshing the page
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import the dev tools and initialize them only in development
if (import.meta.env.DEV && import.meta.env.VITE_TEMPO === "true") {
  import("tempo-devtools")
    .then(({ TempoDevtools }) => {
      TempoDevtools.init();
    })
    .catch((error) => {
      console.error("Failed to initialize Tempo:", error);
    });
}

console.log("Starting app initialization", {
  env: import.meta.env.MODE,
  root: !!document.getElementById("root")
});
const root = document.getElementById("root");

if (!root) {
  console.error("Root element not found");
} else {
  try {
    const rootElement = ReactDOM.createRoot(root);
    // Get the redirect path from sessionStorage if it exists
    const redirectPath = sessionStorage.getItem("redirectPath");
    if (redirectPath) {
      sessionStorage.removeItem("redirectPath");
      window.history.replaceState(null, "", redirectPath);
    }

    rootElement.render(
      <React.StrictMode>
        <ErrorBoundary>
          <HashRouter>
            <App />
          </HashRouter>
        </ErrorBoundary>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error("Error rendering app:", error);
  }
}
