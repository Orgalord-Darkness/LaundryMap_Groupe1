import { useState } from "react"
import { Link } from "react-router-dom"
import apiClient from "@/lib/apiClient"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  MoreVertical,
  Trash2,
  ShieldCheck,
  ShieldBan,
  UserSearch,
  Store,
  Flag,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import { BlockDrawer } from "@/components/layout/BlockDrawer"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModerationComment {
  avisId: number           // laverie_note_id — identifiant unique du commentaire
  signalementIds: number[] // IDs de tous les signalements associés
  authorId: number         // ID de l'auteur — pour navigation vers la fiche
  author: {
    name: string
    initials: string
  }
  content: string
  /** Libellé relatif affiché (ex. "Il y a 5 heures") */
  postedAt: string
  /** Valeur ISO pour l'attribut dateTime */
  postedAtIso: string
  laundry: string
  reportCount: number
  reportReason: string
  reportComment?: string
  isAuthorBanned: boolean
  /** Date formatée pour l'affichage (ex. "19.02.2026") */
  postedDate: string
}

interface ModerationCardProps {
  comment: ModerationComment
  isAuthorBlocked?: boolean
  onKept?: () => void
  onDeleted?: () => void
  onUserBlocked?: (userId: number) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitialsColor(initials: string): string {
  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-violet-100 text-violet-700",
  ]
  return colors[initials.charCodeAt(0) % colors.length]
}

