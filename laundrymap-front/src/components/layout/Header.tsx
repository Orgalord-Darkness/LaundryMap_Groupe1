import { BurgerMenu } from "@/components/layout/BurgerMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";

export function Header() {
  return (
    <header className="
      flex items-center justify-between gap-2
      px-3 py-2.5 min-h-[72px]
      bg-gradient-to-r from-[#1ab3d8] to-[#4ecfee]
      dark:from-gray-900 dark:to-gray-800
      shadow-md sticky top-0 z-[100]
    ">
      {/* Burger — taille fixe */}
      <div className="shrink-0">
        <BurgerMenu />
      </div>

      {/* Logo centré */}
      <div className="flex-1 min-w-0 flex justify-center">
        <div className="
          bg-white dark:bg-black
          rounded-xl px-4 py-2
          flex items-center justify-center
          shadow-sm max-w-[220px] w-full overflow-hidden
        ">
          <img
                src={`${import.meta.env.VITE_API_BASE_URL}/fichiers/logo/logo_titre.png`}
                alt="LaundryMap"
            className="h-[52px] w-auto max-w-full block dark:hidden"
          />
          <img
                src="/fichiers/logo/logo_titre_theme_sombre.png"
                alt="LaundryMap"
            className="h-[52px] w-auto max-w-full hidden dark:block"
          />
        </div>
      </div>

      {/* Theme + Language switchers */}
      <div className="shrink-0 flex items-center gap-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg">
          <ThemeSwitcher />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
