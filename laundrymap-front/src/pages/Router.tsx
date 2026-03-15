import React from "react";
import { Routes, Route } from "react-router";
import App from "../App";
import Inscription from "./user/inscription.tsx";
import Login from "./user/login.tsx";
import ProLogin from "./pro/login.tsx";
import ProInscription from "./pro/inscription.tsx";
import ProDashboard from "./pro/dashboard.tsx";
import AdminLogin from "./admin/login.tsx";
import AdminDashboard from "./admin/dashboard.tsx";

export default function Router() {
  return (
    <Routes>
      {/* Routes Utilisateur */}
      <Route path="/" element={<App />} />
      <Route path="/user/inscription" element={<Inscription />} />
      <Route path="/user/login" element={<Login />} />

      {/* Routes Professionnel */}
      <Route path="/pro/inscription" element={<ProInscription />} />
      <Route path="/pro/login" element={<ProLogin />} />
      <Route path="/pro/dashboard" element={<ProDashboard />} />

      {/* Routes Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

    </Routes>
  );
}