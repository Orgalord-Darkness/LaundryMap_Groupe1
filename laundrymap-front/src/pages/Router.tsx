import React from "react";
import { Routes, Route } from "react-router";
import App from "../App";
import ProLogin from "./pro/login.tsx";
import ProInscription from "./pro/inscription.tsx";
import Inscription from "./user/inscription.tsx";

export default function Router() {
  return (
    <Routes>
      {/* Utilisateur */}
      <Route path="/" element={<App />} />
      <Route path="/user/inscription" element={<Inscription />} />

      {/* Route pour les pages des professionnels */}
      <Route path="/pro/inscription" element={<ProInscription />} />
      <Route path="/pro/login" element={<ProLogin />} />
    </Routes>
  );
}