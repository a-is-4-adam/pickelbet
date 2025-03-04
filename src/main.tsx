import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "react-error-boundary";
import { Button } from "./components/ui/button.tsx";

function fallbackRender({ error }: { error: Error }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-4 h-screen w-screen"
    >
      <p>Something went wrong:</p>
      <pre className="text-red-500">{error.message}</pre>
      <Button type="button" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackRender={fallbackRender}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
