import { Link } from "react-router-dom";

export function Footer() {
  const legalLinks = [
    { label: "CGU", href: "/cgu" },
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Accessibilité", href: "/accessibilite" },
  ];

  return (
    <footer className="
      bg-gradient-to-br from-[#1ab3d8] to-[#4ecfee]
      dark:from-gray-900 dark:to-gray-800
      px-6 pt-7 pb-5
    ">
      <div className="max-w-[900px] mx-auto flex items-center justify-center flex-wrap gap-6">
        {/* Liens légaux */}
        <div className="flex flex-row gap-3 min-w-[150px]">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-[#0a3d52] dark:text-cyan-200 underline underline-offset-[3px] text-[15px] font-semibold"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <p className="text-center mt-5 text-xs font-medium text-[#0a3d52] dark:text-cyan-300">
        © {new Date().getFullYear()} EC2E — LaundryMap. Tous droits réservés.
      </p>
    </footer>
  );
}
