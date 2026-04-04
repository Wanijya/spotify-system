import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { SyncProvider } from "./context/SyncContext.jsx";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <SyncProvider>
      <App />
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </SyncProvider>
  </BrowserRouter>,
);
