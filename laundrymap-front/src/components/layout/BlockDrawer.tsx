import { useState } from "react"
import { z } from "zod"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldError } from "@/components/ui/field"
import apiClient from "@/lib/apiClient"

// ─── Schéma Zod ───────────────────────────────────────────────────────────────

const blockSchema = z
  .object({
    type: z.enum(["TEMPORARY", "PERMANENT"], {
      required_error: "Le type de blocage est obligatoire",
    }),
    reason: z
      .string()
      .min(1, "Le motif est obligatoire")
      .max(255, "255 caractères maximum"),
    expires_at: z.string().optional(),
  })
  .refine(
    (d) => {
      if (d.type !== "TEMPORARY") return true
      if (!d.expires_at) return false
      return new Date(d.expires_at) > new Date()
    },
    {
      path: ["expires_at"],
      message: "Une date future est obligatoire pour un blocage temporaire",
    }
  )

type BlockFormData = z.infer<typeof blockSchema>
type FieldErrors = Partial<Record<keyof BlockFormData | "root", string>>

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlockDrawerProps {
  userId: number
  userName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlockDrawer({
  userId,
  userName,
  open,
  onOpenChange,
  onSuccess,
}: BlockDrawerProps) {
  const [type, setType]           = useState<"TEMPORARY" | "PERMANENT" | "">("")
  const [expiresAt, setExpiresAt] = useState("")
  const [reason, setReason]       = useState("")
  const [loading, setLoading]     = useState(false)
  const [errors, setErrors]       = useState<FieldErrors>({})

  const reset = () => {
    setType("")
    setExpiresAt("")
    setReason("")
    setErrors({})
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const today = new Date().toISOString().split("T")[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsed = blockSchema.safeParse({ type: type || undefined, reason, expires_at: expiresAt || undefined })
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {}
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof BlockFormData
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setLoading(true)

    // TODO(human): Construire le payload et appeler l'API de blocage
    // À implémenter :
    //   1. Construire le body JSON : { type, reason } + ajouter expires_at converti
    //      en ISO 8601 uniquement si le type est "TEMPORARY"
    //   2. Appeler apiClient.post(`/admin/users/${userId}/block`, body)
    //   3. En cas de succès (try) : appeler onSuccess() puis reset()
    //   4. En cas d'erreur API (catch) : extraire le message et appeler
    //      setErrors({ root: message }) sans fermer le Drawer
    //   5. Dans tous les cas (finally) : setLoading(false)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Bloquer cet utilisateur</DrawerTitle>
          <DrawerDescription>
            <span className="font-medium text-foreground">{userName}</span> sera
            bloqué et ne pourra plus accéder à l&apos;application.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} noValidate className="px-4 pb-2 space-y-4">
          {/* Type de blocage */}
          <div className="space-y-1.5">
            <Label htmlFor="block-type">Type de blocage</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as "TEMPORARY" | "PERMANENT")
                setErrors((prev) => ({ ...prev, type: undefined }))
              }}
            >
              <SelectTrigger
                id="block-type"
                aria-invalid={!!errors.type}
                aria-describedby={errors.type ? "block-type-error" : undefined}
              >
                <SelectValue placeholder="Choisir un type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TEMPORARY">Temporaire</SelectItem>
                <SelectItem value="PERMANENT">Définitif</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <FieldError id="block-type-error">{errors.type}</FieldError>
            )}
          </div>

          {/* Date d'expiration — uniquement si TEMPORARY */}
          {type === "TEMPORARY" && (
            <div className="space-y-1.5">
              <Label htmlFor="expires-at">Date d&apos;expiration</Label>
              <input
                id="expires-at"
                type="date"
                min={today}
                value={expiresAt}
                onChange={(e) => {
                  setExpiresAt(e.target.value)
                  setErrors((prev) => ({ ...prev, expires_at: undefined }))
                }}
                aria-invalid={!!errors.expires_at}
                aria-describedby={errors.expires_at ? "expires-at-error" : undefined}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive"
              />
              {errors.expires_at && (
                <FieldError id="expires-at-error">{errors.expires_at}</FieldError>
              )}
            </div>
          )}

          {/* Motif */}
          <div className="space-y-1.5">
            <Label htmlFor="block-reason">Motif</Label>
            <Textarea
              id="block-reason"
              rows={3}
              placeholder="Ex : comportement abusif, harcèlement…"
              maxLength={255}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setErrors((prev) => ({ ...prev, reason: undefined }))
              }}
              aria-invalid={!!errors.reason}
              aria-describedby={errors.reason ? "block-reason-error" : undefined}
            />
            {errors.reason && (
              <FieldError id="block-reason-error">{errors.reason}</FieldError>
            )}
          </div>

          {/* Erreur API globale */}
          {errors.root && (
            <div role="alert" className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
              {errors.root}
            </div>
          )}

          <DrawerFooter className="px-0 pt-2">
            <Button
              type="submit"
              variant="danger"
              className="w-full"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Blocage en cours…" : "Confirmer le blocage"}
            </Button>
            <DrawerClose asChild>
              <Button variant="secondary" className="w-full" type="button" disabled={loading}>
                Annuler
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
