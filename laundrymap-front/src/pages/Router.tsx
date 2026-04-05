// import { Routes, Route } from "react-router";
// import App from "../App";
// import Inscription from "./user/inscription.tsx";
// import Login from "./user/login.tsx";
// import ProLogin from "./pro/login.tsx";
// import ProInscription from "./pro/inscription.tsx";
// import ProDashboard from "./pro/dashboard.tsx";
// import AdminLogin from "./admin/login.tsx";
// import AdminDashboard from "./admin/dashboard.tsx";
// import ProfessionnalAccountValidationList from "./admin/professionalAdministration/professionalAccountValidationList.tsx";

// export default function Router() {
//   return (
//     <Routes>
//       {/* Routes Utilisateur */}
//       <Route path="/" element={<App />} />
//       <Route path="/user/inscription" element={<Inscription />} />
//       <Route path="/user/login" element={<Login />} />

//       {/* Routes Professionnel */}
//       <Route path="/pro/inscription" element={<ProInscription />} />
//       <Route path="/pro/login" element={<ProLogin />} />
//       <Route path="/pro/dashboard" element={<ProDashboard />} />

//       {/* Routes Admin */}
//       <Route path="/admin/login" element={<AdminLogin />} />
//       <Route path="/admin/dashboard" element={<AdminDashboard />} />
//       <Route path="/admin/professionnalAdministration/professionnalAccountValidationList" element={<ProfessionnalAccountValidationList />} />

//     </Routes>
//   );
// }



// router/Router.tsx
import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "../components/context/AuthContext";
import type { Role } from "../components/utils/auth";
import App from "../App";
import Inscription from "./user/inscription";
import Login from "./user/login";
import MonProfil from "./user/informations";
import ProLogin from "./pro/login";
import ProInscription from "./pro/inscription";
import ProDashboard from "./pro/dashboard";
import AdminLogin from "./admin/login";
import AdminDashboard from "./admin/dashboard";

import AdminValidationLaverie from "./admin/laveries/validation";
import ProfessionnalAccountValidationList from "./admin/professionalAdministration/professionalAccountValidationList";
import AddLaundry from "./pro/addLaundry";

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    if (role === "guest")          return <Navigate to="/" replace />;
    if (role === "utilisateur")    return <Navigate to="/" replace />;
    if (role === "professionnel")  return <Navigate to="/pro/dashboard" replace />;
    if (role === "administrateur") return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function Router() {
  return (
    <Routes>
      {/* ── Publiques ── */}
      <Route path="/" element={<App />} />
      <Route path="/user/inscription" element={<Inscription />} />
      <Route path="/user/login" element={<Login />} />
      <Route path="/user/informations" element={<MonProfil />} />
      <Route path="/pro/inscription" element={<ProInscription />} />
      <Route path="/pro/login" element={<ProLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* ── Professionnel ── */}
      <Route path="/pro/dashboard" element={
        <ProtectedRoute allowedRoles={["professionnel"]}>
          <ProDashboard />
        </ProtectedRoute>
      } />

      <Route path="/addLaundry" element={
        <ProtectedRoute allowedRoles={["professionnel"]}>
          <AddLaundry />
        </ProtectedRoute>
      } />


      {/* ── Admin ── */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={["administrateur"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin/laveries/validation" element={
        <ProtectedRoute allowedRoles={["administrateur"]}>
          <AdminValidationLaverie />
        </ProtectedRoute>
      } />
      <Route path="/admin/professionnalAdministration/professionnalAccountValidationList" element={
        <ProtectedRoute allowedRoles={["administrateur"]}>
          <ProfessionnalAccountValidationList />
        </ProtectedRoute>
      } />

      {/* ── Fallback 404 → accueil ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}