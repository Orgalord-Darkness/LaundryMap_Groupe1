import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  CalendarX,
  MessageSquareWarning,
  ShieldBan,
  UserSearch,
} from "lucide-react"
import { BlockDrawer } from "@/components/layout/BlockDrawer"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommentaireSignale {
  noteId: number
  commentaire: string
  nbSignalements: number
}

export interface UtilisateurSignale {
  id: number
  nom: string
  prenom: string
  email: string
  statut: string
  blockedUntil: string | null
  totalSignalements: number
  /** Calculé côté back (RG-211) — true si total_signalements >= SIGNALEMENT_SEUIL_BANNISSEMENT */
  depasseSeuil: boolean
  commentairesSignales: CommentaireSignale[]
}

interface UtilisateurSignaleCardProps {
  utilisateur: UtilisateurSignale
  onBlocked?: (userId: number) => void
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

// ─── Component ────────────────────────────────────────────────────────────────

export function UtilisateurSignaleCard({ utilisateur, onBlocked }: UtilisateurSignaleCardProps) {
  const { t } = useTranslation()
  const [blockDrawerOpen, setBlockDrawerOpen] = useState(false)

  const fullName           = `${utilisateur.prenom} ${utilisateur.nom}`.trim()
  const initials           = ((utilisateur.prenom[0] ?? "") + (utilisateur.nom[0] ?? "")).toUpperCase()
  const initialsColorClass = getInitialsColor(initials)
  const isBlocked          = utilisateur.statut === "banni"

  return (
    <>
      <Card
        role="article"
        aria-label={`Utilisateur ${fullName}, ${utilisateur.totalSignalements} signalement(s) cumulé(s)`}
        className="w-full rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        {/* ── En-tête : avatar + identité ── */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${initialsColorClass}`}
                aria-hidden="true"
              >
                {initials}
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{fullName}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{utilisateur.email}</p>
                {isBlocked && (
                  <div className="mt-0.5">
                    <Badge
                      variant="outline"
                      className="border-red-200 bg-red-50 text-red-700 text-xs gap-1"
                      aria-label={utilisateur.blockedUntil ? "Utilisateur bloqué temporairement" : "Utilisateur bloqué définitivement"}
                    >
                      <ShieldBan className="h-3 w-3" aria-hidden="true" />
                      {utilisateur.blockedUntil ? 'Bloqué temporairement' : 'Bloqué définitivement'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

        </CardHeader>

        <Separator />

        {/* ── Métadonnées ── */}
        <CardContent className="pt-4 pb-3">
          <dl className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <dt className="text-sm font-semibold w-56 flex-shrink-0">{t('moderation_signalements_cumules')}&nbsp;:</dt>
              <dd className="text-sm">{utilisateur.totalSignalements}</dd>
            </div>

            <div className="flex items-center gap-2">
              <MessageSquareWarning className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <dt className="text-sm font-semibold w-56 flex-shrink-0">{t('moderation_commentaires_concernes')}&nbsp;:</dt>
              <dd className="text-sm">{utilisateur.commentairesSignales.length}</dd>
            </div>

            {isBlocked && utilisateur.blockedUntil && (
              <div className="flex items-center gap-2">
                <CalendarX className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                <dt className="text-sm font-semibold w-56 flex-shrink-0">Débannissement&nbsp;:</dt>
                <dd className="text-sm">{new Date(utilisateur.blockedUntil).toLocaleDateString('fr-FR')}</dd>
              </div>
            )}
          </dl>
        </CardContent>

        <Separator />

        {/* ── Actions ── */}
        <CardFooter className="pt-4 gap-3 justify-end">
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <Link
              to={`/admin/utilisateurs/${utilisateur.id}`}
              state={{ nom: utilisateur.nom, prenom: utilisateur.prenom, email: utilisateur.email, from: "moderation-utilisateurs" }}
            >
              <UserSearch className="h-4 w-4" aria-hidden="true" />
              {t('moderation_voir_profil')}
            </Link>
          </Button>

          {!isBlocked && (
            <Button
              variant="danger"
              size="sm"
              className="gap-1.5"
              onClick={() => setBlockDrawerOpen(true)}
              aria-label={`Bloquer ${fullName}`}
            >
              <ShieldBan className="h-4 w-4" aria-hidden="true" />
              {t('moderation_bloquer')}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* ── Drawer de blocage utilisateur (composant réutilisé) ── */}
      <BlockDrawer
        userId={utilisateur.id}
        userName={fullName}
        open={blockDrawerOpen}
        onOpenChange={setBlockDrawerOpen}
        onSuccess={() => {
          setBlockDrawerOpen(false)
          onBlocked?.(utilisateur.id)
        }}
      />
    </>
  )
}
