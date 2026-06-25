import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams, useLocation, Link } from "react-router-dom"
import { AlertTriangle, ArrowLeft, Flag, ShieldBan, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BlockBadge } from "@/components/layout/BlockBadge"
import { BlockDrawer } from "@/components/layout/BlockDrawer"
import apiClient from "@/lib/apiClient"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlockedUser {
  id: number
  email: string
  nom: string
  prenom: string
  blocked_until: string | null
  type: "TEMPORARY" | "PERMANENT"
}

interface UserInfo {
  id: number
  nom: string
  prenom: string
  email: string
  statut: string
}

interface HistoryEntry {
  id: number
  action: string
  motif: string
  admin_id: number
  date: string
}

interface CommentaireSignale {
  note_id: number
  commentaire: string
  nb_signalements: number
}

interface SignalementEntry {
  total_signalements: number
  depasse_seuil_bannissement: boolean
  commentaires_signales: CommentaireSignale[]
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

type StatutCode = "levee_blocage" | "actif" | "expire" | "leve_manuellement"

const STATUT_LABEL_KEYS: Record<StatutCode, string> = {
  levee_blocage: "statut_levee_blocage",
  actif: "statut_actif",
  expire: "statut_expire",
  leve_manuellement: "statut_leve_manuellement",
}

function deriveStatus(entry: HistoryEntry, isLast: boolean, isCurrentlyBlocked: boolean): StatutCode {
  if (entry.action !== "banni") return "levee_blocage"
  if (isLast && isCurrentlyBlocked) return "actif"
  if (isLast && !isCurrentlyBlocked) return "expire"
  return "leve_manuellement"
}

function getInitialsColor(initials: string): string {
  const colors = [
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  ]
  return colors[initials.charCodeAt(0) % colors.length]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FicheUtilisateur() {
  const { t }        = useTranslation()
  const { id }       = useParams<{ id: string }>()
  const location     = useLocation()
  const userId       = parseInt(id ?? "0", 10)

  const stateUser = location.state as { nom?: string; prenom?: string; email?: string; from?: string } | null
  const fromUtilisateurs = stateUser?.from === "moderation-utilisateurs"

  const [blockedUser, setBlockedUser]         = useState<BlockedUser | null>(null)
  const [userInfo, setUserInfo]               = useState<UserInfo | null>(null)
  const [history, setHistory]                 = useState<HistoryEntry[]>([])
  const [signalement, setSignalement]         = useState<SignalementEntry | null>(null)
  const [expandedNotes, setExpandedNotes]     = useState<Set<number>>(new Set())
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState<string | null>(null)
  const [blockDrawerOpen, setBlockDrawerOpen] = useState(false)
  const [statusMsg, setStatusMsg]             = useState("")

  const toggleNote = (noteId: number) =>
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      next.has(noteId) ? next.delete(noteId) : next.add(noteId)
      return next
    })

  const announce = (msg: string) => {
    setStatusMsg("")
    setTimeout(() => setStatusMsg(msg), 50)
  }

  const loadData = () => {
    if (!userId) return
    setLoading(true)
    Promise.all([
      apiClient.get<BlockedUser[]>("/admin/blocks"),
      apiClient.get<HistoryEntry[]>(`/admin/users/${userId}/blocks`),
      apiClient.get<UserInfo>(`/admin/users/${userId}`),
      apiClient.get<{ utilisateur: { id: number }; total_signalements: number; depasse_seuil_bannissement: boolean; commentaires_signales: CommentaireSignale[] }[]>("/admin/utilisateurs/signalements"),
    ])
      .then(([blocksRes, historyRes, userRes, signalementsRes]) => {
        const found = blocksRes.data.find((u) => u.id === userId) ?? null
        setBlockedUser(found)
        setHistory(historyRes.data)
        setUserInfo(userRes.data)
        const sig = signalementsRes.data.find((s) => s.utilisateur.id === userId) ?? null
        setSignalement(sig)
      })
      .catch(() => setError(t('fiche_utilisateur_erreur_chargement')))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [userId])

  const nom    = userInfo?.nom    ?? stateUser?.nom    ?? blockedUser?.nom    ?? "—"
  const prenom = userInfo?.prenom ?? stateUser?.prenom ?? blockedUser?.prenom ?? "—"
  const email  = userInfo?.email  ?? stateUser?.email  ?? blockedUser?.email  ?? "—"
  const initials = ((prenom[0] ?? "") + (nom[0] ?? "")).toUpperCase()
  const colorClass = getInitialsColor(initials)

  const isBlocked      = !!blockedUser
  const banniEntries   = history.filter((h) => h.action === "banni")
  const lastBanniIndex = banniEntries.length - 1

