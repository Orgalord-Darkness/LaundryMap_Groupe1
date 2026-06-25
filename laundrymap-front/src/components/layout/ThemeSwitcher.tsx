import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const STORAGE_KEY = "laundrymap_theme"; // même clé que PreferencesContext (lecture/écriture disque uniquement, pas d'import)

export function ThemeSwitcher() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) ?? "system"
  );

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      root.classList.toggle("dark", theme === "dark" || (theme === "system" && mq.matches));
    };
    apply();
    if (theme !== "system") return;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  }

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as Theme)}
      className="border p-1 rounded bg-card cursor-pointer"
      aria-label="Changer le thème"
    >
      <option value="light">Clair</option>
      <option value="dark">Sombre</option>
      <option value="system">Système</option>
    </select>
  );
}
