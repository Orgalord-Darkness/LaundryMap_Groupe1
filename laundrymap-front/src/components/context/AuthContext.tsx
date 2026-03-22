import { createContext, useContext, useState, useEffect } from "react";
import { getRoleFromToken, type Role } from "../utils/auth";
import { jwtDecode } from "jwt-decode";  

interface AuthUser {
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  role: Role;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
      const token = localStorage.getItem("token")
      const role = getRoleFromToken(token)
      console.log("Role extrait du token:", role)
  }, [])

  const login = (token: string) => {
      const role = getRoleFromToken(token)
      if (role === "guest") return
      const decoded = jwtDecode<{ email: string }>(token)
      localStorage.setItem("token", token);
      setUser({ email: decoded.email, role })
  }

  const logout = () => {
      localStorage.removeItem("token")
      setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role ?? "guest",
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