export default function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        height: "48px",
        background: "#f3f3f3",  
        border: "1px solid #E0E0E0",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        fontSize: "16px",
        fontWeight: 500,
        color: "#000",
        cursor: "pointer"
      }}
    >
      <img
        src="https://www.gstatic.com/images/branding/product/1x/gsa_48dp.png"
        alt="Google"
        className="google-icon"
        />

      <span>S’inscrire avec Google</span>
    </button>
  );
}
