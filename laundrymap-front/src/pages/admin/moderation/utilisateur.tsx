import { useState, useMemo, useId, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { FilterTabs } from "@/components/layout/Filter"
import { UtilisateurSignaleCard, type UtilisateurSignale } from "@/components/layout/UtilisateurSignaleCard"
import apiClient from "@/lib/apiClient"

// ─── Filtrage : tous / à examiner ──────────────────────────────────────────────

type ReviewFilter = "TOUS" | "A_EXAMINER"

// ─── Forme de la réponse API ───────────────────────────────────────────────────

interface UtilisateurSignaleApi {
  utilisateur: {
    id: number
    nom: string
    prenom: string
    email: string
    statut: string
  }
  total_signalements: number
  commentaires_signales: { note_id: number; commentaire: string; nb_signalements: number }[]
  depasse_seuil_bannissement: boolean
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ModerationUtilisateursPage() {
  const { t } = useTranslation()

  const REVIEW_TABS = [
    { label: t('moderation_filter_tous'),      value: "TOUS"       as ReviewFilter },
    { label: t('moderation_filter_a_examiner'), value: "A_EXAMINER" as ReviewFilter },
  ]

  const [utilisateurs, setUtilisateurs] = useState<UtilisateurSignale[]>([])
  const [filter, setFilter]             = useState<ReviewFilter>("TOUS")
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [statusMsg, setStatusMsg]       = useState("")

  const counterId = useId()

  const announce = (msg: string) => {
    setStatusMsg("")
    setTimeout(() => setStatusMsg(msg), 50)
  }

  useEffect(() => {
    apiClient.get<UtilisateurSignaleApi[]>("/admin/utilisateurs/signalements")
      .then((res) => {
        setUtilisateurs(res.data.map((row) => ({
          id:                   row.utilisateur.id,
          nom:                  row.utilisateur.nom,
          prenom:               row.utilisateur.prenom,
          email:                row.utilisateur.email,
          statut:               row.utilisateur.statut,
          totalSignalements:    row.total_signalements,
          depasseSeuil:         row.depasse_seuil_bannissement,
          commentairesSignales: row.commentaires_signales.map((c) => ({
            noteId:         c.note_id,
            commentaire:    c.commentaire,
            nbSignalements: c.nb_signalements,
          })),
        })))
      })
      .catch(() => setError("Impossible de charger les utilisateurs signalés."))
      .finally(() => setLoading(false))
  }, [])

  const visibleUtilisateurs = useMemo(() => {
    if (filter === "A_EXAMINER") return utilisateurs.filter((u) => u.depasseSeuil)
    return utilisateurs
  }, [utilisateurs, filter])

  const handleBlocked = (userId: number) => {
    const u = utilisateurs.find((u) => u.id === userId)
    setUtilisateurs((prev) => prev.map((u) => (u.id === userId ? { ...u, statut: "banni" } : u)))
    if (u) announce(`${u.prenom} ${u.nom} a été bloqué.`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMsg}
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          {t('moderation_utilisateurs_titre')}
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          {t('moderation_utilisateurs_sous_titre')}
        </p>

        <FilterTabs tabs={REVIEW_TABS} active={filter} onChange={setFilter} />

        {/* Compteur */}
        {!loading && !error && (
          <div className="flex items-center justify-end mb-4" id={counterId}>
            <Badge variant="secondary">
              {visibleUtilisateurs.length} utilisateur{visibleUtilisateurs.length > 1 ? "s" : ""}
            </Badge>
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div role="status" aria-live="polite" className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl h-48 animate-pulse border border-border" />
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
        {!loading && !error && visibleUtilisateurs.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            {filter === "A_EXAMINER"
              ? t('moderation_vide_a_examiner')
              : t('moderation_vide_tous')}
          </p>
        )}

        {/* Liste */}
        {!loading && !error && visibleUtilisateurs.length > 0 && (
          <section aria-label={`Utilisateurs signalés, ${visibleUtilisateurs.length} au total`}>
            <ul className="space-y-4 list-none p-0 m-0">
              {visibleUtilisateurs.map((utilisateur) => (
                <li key={utilisateur.id}>
                  <UtilisateurSignaleCard utilisateur={utilisateur} onBlocked={handleBlocked} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
