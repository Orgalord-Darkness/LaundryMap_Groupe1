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
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
import type { Role } from "../components/utils/auth";
import App from "../App";
import Inscription from "./user/inscription";
import Login from "./user/login";
import MonProfil from "./user/informations";
import Verification from "./user/verification";
import ResendVerification from "./user/resend-verification";
import ForgotPassword from "./user/forgot-password";
import ResetPassword from "./user/reset-password";
import ProLogin from "./pro/login";
import ProInscription from "./pro/inscription";
import ProDashboard from "./pro/dashboard";
import AdminLogin from "./admin/login";
import AdminDashboard from "./admin/dashboard";
import AdminValidationLaverieForm from "./admin/laveries/formLaverieValidation.tsx";
import AdminValidationAccountForm from "./admin/professional/formProfessionnelValidation.tsx";
import FormEditLaverie from "./pro/editLaundry"; 
import AdminValidationLaverie from "./admin/laveries/list.tsx";
import ProfessionnalAccountValidationList from "./admin/professional/list.tsx";
import NewPassword from '@/components/layout/NewPassword'; 
import AddLaundry from "./pro/addLaundry";
import { FavorisList } from "./user/FavorisList";

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { role, isLoading } = useAuth();

  if (isLoading) return null;

  if (!allowedRoles.includes(role)) {
    if (role === "guest")          return <Navigate to="/" replace />;
    if (role === "utilisateur")    return <Navigate to="/" replace />;
    if (role === "professionnel")  return <Navigate to="/pro/dashboard" replace />;
    if (role === "administrateur") return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

// function ProtectedRoute({ children, allowedRoles }) {
//   const { role } = useAuth();

//   if (!allowedRoles.includes(role)) {
//     if (role === "guest")          return <Navigate to="/" replace />;
//     if (role === "utilisateur")    return <Navigate to="/" replace />;
//     if (role === "professionnel")  return <Navigate to="/pro/dashboard" replace />;
//     if (role === "administrateur") return <Navigate to="/admin/dashboard" replace />;
//   }

//   return <>{children}</>;
// }


export default function Router() {
  return (
    <Routes>
      {/* ── Publiques ── */}
      <Route path="/" element={<App />} />
      <Route path="/user/inscription" element={<Inscription />} />
      <Route path="/user/login" element={<Login />} />
      <Route path="/user/informations" element={<MonProfil />} />
      <Route path="/user/verification/:token" element={<Verification />} />
      <Route path="/user/resend-verification" element={<ResendVerification />} />
      <Route path="/user/mot-de-passe-oublie" element={<ForgotPassword />} />
      <Route path="/user/mot-de-passe/reinitialisation/:token" element={<ResetPassword />} />
      <Route path="/user/new-password" element={<NewPassword/>} />
      <Route path="/pro/inscription" element={<ProInscription />} />
      <Route path="/pro/login" element={<ProLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/user/favoris" element={<FavorisList />} />

      <Route path="/admin/laverie/:id" element={
        <ProtectedRoute allowedRoles={["administrateur"]}>
          <AdminValidationLaverieForm />
        </ProtectedRoute>
      } />

      <Route path="/admin/professionnel/:id" element={
        <ProtectedRoute allowedRoles={["administrateur"]}>
          <AdminValidationAccountForm />
        </ProtectedRoute>
      } />
      
      <Route path="/pro/laverie/:id" element={
        <ProtectedRoute allowedRoles={["professionnel"]}>
          <FormEditLaverie />
        </ProtectedRoute>
      } />

      
      {/* ── Professionnel ── */}
      <Route path="/pro/dashboard" element={
        <ProtectedRoute allowedRoles={["professionnel"]}>
          <ProDashboard />
        </ProtectedRoute>
      } />
      <Route path="/pro/informations" element={
        <ProtectedRoute allowedRoles={["professionnel"]}>
          <MonProfil />
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
      <Route
        path="/admin/professionnal/validation"
        element={
          <ProtectedRoute allowedRoles={["administrateur"]}>
            <ProfessionnalAccountValidationList />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/laveries/list" element={
        <ProtectedRoute allowedRoles={["administrateur"]}>
          <AdminValidationLaverie />
        </ProtectedRoute>
      } />
      {/* <Route path="/admin/laveries/formLaverieValidation" element={
        <ProtectedRoute allowedRoles={["administrateur"]}>
          <AdminValidationLaverieForm />
        </ProtectedRoute>
      } /> */}
      <Route path="/admin/professional/list" element={
        <ProtectedRoute allowedRoles={["administrateur"]}>
          <ProfessionnalAccountValidationList />
        </ProtectedRoute>
      } />

      {/* ── Fallback 404 → accueil ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}