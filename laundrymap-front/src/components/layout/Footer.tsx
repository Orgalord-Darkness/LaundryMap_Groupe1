import { Link } from "react-router-dom";

export function Footer() {

  const legalLinks = [
    { label: "CGU", href: "/cgu" },
    { label: "Mentions légales", href: "/mentions-legales" },
  ];

  return (
    <footer
      style={{
        background: "linear-gradient(135deg, #1ab3d8 0%, #4ecfee 100%)",
        padding: "28px 24px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        {/* Liens légaux — texte blanc foncé sur fond clair = bon contraste */}
        <div style={{ display: "flex", flexDirection: "row", gap: "12px", minWidth: "150px", margin:'auto' }}>
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              style={{
                color: "#0a3d52",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Icônes réseaux sociaux — fond bleu très foncé pour contraste maximal avec icônes blanches */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
          }}
        >
          
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        textAlign: "center",
        marginTop: "20px",
        fontSize: "12px",
        color: "#0a3d52",
        fontWeight: 500,
      }}>
        © {new Date().getFullYear()} EC2E — LaundryMap. Tous droits réservés.
      </div>
    </footer>
  );
}