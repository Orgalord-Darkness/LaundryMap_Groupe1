// main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router"
import Router from "./pages/Router.tsx"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { Header } from "@/components/layout/Header"
import { AuthProvider } from "@/components/context/AuthContext"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <Router />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
)