function getReportSeverity(count: number) {
  if (count >= 10) return { label: "Critique", className: "bg-red-100 text-red-700 border-red-200" }
  if (count >= 5)  return { label: "Élevé",    className: "bg-orange-100 text-orange-700 border-orange-200" }
  return                  { label: "Modéré",   className: "bg-yellow-100 text-yellow-700 border-yellow-200" }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ModerationCard({ comment, isAuthorBlocked = false, onKept, onDeleted, onUserBlocked }: ModerationCardProps) {
  const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false)
  const [blockDrawerOpen, setBlockDrawerOpen]   = useState(false)
  const [deleteMotif, setDeleteMotif] = useState("")
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const severity           = getReportSeverity(comment.reportCount)
  const initialsColorClass = getInitialsColor(comment.author.initials)

  const handleDelete = async () => {
    if (!deleteMotif.trim()) return
    setDeleteError(null)
    try {
      setLoading(true)
      await apiClient.delete(`/admin/avis/${comment.avisId}`, { data: { motif: deleteMotif } })
      setDeleteDrawerOpen(false)
      setDeleteMotif("")
      onDeleted?.()
    } catch {
      setDeleteError("Erreur lors de la suppression. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleKeep = async () => {
    try {
      await Promise.all(
        comment.signalementIds.map((id) => apiClient.delete(`/admin/signalements/${id}`))
      )
      onKept?.()
    } catch {
      // gérer selon le pattern global (toast, etc.)
    }
  }

  const handleDrawerChange = (open: boolean) => {
    setDeleteDrawerOpen(open)
    if (!open) setDeleteMotif("")
  }

  return (
    <>
      <Card
        role="article"
        aria-label={`Commentaire de ${comment.author.name} sur ${comment.laundry}`}
        className="w-full rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        {/* ── En-tête : avatar + auteur + menu ⋮ ── */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${initialsColorClass}`}
                aria-hidden="true"
              >
                {comment.author.initials}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">
                  {comment.author.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <time dateTime={comment.postedAtIso}>{comment.postedAt}</time>
                </p>
                {isAuthorBlocked && (
                  <Badge
                    variant="outline"
                    className="border-red-200 bg-red-50 text-red-700 text-xs gap-1 mt-0.5"
                    aria-label="Utilisateur bloqué"
                  >
                    <ShieldBan className="h-3 w-3" aria-hidden="true" />
                    Utilisateur bloqué
                  </Badge>
                )}
              </div>
            </div>

            {/* Menu d'options rapides */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-8 w-8"
                  aria-label={`Options pour le commentaire de ${comment.author.name}`}
                >
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2" onClick={handleKeep}>
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Marquer comme approuvé
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={() => setDeleteDrawerOpen(true)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Supprimer le commentaire
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-destructive focus:text-destructive"
                  onClick={() => setBlockDrawerOpen(true)}
                >
                  <ShieldBan className="h-4 w-4" aria-hidden="true" />
                  Bloquer l&apos;utilisateur
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" asChild>
                  <Link
                    to={`/admin/utilisateurs/${comment.authorId}`}
                    state={{ nom: comment.author.name.split(" ").slice(1).join(" "), prenom: comment.author.name.split(" ")[0] }}
                  >
                    <UserSearch className="h-4 w-4" aria-hidden="true" />
                    Voir le profil
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contenu du commentaire */}
          <blockquote className="text-sm text-foreground leading-relaxed mt-3">
            {comment.content}
          </blockquote>
        </CardHeader>

        <Separator />

        {/* ── Métadonnées ── */}
        <CardContent className="pt-4 pb-3">
          <dl className="space-y-2">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <dt className="text-sm font-semibold w-44 flex-shrink-0">Laverie&nbsp;:</dt>
              <dd className="text-sm truncate">{comment.laundry}</dd>
            </div>

            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <dt className="text-sm font-semibold w-44 flex-shrink-0">Nombre de signalement&nbsp;:</dt>
              <dd className="text-sm flex items-center gap-2">
                {comment.reportCount}
                <Badge
                  variant="outline"
                  className={`text-xs px-1.5 py-0 ${severity.className}`}
                  aria-label={`Niveau de sévérité : ${severity.label}`}
                >
                  {severity.label}
                </Badge>
              </dd>
            </div>

            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <dt className="text-sm font-semibold w-44 flex-shrink-0">Motif du signalement&nbsp;:</dt>
              <dd className="text-sm">{comment.reportReason}</dd>
            </div>

            {comment.reportComment && (
              <div className="flex items-start gap-2">
                <Flag className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" aria-hidden="true" />
                <dt className="text-sm font-semibold w-44 flex-shrink-0">Commentaire&nbsp;:</dt>
                <dd className="text-sm text-muted-foreground italic">{comment.reportComment}</dd>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <dt className="text-sm font-semibold w-44 flex-shrink-0">Message posté&nbsp;:</dt>
              <dd className="text-sm">
                <time dateTime={comment.postedAtIso}>{comment.postedDate}</time>
              </dd>
            </div>
          </dl>
        </CardContent>

        <Separator />

        {/* ── Actions principales ── */}
        <CardFooter className="pt-4 gap-3 justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={handleKeep}
            aria-label={`Conserver le commentaire de ${comment.author.name}`}
          >
            Conserver
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setDeleteDrawerOpen(true)}
            aria-label={`Supprimer le commentaire de ${comment.author.name}`}
          >
            Supprimer
          </Button>
        </CardFooter>
      </Card>

      {/* ── Drawer de blocage utilisateur ── */}
      <BlockDrawer
        userId={comment.authorId}
        userName={comment.author.name}
        open={blockDrawerOpen}
        onOpenChange={setBlockDrawerOpen}
        onSuccess={() => {
          setBlockDrawerOpen(false)
          onUserBlocked?.(comment.authorId)
        }}
      />

      {/* ── Drawer de confirmation avec motif (mobile-first) ── */}
      <Drawer open={deleteDrawerOpen} onOpenChange={handleDrawerChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Masquer le commentaire</DrawerTitle>
            <DrawerDescription>
              Le commentaire de <strong>{comment.author.name}</strong> sera masqué.
              Renseignez un motif de modération.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-2 space-y-2">
            <Textarea
              rows={3}
              placeholder="Ex : propos offensants, contenu inapproprié…"
              value={deleteMotif}
              onChange={(e) => setDeleteMotif(e.target.value)}
              aria-label="Motif de suppression"
            />
            {deleteError && (
              <p className="text-sm text-red-600">{deleteError}</p>
            )}
          </div>

          <DrawerFooter className="pt-2">
            <Button
              variant="danger"
              className="w-full"
              onClick={handleDelete}
              disabled={loading || !deleteMotif.trim()}
              aria-busy={loading}
            >
              {loading ? "Masquage…" : "Masquer le commentaire"}
            </Button>
            <DrawerClose asChild>
              <Button variant="secondary" className="w-full">
                Annuler
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
