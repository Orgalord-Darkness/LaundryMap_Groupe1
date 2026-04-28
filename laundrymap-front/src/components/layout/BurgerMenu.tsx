import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import { Icon } from "@/components/ui/icons";

type Role = "guest" | "utilisateur" | "professionnel" | "administrateur";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  separator?: boolean;
}

function getMenuItems(role: Role): MenuItem[] {
  switch (role) {
    case "guest":
      return [
        { label: "Accueil", href: "/", icon: <Icon.Home /> },
        { label: "Se connecter / S'inscrire", href: "/user/login", icon: <Icon.Login /> },
        { label: "Se connecter en admin", href: "/admin/login", icon: <Icon.Login /> },
      ];
    case "utilisateur":
      return [
        { label: "Accueil", href: "/", icon: <Icon.Home /> },
        { label: "Mon profil", href: "/user/informations", icon: <Icon.User /> },
        { label: "Mes favoris", href: "/user/favoris", icon: <Icon.Heart /> },
        { label: "Mes préférences", href: "/user/preferences", icon: <Icon.Sliders /> },
        { label: "Mes avis et commentaires", href: "/user/avis", icon: <Icon.Chat /> },
        { label: "Déconnexion", href: "/logout", icon: <Icon.Logout />, separator: true },
      ];
    case "professionnel":
      return [
        { label: "Tableau de bord", href: "/pro/dashboard", icon: <Icon.Home /> },
        { label: "Mes informations", href: "/pro/informations", icon: <Icon.Info /> },
        { label: "Mes préférences", href: "/pro/preferences", icon: <Icon.Sliders /> },
        { label: "Déconnexion", href: "/logout", icon: <Icon.Logout />, separator: true },
      ];
    case "administrateur":
      return [
        { label: "Tableau de bord", href: "/admin/dashboard", icon: <Icon.Home /> },
        { label: "Laveries", href: "/admin/laveries/list", icon: <Icon.Laundry /> },
        { label: "Comptes", href: "/admin/professional/list", icon: <Icon.People /> },
        { label: "Messages signalés", href: "/admin/messages", icon: <Icon.Flag /> },
        { label: "Mes informations", href: "/admin/informations", icon: <Icon.Info />, separator: true },
        { label: "Mes préférences", href: "/admin/preferences", icon: <Icon.Sliders /> },
        { label: "Historique compte", href: "/admin/historique-compte", icon: <Icon.History />, separator: true },
        { label: "Historique laverie", href: "/admin/historique-laverie", icon: <Icon.History /> },
        { label: "Mots interdits", href: "/admin/mots-interdits", icon: <Icon.Ban /> },
        { label: "Déconnexion", href: "/logout", icon: <Icon.Logout />, separator: true },
      ];
  }
}

const badgeConfig: Record<Role, { label: string; bg: string; color: string }> = {
  guest:          { label: "Visiteur",       bg: "#f5f5f5", color: "#555" },
  utilisateur:    { label: "Utilisateur",    bg: "#e3f2fd", color: "#1565c0" },
  professionnel:  { label: "Professionnel",  bg: "#e8f5e9", color: "#2e7d32" },
  administrateur: { label: "Administrateur", bg: "#fff3e0", color: "#e65100" },
};

export function BurgerMenu() {
  const { role, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const menuItems = getMenuItems(role as Role);
  const badge = badgeConfig[role as Role] ?? badgeConfig.guest;

  const isActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname.startsWith(href);

  const handleItemClick = (href: string, label: string) => {
    if (label === "Déconnexion") {
      logout();
      navigate("/");
    } else {
      navigate(href);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton burger — bleu foncé sur fond clair = contraste élevé, fidèle à la maquette */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu"
        style={{
          background: "#0e6b8a",
          border: "none",
          borderRadius: "10px",
          width: "48px",
          height: "48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 998,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* Sidebar — à GAUCHE */}
      <div
        ref={menuRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "280px", height: "100vh",
          background: "#ffffff",
          zIndex: 999,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex", flexDirection: "column",
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* En-tête sidebar avec dégradé */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px",
          background: "linear-gradient(90deg, #1ab3d8 0%, #4ecfee 100%)",
        }}>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
            style={{
              background: "#0e6b8a",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              color: "white",
              display: "flex",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {menuItems.map((item, i) => (
            <div key={i}>
              {item.separator && (
                <hr style={{ border: "none", borderTop: "1px solid #e8e8e8", margin: "6px 0" }} />
              )}
              <button
                onClick={() => handleItemClick(item.href, item.label)}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  width: "100%", padding: "12px 24px",
                  background: isActive(item.href) ? "#e0f7fb" : "none",
                  border: "none", cursor: "pointer", textAlign: "left",
                  color: isActive(item.href) ? "#0e6b8a" : "#222",
                  fontWeight: isActive(item.href) ? 700 : 400,
                  fontSize: "15px", fontFamily: "inherit",
                  borderLeft: isActive(item.href) ? "4px solid #1ab3d8" : "4px solid transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span style={{ color: isActive(item.href) ? "#1ab3d8" : "#555", display: "flex", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </nav>

        {/* Badge rôle */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #e8e8e8" }}>
          <span style={{
            display: "inline-block", padding: "4px 12px",
            borderRadius: "20px", fontSize: "12px", fontWeight: 600,
            background: badge.bg, color: badge.color,
          }}>
            {badge.label}
          </span>
        </div>
      </div>
    </>
  );
}