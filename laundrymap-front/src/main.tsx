import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router"
import ProLogin from "./pages/pro/login.tsx"
import ProInscription from "./pages/pro/inscription.tsx"

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>

      {/* Utilisateur */}
      {/* Default route */}
      <Route path="/" element={<App />} />
      {/* <Route path="/user/login" element={<Login />} /> */}
      {/* <Route path="/user/login" element={<Login />} /> */}

      {/* Route pour les pages des professionnels */}
      <Route path="/pro/inscription" element={<ProInscription />} />
      <Route path="/pro/login" element={<ProLogin />} />

      {/* Route pour pages admins */}
      {/* <Route path="/admin/login" element={<Login />} /> */}

    </Routes>
  </BrowserRouter>,
)
