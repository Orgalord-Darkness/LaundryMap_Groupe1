import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CGU_READ_KEY = "laundrymap_cgu_read";

interface CGUAcceptCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CGUAcceptCheckbox({ checked, onChange }: CGUAcceptCheckboxProps) {
  const [cguRead, setCguRead] = useState(false);

  const checkStorage = () => {
    const isRead = localStorage.getItem(CGU_READ_KEY) === "true";
    setCguRead(isRead);
    if (isRead) onChange(true);
  };

  useEffect(() => {
    checkStorage();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkStorage();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <div className="flex flex-col gap-2 my-4">
      <label
        className={`flex items-start gap-3 cursor-pointer select-none ${!cguRead ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={!cguRead}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-blue-500 cursor-pointer disabled:cursor-not-allowed"
        />
        <span className="text-sm text-gray-800">
          J'ai lu et j'accepte les{" "}
          <Link
            to="/cgu"
            className="text-blue-600 underline hover:text-blue-800"
            onClick={(e) => e.stopPropagation()}
          >
            Conditions Générales d'Utilisation
          </Link>
        </span>
      </label>

      {!cguRead && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>
            Vous devez lire les CGU jusqu'à la fin pour activer cette case.{" "}
            <Link to="/cgu" className="font-semibold underline hover:text-amber-900">
              Lire les CGU →
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}
