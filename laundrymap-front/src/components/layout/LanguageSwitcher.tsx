import { usePreferences, type Language } from '@/components/context/PreferencesContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = usePreferences();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="border p-1 rounded bg-card cursor-pointer"
      aria-label="Changer la langue"
    >
      <option value="fr">FR</option>
      <option value="en">EN</option>
    </select>
  );
}
