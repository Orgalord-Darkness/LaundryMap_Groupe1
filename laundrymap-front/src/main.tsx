import { StrictMode, Component } from 'react'
import type { ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { BrowserRouter } from "react-router-dom"
import Router from "./pages/Router.tsx"
import { GoogleOAuthProvider } from "@react-oauth/google"
import {Header} from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { AuthProvider } from "@/components/context/AuthContext"
import { PreferencesProvider } from "@/components/context/PreferencesContext"
import ScrollToTop from "@/components/utils/ScrollToTop"

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
          <p className="text-red-600 dark:text-red-400 font-semibold">Une erreur s'est produite.</p>
          <p className="text-sm text-muted-foreground text-center">{(this.state.error as Error)?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
          >
            Recharger la page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <BrowserRouter>
                    <ScrollToTop />
                    <PreferencesProvider>
                        <AuthProvider>
                            <div className="min-h-screen flex flex-col">
                                <a
                                    href="#main-content"
                                    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[1000] focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline focus:outline-2 focus:outline-primary"
                                >
                                    Aller au contenu
                                </a>
                                <Header />
                                <div id="main-content">
                                    <Router />
                                </div>
                                <Footer />
                            </div>
                        </AuthProvider>
                    </PreferencesProvider>
                </BrowserRouter>
            </GoogleOAuthProvider>
        </ErrorBoundary>
    </StrictMode>
)