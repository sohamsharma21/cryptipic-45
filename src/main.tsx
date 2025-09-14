
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Get the root element and ensure it exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found in the document. Make sure there's an element with id 'root'");
}

// Create and render the root
const root = createRoot(rootElement);
root.render(<App />);
