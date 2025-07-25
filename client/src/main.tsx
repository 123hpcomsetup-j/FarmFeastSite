import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import performance testing utility
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  import('./utils/performanceTest.js');
}

createRoot(document.getElementById("root")!).render(<App />);
