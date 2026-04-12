import { BurgerMenu } from "@/components/layout/BurgerMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function Header() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        background: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "46px", height: "46px",
          background: "linear-gradient(135deg, #2bbcd4, #1a9ab0)",
          borderRadius: "50%", display: "flex",
          alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(43,188,212,0.3)",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: "17px", color: "#1a1a1a", letterSpacing: "-0.3px" }}>
          LaundryMap
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <LanguageSwitcher />
        <BurgerMenu />
      </div>
    </header>
  );
}
