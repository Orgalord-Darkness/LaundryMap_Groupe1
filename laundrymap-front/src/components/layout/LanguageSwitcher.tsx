import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="border p-1 rounded bg-white cursor-pointer"
      aria-label="Changer la langue"
    >
      <option value="fr">FR</option>
      <option value="en">EN</option>
    </select>
  );
}
