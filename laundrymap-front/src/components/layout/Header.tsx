import { useState } from "react";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react"; // Assurez-vous d'avoir installé `lucide-react` (pas installé, a voir pour autrement).


export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  // Icône de fermeture personnalisée
  const CloseIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  // Icônes SVG personnalisées pour chaque élément du menu
  const menuIcons = {
    Accueil: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    Profil: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    Paramètres: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V7a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1" />
      </svg>
    ),
  };

  // Liste des éléments du menu (réutilisable pour la sidebar et le menu desktop)
  const menuItems = [
    { label: "Accueil", href: "#", icon: menuIcons.Accueil },
    { label: "Profil", href: "#", icon: menuIcons.Profil },
    { label: "Paramètres", href: "#", icon: menuIcons.Paramètres },
  ];

  // Composant réutilisable pour chaque élément du menu
  const MenuItem = ({ label, href, icon, className }: { label: string; href: string; icon?: React.ReactNode; className?: string }) => (
    <a href={href} className={`flex items-center gap-2 py-2 text-lg hover:underline ${className || ""}`}>
      {icon && <span>{icon}</span>}
      {label}
    </a>
  );

  return (
    <header className="flex items-center justify-between p-6 bg-background shadow-sm md:justify-center">
      {/* Logo + Titre */}
      <div className="flex items-center gap-2 font-bold text-lg md:absolute md:left-4">
        <img
          src="https://www.laverie-smartwash.com/wp-content/uploads/2024/07/laverie-toulouse-smart-wash-logo.png"  // ou avec le fichier "../../../public/laundrymap.png"
          alt="Logo"
          className="h-14 w-auto mx-5"
        />
        {/* <span>LaundryMap</span> */}
      </div>

      {/* Bouton burger menu (mobile) */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="md:hidden focus:outline-none w-10 h-10 flex items-center justify-center">
            <Menu />
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px] p-0">
          {/* Croix de fermeture */}
          <div className="flex justify-end p-4">
            <SheetClose asChild>
              <button className="focus:outline-none w-10 h-10 flex items-center justify-center">
                <CloseIcon />
              </button>
            </SheetClose>
          </div>
          {/* Contenu de la sidebar */}
          <nav className="flex flex-col p-4">
            {menuItems.map((item, index) => (
              <MenuItem key={index} label={item.label} href={item.href} icon={item.icon} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Menu desktop */}
      <nav className="hidden md:flex md:gap-6">
        {menuItems.map((item, index) => (
          <MenuItem key={index} label={item.label} href={item.href} icon={item.icon} className="text-lg" />
        ))}
      </nav>
    </header>
  );
}
