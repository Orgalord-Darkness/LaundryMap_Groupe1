import { useEffect, useState } from "react"
import { useParams, useLocation, Link } from "react-router-dom"
import { ArrowLeft, ShieldBan, User } from "lucide-react"
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

interface HistoryEntry {
  id: number
  action: string   // "banni" | "validé"
  motif: string
  admin_id: number
  date: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveStatus(entry: HistoryEntry, isLast: boolean, isCurrentlyBlocked: boolean): string {
  if (entry.action !== "banni") return "Levée de blocage"
  if (isLast && isCurrentlyBlocked) return "Actif"
  if (isLast && !isCurrentlyBlocked) return "Expiré"
  return "Levé manuellement"
}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function FicheUtilisateur() {
  const { id }       = useParams<{ id: string }>()
  const location     = useLocation()
  const userId       = parseInt(id ?? "0", 10)

  // Nom passé en état de navigation depuis ModerationCard (optionnel)
  const stateUser = location.state as { nom?: string; prenom?: string; email?: string } | null

  const [blockedUser, setBlockedUser]   = useState<BlockedUser | null>(null)
  const [history, setHistory]           = useState<HistoryEntry[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [blockDrawerOpen, setBlockDrawerOpen] = useState(false)
  const [statusMsg, setStatusMsg]       = useState("")

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
    ])
      .then(([blocksRes, historyRes]) => {
        const found = blocksRes.data.find((u) => u.id === userId) ?? null
        setBlockedUser(found)
        setHistory(historyRes.data)
      })
      .catch(() => setError("Impossible de charger les informations de l'utilisateur."))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [userId])

  // Infos d'affichage : depuis router state ou depuis la liste des bloqués
  const nom    = stateUser?.nom    ?? blockedUser?.nom    ?? "—"
  const prenom = stateUser?.prenom ?? blockedUser?.prenom ?? "—"
  const email  = stateUser?.email  ?? blockedUser?.email  ?? "—"
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
          to="/admin/moderation"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour à la modération
        </Link>

        <h1 className="text-2xl font-semibold text-foreground mb-1">
          Fiche utilisateur
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          Gestion du blocage et historique des actions administratives
        </p>

        {/* Chargement */}
        {loading && (
          <div role="status" aria-live="polite" className="flex flex-col gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl h-36 animate-pulse border border-border" />
            ))}
            <span className="sr-only">Chargement…</span>
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
                      Bloquer
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
                        announce("Blocage levé avec succès.")
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
                        Modifier le blocage
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>

            {/* ── Historique des blocages ── */}
            <Card className="rounded-2xl shadow-sm">
              <CardHeader className="pb-3">
                <h2 className="text-base font-semibold">Historique des actions</h2>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 p-0">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    Aucune action enregistrée pour cet utilisateur.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Action</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Motif</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Date</th>
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((entry, idx) => {
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
                                  {isBlock ? "Blocage" : "Levée"}
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
                                    status === "Actif"
                                      ? "text-red-600 dark:text-red-400 font-medium"
                                      : status === "Expiré"
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {status}
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
          announce(`${prenom} ${nom} a été bloqué avec succès.`)
          loadData()
        }}
      />
    </div>
  )
}