  return (
    <div className="min-h-screen bg-background">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMsg}
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Retour */}
        <Link
          to={fromUtilisateurs ? "/admin/moderation/utilisateurs" : "/admin/moderation"}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {fromUtilisateurs ? t('fiche_retour_moderation_utilisateurs') : t('fiche_retour_moderation_commentaires')}
        </Link>

        <h1 className="text-2xl font-semibold text-foreground mb-1">
          {t('fiche_utilisateur_titre')}
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          {t('fiche_utilisateur_description')}
        </p>

        {/* Chargement */}
        {loading && (
          <div role="status" aria-live="polite" className="flex flex-col gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl h-36 animate-pulse border border-border" />
            ))}
            <span className="sr-only">{t('chargement')}</span>
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {/* ── Fiche identité ── */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold ${colorClass}`}
                      aria-hidden="true"
                    >
                      {initials || <User className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-base leading-tight">
                        {prenom} {nom}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
                    </div>
                  </div>

                  {!isBlocked && (
                    <Button
                      variant="danger"
                      size="sm"
                      className="gap-1.5 flex-shrink-0"
                      onClick={() => setBlockDrawerOpen(true)}
                    >
                      <ShieldBan className="h-4 w-4" aria-hidden="true" />
                      {t('moderation_bloquer')}
                    </Button>
                  )}
                </div>
              </CardHeader>

              {isBlocked && (
                <>
                  <Separator />
                  <CardContent className="pt-4">
                    <BlockBadge
                      userId={userId}
                      blockType={blockedUser!.type}
                      blockedUntil={blockedUser!.blocked_until}
                      onUnblocked={() => {
                        setBlockedUser(null)
                        announce(t('fiche_blocage_leve_succes'))
                        loadData()
                      }}
                    />
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setBlockDrawerOpen(true)}
                      >
                        <ShieldBan className="h-4 w-4" aria-hidden="true" />
                        {t('fiche_modifier_blocage')}
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>

            {/* ── Commentaires signalés ── */}
            {signalement && signalement.total_signalements > 0 && (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h2 className="text-base font-semibold">{t('fiche_commentaires_signales_titre')}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {t('badge_signalements_cumules', { count: signalement.total_signalements })}
                      </Badge>
                      {signalement.depasse_seuil_bannissement && (
                        <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-400 text-xs gap-1">
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                          {t('moderation_a_examiner')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-0 pb-0 divide-y divide-border">
                  {signalement.commentaires_signales.map((c) => {
                    const isLong     = c.commentaire.length > 120
                    const isExpanded = expandedNotes.has(c.note_id)
                    const severity   = c.nb_signalements >= 10
                      ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                      : c.nb_signalements >= 5
                      ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                      : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"

                    return (
                      <div key={c.note_id} className="py-3 px-6 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Flag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                          <Badge variant="outline" className={`text-xs px-1.5 py-0 ${severity}`}>
                            {t('badge_signalement_count', { count: c.nb_signalements })}
                          </Badge>
                        </div>
                        <p className={`text-sm text-foreground leading-snug ${isExpanded || !isLong ? "" : "line-clamp-2"}`}>
                          {c.commentaire}
                        </p>
                        {isLong && (
                          <button
                            onClick={() => toggleNote(c.note_id)}
                            className="text-xs text-primary hover:underline"
                          >
                            {isExpanded ? t('fiche_commentaires_voir_moins') : t('fiche_commentaires_voir_plus')}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* ── Historique des blocages ── */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <h2 className="text-base font-semibold">{t('fiche_historique_actions_titre')}</h2>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 p-0">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    {t('fiche_historique_vide')}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('th_action')}</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('histo_laverie_col_motif')}</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('histo_interactions_col_date')}</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('statut_label')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((entry) => {
                          const banniIdx = banniEntries.indexOf(entry)
                          const isLastBanni = banniIdx === lastBanniIndex
                          const status = deriveStatus(entry, isLastBanni, isBlocked)
                          const isBlock = entry.action === "banni"

                          return (
                            <tr key={entry.id} className="border-b border-border last:border-0">
                              <td className="px-4 py-3">
                                <Badge
                                  variant="outline"
                                  className={
                                    isBlock
                                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                                      : "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  }
                                >
                                  {isBlock ? t('action_blocage') : t('fiche_badge_levee')}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground max-w-48 truncate" title={entry.motif}>
                                {entry.motif}
                              </td>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                <time dateTime={entry.date}>
                                  {new Date(entry.date).toLocaleDateString("fr-FR")}
                                </time>
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={
                                    status === "actif"
                                      ? "text-red-600 dark:text-red-400 font-medium"
                                      : status === "expire"
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {t(STATUT_LABEL_KEYS[status])}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        )}
      </main>

      <BlockDrawer
        userId={userId}
        userName={`${prenom} ${nom}`}
        open={blockDrawerOpen}
        onOpenChange={setBlockDrawerOpen}
        onSuccess={() => {
          announce(t('fiche_utilisateur_bloque_succes', { name: `${prenom} ${nom}` }))
          loadData()
        }}
      />
    </div>
  )
}
