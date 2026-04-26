import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getRoleFromToken, type Role } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

interface AuthUser {
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  role: Role;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setUser(null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = getRoleFromToken(token)

    if (role !== "guest" && token) {
      try {
        const decoded = jwtDecode<{ email: string; exp: number }>(token);
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
        } else {
          setUser({ email: decoded.email, role });
        }
      } catch {
        localStorage.removeItem("token");
      }
    }

    setIsLoading(false);
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const decoded = jwtDecode<{ exp: number }>(token);
        if (decoded.exp * 1000 < Date.now()) logout();
      } catch {
        logout();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [logout]);

  const login = (token: string) => {
    const role = getRoleFromToken(token)
    if (role === "guest") return

    try {
      const decoded = jwtDecode<{ email: string; exp: number }>(token);
      if (decoded.exp * 1000 < Date.now()) return;
      localStorage.setItem("token", token);
      setUser({ email: decoded.email, role });
    } catch {
      return;
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? "guest",
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être dans AuthProvider");
  return ctx;
};