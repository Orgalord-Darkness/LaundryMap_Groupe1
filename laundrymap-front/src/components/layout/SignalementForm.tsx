import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/apiClient";
import axios from "axios";

interface Props {
  reviewId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  motif: string;
  commentaire: string;
}

export default function SignalementForm({ reviewId, open, onOpenChange }: Props) {
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: { motif: "propos injurieux", commentaire: "" },
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      reset();
      setApiError(null);
      setSuccess(false);
    }
  }, [open, reset]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await apiClient.post(`/utilisateur/avis/${reviewId}/signalement`, {
        motif: data.motif,
        ...(data.commentaire ? { commentaire: data.commentaire } : {}),
      });
      setSuccess(true);
      setTimeout(() => onOpenChange(false), 1500);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 409) setApiError("Vous avez déjà signalé cet avis.");
        else if (status === 429) setApiError("Limite de signalements atteinte. Réessayez plus tard.");
        else if (status === 401) setApiError("Vous devez être connecté pour signaler un avis.");
        else setApiError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Signaler ce commentaire</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6">
          {success ? (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
              Signalement envoyé, merci pour votre contribution.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {apiError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Motif</label>
                <select
                  {...register("motif", { required: true })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-background"
                >
                  <option value="propos injurieux">Propos injurieux</option>
                  <option value="spam">Spam</option>
                  <option value="publicité non sollicité">Publicité non sollicitée</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Description{" "}
                  <span className="text-slate-400 font-normal">(optionnelle)</span>
                </label>
                <textarea
                  {...register("commentaire")}
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-background resize-none"
                  placeholder="Précisez votre signalement..."
                />
              </div>
              <DrawerFooter className="px-0 pt-2">
                <Button variant="danger" type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Envoi…" : "Signaler"}
                </Button>
                <Button variant="outline" type="button" className="w-full" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
              </DrawerFooter>
            </form>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
