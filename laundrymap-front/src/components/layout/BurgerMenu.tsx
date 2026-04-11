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
        { label: "Déconnexion", href: "/", icon: <Icon.Logout />, separator: true },
      ];
    case "professionnel":
      return [
        { label: "Tableau de bord", href: "/pro/dashboard", icon: <Icon.Home /> },
        { label: "Mes informations", href: "/pro/informations", icon: <Icon.Info /> },
        { label: "Laverie Edition", href: "/pro/laverie/21", icon: <Icon.Info /> },
        { label: "Ajout laverie", href: "/addLaundry", icon: <Icon.Info /> },
        { label: "Mes préférences", href: "/pro/preferences", icon: <Icon.Sliders /> },
        { label: "Déconnexion", href: "/", icon: <Icon.Logout />, separator: true },
      ];
    case "administrateur":
      return [
        { label: "Tableau de bord", href: "/admin/dashboard", icon: <Icon.Home /> },
        { label: "Laveries", href: "/admin/laveries/list", icon: <Icon.Laundry /> },
        { label: "Comptes", href: "/admin/comptes", icon: <Icon.People /> },
        { label: "Messages signalés", href: "/admin/messages", icon: <Icon.Flag /> },
        { label: "Mes informations", href: "/admin/informations", icon: <Icon.Info />, separator: true },
        { label: "Mes préférences", href: "/admin/preferences", icon: <Icon.Sliders /> },
        { label: "Historique compte", href: "/admin/historique-compte", icon: <Icon.History />, separator: true },
        { label: "Historique laverie", href: "/admin/historique-laverie", icon: <Icon.History /> },
        { label: "Mots interdits", href: "/admin/mots-interdits", icon: <Icon.Ban /> },
        { label: "Déconnexion", href: "/", icon: <Icon.Logout />, separator: true },
      ];
  }
}

const badgeConfig: Record<Role, { label: string; bg: string; color: string }> = {
  guest:          { label: "Visiteur",       bg: "#f5f5f5", color: "#888" },
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
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu"
        style={{
          background: "#2bbcd4", border: "none", borderRadius: "8px",
          width: "42px", height: "42px", display: "flex",
          alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0,
          boxShadow: "0 2px 8px rgba(43,188,212,0.3)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
          zIndex: 998, opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />

      <div
        ref={menuRef}
        style={{
          position: "fixed", top: 0, right: 0,
          width: "280px", height: "100vh",
          background: "#ffffff", zIndex: 999,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex", flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        }}
      >

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #f0f0f0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "44px", height: "44px",
              background: "linear-gradient(135deg, #2bbcd4, #1a9ab0)",
              borderRadius: "50%", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: "16px", color: "#1a1a1a" }}>LaundryMap</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", borderRadius: "6px", color: "#555", display: "flex" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {menuItems.map((item, i) => (
            <div key={i}>
              {item.separator && <hr style={{ border: "none", borderTop: "1px solid #f0f0f0", margin: "6px 0" }} />}
              <button
                onClick={() => handleItemClick(item.href, item.label)}
                style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  width: "100%", padding: "12px 24px",
                  background: isActive(item.href) ? "#e8f8fb" : "none",
                  border: "none", cursor: "pointer", textAlign: "left",
                  color: isActive(item.href) ? "#2bbcd4" : "#333",
                  fontWeight: isActive(item.href) ? 600 : 400,
                  fontSize: "15px", fontFamily: "inherit",
                  borderLeft: isActive(item.href) ? "3px solid #2bbcd4" : "3px solid transparent",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span style={{ color: isActive(item.href) ? "#2bbcd4" : "#777", display: "flex", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </nav>

        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
          <span style={{
            display: "inline-block", padding: "3px 10px",
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
