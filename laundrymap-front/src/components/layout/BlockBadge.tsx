import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ShieldOff } from "lucide-react"
import apiClient from "@/lib/apiClient"

// ─── Props ────────────────────────────────────────────────────────────────────

interface BlockBadgeProps {
  userId: number
  blockType: "TEMPORARY" | "PERMANENT"
  blockedUntil: string | null
  onUnblocked: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BlockBadge({ userId, blockType, blockedUntil, onUnblocked }: BlockBadgeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const expiryLabel = blockedUntil
    ? new Date(blockedUntil).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null

  const handleUnblock = async () => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.delete(`/admin/users/${userId}/unblock`)
      setDrawerOpen(false)
      onUnblocked()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant="outline"
          className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs px-2 py-0.5"
        >
          {blockType === "TEMPORARY" && expiryLabel
            ? `Bloqué temporairement · jusqu'au ${expiryLabel}`
            : "Bloqué définitivement"}
        </Badge>

        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => setDrawerOpen(true)}
        >
          <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
          Lever le blocage
        </Button>
      </div>

      {/* Drawer de confirmation */}
      <Drawer open={drawerOpen} onOpenChange={(o) => { setDrawerOpen(o); if (!o) setError(null) }}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Lever le blocage</DrawerTitle>
            <DrawerDescription>
              L&apos;utilisateur retrouvera un accès normal à l&apos;application. Cette action est enregistrée dans l&apos;historique.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-2">
            {error && (
              <div role="alert" className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <DrawerFooter className="pt-2">
            <Button
              variant="default"
              className="w-full"
              onClick={handleUnblock}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Levée en cours…" : "Confirmer la levée du blocage"}
            </Button>
            <DrawerClose asChild>
              <Button variant="secondary" className="w-full" disabled={loading}>
                Annuler
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
