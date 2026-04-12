import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

interface DeleteLaverieModalProps {
  id: number;
  name?: string; // 👈 AJOUT
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteLaverieModal({
  id,
  name,
  open,
  onClose,
  onDeleted,
}: DeleteLaverieModalProps) {
  const [loading, setLoading] = useState(false);
  console.log('test : ', import.meta.env.VITE_API_BASE_URL); 
  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/v1/laverie/suppression/${id}`);
      onDeleted?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL CONTAINER */}
      <div className="relative z-10 w-full max-w-md mx-4">
        
        <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4">

          {/* TITLE */}
          <h2 className="text-lg font-semibold text-center">
            Confirmer la suppression
          </h2>

          {/* NAME */}
          {name && (
            <p className="text-center text-sm text-gray-600">
              Supprimer <span className="font-semibold text-gray-900">{name}</span> ?
            </p>
          )}

          {/* WARNING */}
          <p className="text-xs text-gray-500 text-center">
            Cette action est irréversible.
          </p>

          {/* BUTTONS */}
          <div className="flex flex-col mt-2">
            
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="w-full"
            >
              Annuler
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Suppression..." : "Supprimer"}
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
}