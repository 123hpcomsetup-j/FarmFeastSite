import { createRoot } from "react-dom/client";
import App from "./App-simplified";
import "./index.css";

// Production debugging: Add error handling for React mounting
console.log("React app starting...");

try {
  // Import performance testing utility
  if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    import('./utils/performanceTest.js');
  }

  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = createRoot(rootElement);
  console.log("React root created successfully");
  
  root.render(<App />);
  console.log("React app rendered successfully");
} catch (error) {
  console.error("React mounting failed:", error);
  
  // Fallback: Show basic content if React fails
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>Loading...</h1>
        <p>If this message persists, please refresh the page.</p>
        <script>setTimeout(() => location.reload(), 3000);</script>
      </div>
    `;
  }
}
