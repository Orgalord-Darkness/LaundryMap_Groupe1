export function Footer() {
  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com",
      svg: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "X (Twitter)",
      href: "https://x.com",
      svg: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      svg: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.01" fill="white" strokeWidth="3" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://tiktok.com",
      svg: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.86 4.86 0 0 1-1.01-.07z" />
        </svg>
      ),
    },
    {
      name: "Snapchat",
      href: "https://snapchat.com",
      svg: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
          <path d="M12.166 2C9.415 2 7.09 3.476 6.01 5.69c-.44.9-.544 1.865-.516 2.852-.4.217-.845.33-1.297.33-.38 0-.757-.08-1.108-.244l-.09.29c.468.355 1.02.582 1.6.66-.09.31-.21.612-.36.895-.46.882-1.2 1.557-2.12 1.95l.037.31c.595.093 1.173.32 1.68.67-.1.37-.26.714-.48 1.02-.25.353-.565.66-.937.9l.055.295c1.83.365 2.9 1.498 4.34 1.498.264 0 .54-.028.83-.085.506-.1 1.015-.27 1.52-.513.504.242 1.013.414 1.52.513.29.057.565.085.828.085 1.44 0 2.51-1.133 4.34-1.498l.055-.294c-.37-.24-.687-.547-.937-.9-.22-.307-.38-.652-.48-1.022.507-.35 1.086-.577 1.68-.67l.037-.31c-.92-.392-1.66-1.067-2.12-1.95-.15-.282-.27-.583-.36-.894.58-.078 1.13-.305 1.6-.66l-.09-.29c-.35.163-.727.244-1.107.244-.452 0-.897-.113-1.298-.33.028-.987-.075-1.95-.516-2.852C16.91 3.476 14.585 2 11.834 2h.332z" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: "https://wa.me",
      svg: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.944-1.418A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 0 1-4.073-1.117l-.292-.174-3.035.871.842-3.11-.19-.31A7.955 7.955 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      svg: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
    {
      name: "Messenger",
      href: "https://messenger.com",
      svg: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
          <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.906 1.362 5.504 3.5 7.257V22l3.188-1.75c.852.235 1.754.362 2.312.362 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.007 12.458l-2.55-2.713-4.978 2.713 5.48-5.814 2.614 2.713 4.914-2.713-5.48 5.814z" />
        </svg>
      ),
    },
  ];

  const legalLinks = [
    { label: "CGU", href: "/cgu" },
    { label: "Contactez-nous", href: "/contact" },
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
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "150px" }}>
          {legalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: "#0a3d52",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              {link.label}
            </a>
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
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                /* Fond bleu très foncé = contraste > 7:1 avec les icônes blanches */
                background: "#0a3d52",
                transition: "background 0.2s, transform 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0e6b8a";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0a3d52";
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              {social.svg}
            </a>
          ))}
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