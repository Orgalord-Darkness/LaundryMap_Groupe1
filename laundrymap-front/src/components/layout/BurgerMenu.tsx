import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/components/context/AuthContext";
import { Icon } from "@/components/ui/icons";

type Role = "guest" | "utilisateur" | "professionnel" | "administrateur";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  separator?: boolean;
}

function getMenuItems(role: Role, t: (key: string) => string): MenuItem[] {
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
        { label: "Accueil", href: "/", icon: <Icon.Home /> },
        { label: "Tableau de bord", href: "/pro/dashboard", icon: <Icon.Home /> },
        { label: "Mes informations", href: "/pro/informations", icon: <Icon.Info /> },
        { label: "Mes préférences", href: "/pro/preferences", icon: <Icon.Sliders /> },
        { label: "Déconnexion", href: "/logout", icon: <Icon.Logout />, separator: true },
      ];
    case "administrateur":
      return [
        { label: "Accueil", href: "/", icon: <Icon.Home /> },
        { label: "Tableau de bord", href: "/admin/dashboard", icon: <Icon.Home /> },
        { label: "Laveries", href: "/admin/laveries/list", icon: <Icon.Laundry /> },
        { label: "Comptes", href: "/admin/professional/list", icon: <Icon.People /> },
        { label: "Mes informations", href: "/admin/informations", icon: <Icon.Info />, separator: true },
        { label: "Mes préférences", href: "/admin/preferences", icon: <Icon.Sliders /> },
        { label: "Historique compte", href: "/admin/historique-compte", icon: <Icon.History />, separator: true },
        { label: t('histo_laverie_nav'), href: "/admin/laveries/historique", icon: <Icon.History /> },
        { label: t('admin_nav_messages_signales'), href: "/admin/moderation", icon: <Icon.Flag /> },
        { label: t('admin_nav_utilisateurs_a_moderer'), href: "/admin/moderation/utilisateurs", icon: <Icon.UserX /> },
        { label: "Mots interdits", href: "/admin/mots-interdits", icon: <Icon.Ban /> },
        { label: "Déconnexion", href: "/logout", icon: <Icon.Logout />, separator: true },
      ];
  }
}

const badgeConfig: Record<Role, { label: string; className: string }> = {
  guest:          { label: "Visiteur",       className: "bg-gray-500/15 text-gray-700 dark:text-gray-300" },
  utilisateur:    { label: "Utilisateur",    className: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  professionnel:  { label: "Professionnel",  className: "bg-green-500/15 text-green-700 dark:text-green-300" },
  administrateur: { label: "Administrateur", className: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
};

export function BurgerMenu() {
  const { t } = useTranslation();
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

  const menuItems = getMenuItems(role as Role, t);
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
      {/* Bouton burger — bleu foncé fixe, fidèle à la maquette dans les deux thèmes */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu"
        className="flex items-center justify-center shrink-0 w-12 h-12 rounded-[10px] bg-[#0e6b8a] shadow-[0_2px_6px_rgba(0,0,0,0.25)] cursor-pointer"
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
        aria-hidden="true"
        className={`fixed inset-0 bg-black/40 z-[998] transition-opacity duration-[250ms] ease-in-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar — à GAUCHE */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 w-[280px] h-screen bg-card z-[999] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* En-tête sidebar avec dégradé (même traitement que le header principal) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#1ab3d8] to-[#4ecfee] dark:from-gray-900 dark:to-gray-800">
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fermer le menu"
            className="flex items-center justify-center p-1.5 rounded-md bg-[#0e6b8a] text-white shadow-[0_1px_4px_rgba(0,0,0,0.2)] cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item, i) => (
            <div key={i}>
              {item.separator && <hr className="border-t border-border my-1.5" />}
              <button
                onClick={() => handleItemClick(item.href, item.label)}
                className={`flex items-center gap-3.5 w-full px-6 py-3 text-left text-[15px] cursor-pointer border-l-4 transition-colors hover:bg-primary/10 ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary font-bold border-primary"
                    : "text-foreground font-normal border-transparent"
                }`}
              >
                <span className={`flex shrink-0 ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </div>
          ))}
        </nav>

        {/* Badge rôle */}
        <div className="px-6 py-4 border-t border-border">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>
    </>
  );
}
