import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getRoleFromSymfonyRoles, type Role } from "../utils/auth";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface AuthUser {
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  role: Role;
  isLoading: boolean;
  login: (userInfo: { email: string; role: string }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO(human): Restauration de session — appelle GET /api/v1/auth/me avec
    // withCredentials: true pour vérifier si un cookie BEARER valide existe.
    // Si 200 → utilise getRoleFromSymfonyRoles(data.roles) et setUser({ email, role })
    // Si 401 → setUser(null)
    // Dans le finally → setIsLoading(false)
    setIsLoading(true);
    axios.get(`${API_BASE}/api/v1/auth/me`, {withCredentials:true}).then(
      (response) => {
      const email = response.data.email;
      const role = getRoleFromSymfonyRoles(response.data.roles)
      setUser({email, role})
      }
    ).catch(() => {
      setUser(null)
    }).finally( () => {
      setIsLoading(false)
    }
    );
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API_BASE}/api/v1/auth/logout`, {}, { withCredentials: true });
    } finally {
      setUser(null);
    }
  }, []);

  const login = ({ email, role }: { email: string; role: string }) => {
    const mappedRole = getRoleFromSymfonyRoles([role]);
    if (mappedRole === "guest") return;
    setUser({ email, role: mappedRole });
  };

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
