import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { BrowserRouter } from "react-router-dom"
import Router from "./pages/Router.tsx"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { AuthProvider } from "@/components/context/AuthContext"

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                <AuthProvider>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1 pt-[72px]">
                            <Router />
                        </main>
                        <Footer />
                    </div>
                </AuthProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </StrictMode>
)