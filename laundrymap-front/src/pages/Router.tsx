import { Routes, Route } from "react-router";
import App from "../App";
import ProLogin from "./pro/login.tsx";
import ProInscription from "./pro/inscription.tsx";
import Inscription from "./user/inscription.tsx";
import Login from "./user/login.tsx";
import Informations from "./user/informations.tsx"; 

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/user/inscription" element={<Inscription />} />
      <Route path="/user/login" element={<Login />} />
       <Route path="/user/informations" element={<Informations />} />

      <Route path="/pro/inscription" element={<ProInscription />} />
      <Route path="/pro/login" element={<ProLogin />} />
    </Routes>
  );
}