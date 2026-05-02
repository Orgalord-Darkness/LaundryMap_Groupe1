import { BurgerMenu } from "@/components/layout/BurgerMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        padding: "10px 12px",
        background: "linear-gradient(90deg, #1ab3d8 0%, #4ecfee 100%)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        minHeight: "72px",
      }}
    >
      {/* Burger — taille fixe */}
      <div style={{ flexShrink: 0 }}>
        <BurgerMenu />
      </div>

      {/* Logo centré */}
      <div style={{
        flex: "1 1 0",
        minWidth: 0,
        display: "flex",
        justifyContent: "center",
      }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          maxWidth: "220px",
          width: "100%",
          justifyContent: "center",
          overflow: "hidden",
        }}>
          <img
            src="/fichiers/logo/logo_titre.png"
            alt="LaundryMap"
            style={{
              height: "52px",
              width: "auto",
              maxWidth: "100%",
              display: "block",
            }}
          />
        </div>
      </div>

      

      {/* Language switcher */}
      <div style={{
        flexShrink: 10,
        background: "#ffffff",
        borderRadius: "8px",
      }}>
        <LanguageSwitcher />
      </div>
    </header>
  );
}