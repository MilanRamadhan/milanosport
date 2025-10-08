// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.tsx";
// PASTIKAN IMPORT INI BENAR:
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
// import './index.css'; // Opsional: Hapus jika file index.css belum ada

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
