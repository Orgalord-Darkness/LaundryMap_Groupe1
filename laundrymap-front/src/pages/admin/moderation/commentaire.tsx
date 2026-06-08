import { useState, useMemo, useId, useEffect } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { FilterTabs } from "@/components/layout/Filter"
import { ModerationCard, type ModerationComment } from "@/components/layout/NoteCards"
import apiClient from "@/lib/apiClient"

// ─── Filtrage par sévérité ─────────────────────────────────────────────────────

type SeverityFilter = "TOUS" | "MODERE" | "ELEVE" | "CRITIQUE"

const SEVERITY_TABS = [
  { label: "Tous",     value: "TOUS"     as SeverityFilter },
  { label: "Modéré",   value: "MODERE"   as SeverityFilter },
  { label: "Élevé",    value: "ELEVE"    as SeverityFilter },
  { label: "Critique", value: "CRITIQUE" as SeverityFilter },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ModerationPage() {
  const [comments, setComments]       = useState<ModerationComment[]>([])
  const [filter, setFilter]           = useState<SeverityFilter>("TOUS")
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [statusMsg, setStatusMsg]     = useState("")
  const [blockedUserIds, setBlockedUserIds] = useState<Set<number>>(new Set())

  const sortLabelId = useId()

  const announce = (msg: string) => {
    setStatusMsg("")
    setTimeout(() => setStatusMsg(msg), 50)
  }

  const remove = (avisId: number, verb: string) => {
    const c = comments.find((c) => c.avisId === avisId)
    setComments((prev) => prev.filter((c) => c.avisId !== avisId))
    if (c) announce(`Commentaire de ${c.author.name} ${verb}.`)
  }

  useEffect(() => {
    apiClient.get("/admin/signalements")
      .then((res) => {
        const data: any[] = res.data

        // Group by avisId — une card par commentaire, pas par signalement
        const grouped  = new Map<number, ModerationComment>()
        const bannedIds = new Set<number>()

        data.forEach((s) => {
          if (s.auteur_statut === "banni") bannedIds.add(s.utilisateur_id)

          const existing = grouped.get(s.laverie_note_id)
          if (existing) {
            existing.signalementIds.push(s.id)
            existing.reportCount++
            if (s.commentaire) existing.reportComment = s.commentaire
          } else {
            const prenom = s.auteur_prenom ?? ""
            const nom    = s.auteur_nom    ?? ""
            const date   = new Date(s.date)
            grouped.set(s.laverie_note_id, {
              avisId:         s.laverie_note_id,
              signalementIds: [s.id],
              authorId:       s.utilisateur_id,
              author: {
                name:     `${prenom} ${nom}`.trim(),
                initials: ((prenom[0] ?? "") + (nom[0] ?? "")).toUpperCase(),
              },
              content:        s.laverie_note_commentaire ?? "",
              postedAt:       date.toLocaleDateString("fr-FR"),
              postedAtIso:    date.toISOString(),
              laundry:        s.laverie_nom ?? "",
              reportCount:    1,
              reportReason:   s.motif ?? "",
              reportComment:  s.commentaire ?? undefined,
              postedDate:     date.toLocaleDateString("fr-FR"),
              isAuthorBanned: s.auteur_statut === "banni",
            })
          }
        })
        setBlockedUserIds(bannedIds)
        setComments(Array.from(grouped.values()))
      })
      .catch(() => setError("Impossible de charger les signalements."))
      .finally(() => setLoading(false))
  }, [])

  const visibleComments = useMemo(() => {
    return comments.filter((c) => {
      switch (filter) {
        case "CRITIQUE": return c.reportCount >= 10
        case "ELEVE":    return c.reportCount >= 5 && c.reportCount < 10
        case "MODERE":   return c.reportCount < 5
        default:         return true
      }
    })
  }, [comments, filter])

  return (
    <div className="min-h-screen bg-background">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMsg}
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* ── Navigation entre les deux volets de modération ── */}
        <nav aria-label="Sections de modération" className="flex gap-2 mb-5">
          <span
            aria-current="page"
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-foreground text-background"
          >
            Commentaires signalés
          </span>
          <Link
            to="/admin/moderation/utilisateurs"
            className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Utilisateurs à modérer
          </Link>
        </nav>

        <h1 className="text-2xl font-semibold text-foreground mb-1">
          Modération des commentaires
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          Gérez les commentaires signalés par les utilisateurs
        </p>

        <FilterTabs tabs={SEVERITY_TABS} active={filter} onChange={setFilter} />

        {/* Compteur */}
        {!loading && !error && (
          <div className="flex items-center justify-end mb-4" id={sortLabelId}>
            <Badge variant="secondary">
              {visibleComments.length} en attente
            </Badge>
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div role="status" aria-live="polite" className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl h-64 animate-pulse border border-border" />
            ))}
            <span className="sr-only">Chargement…</span>
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div
            role="alert"
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm"
          >
            {error}
          </div>
        )}

        {/* Liste vide */}
        {!loading && !error && visibleComments.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            Aucun commentaire dans cette catégorie.
          </p>
        )}

        {/* Liste */}
        {!loading && !error && visibleComments.length > 0 && (
          <section aria-label={`Commentaires à modérer, ${visibleComments.length} au total`}>
            <ul className="space-y-4 list-none p-0 m-0">
              {visibleComments.map((comment) => (
                <li key={comment.avisId}>
                  <ModerationCard
                    comment={comment}
                    isAuthorBlocked={blockedUserIds.has(comment.authorId)}
                    onKept={() => remove(comment.avisId, "conservé et retiré de la file")}
                    onDeleted={() => remove(comment.avisId, "masqué par l'administrateur")}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
