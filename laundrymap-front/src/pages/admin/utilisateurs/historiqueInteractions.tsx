import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { fetchHistoriqueInteractionsPage } from "@/components/utils/historiqueInteractionsService"
import type { HistoriqueInteractionEntry, HistoriqueInteractionFilters } from "@/components/utils/historiqueInteractionsService"
import { PaginationBar } from "../laveries/list"
import { HistoriqueFilterModal, type FilterFieldConfig } from "@/components/historique/HistoriqueFilterModal"
import { HistoriqueActiveFilters } from "@/components/historique/HistoriqueActiveFilters"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginationState {
    page: number
    total_pages: number
    total: number
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, string> = {
    BLOCAGE:         "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400",
    LEVEE_BLOCAGE:   "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400",
    VALIDATION_PRO:  "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
    REFUS_PRO:       "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400",
}

const ACTION_LABEL_KEYS: Record<string, string> = {
    BLOCAGE:        "action_blocage",
    LEVEE_BLOCAGE:  "action_levee_blocage",
    VALIDATION_PRO: "action_validation_pro",
    REFUS_PRO:      "action_refus_pro",
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function HistoriqueInteractions() {
    const { t } = useTranslation()

    const [entries, setEntries]       = useState<HistoriqueInteractionEntry[]>([])
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, total_pages: 1, total: 0 })
    const [loading, setLoading]       = useState(false)
    const [error, setError]           = useState<string | null>(null)
    const [filters, setFilters]       = useState<HistoriqueInteractionFilters>({})
    const [filterModalOpen, setFilterModalOpen] = useState(false)

    const fetchHistorique = useCallback(async (page: number) => {
        setLoading(true)
        setError(null)
        try {
            const result = await fetchHistoriqueInteractionsPage(page, filters)
            setEntries(result.entries)
            setPagination({ page: result.page, total_pages: result.total_pages, total: result.total })
        } catch {
            setError(t('histo_interactions_erreur_chargement'))
        } finally {
            setLoading(false)
        }
    }, [t, filters])

    useEffect(() => { fetchHistorique(1) }, [fetchHistorique])

    const handlePageChange = (p: number) => {
        fetchHistorique(p)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const filterFields: FilterFieldConfig[] = [
        {
            key: "action",
            type: "select",
            label: t('histo_filtre_action'),
            options: [
                { value: "", label: t('histo_filtre_toutes') },
                { value: "BLOCAGE", label: t('action_blocage') },
                { value: "LEVEE_BLOCAGE", label: t('action_levee_blocage') },
                { value: "VALIDATION_PRO", label: t('action_validation_pro') },
                { value: "REFUS_PRO", label: t('action_refus_pro') },
            ],
        },
        { key: "dateDebut", type: "date", label: t('histo_filtre_date_debut') },
        { key: "dateFin",   type: "date", label: t('histo_filtre_date_fin') },
        { key: "utilisateur", type: "text", label: t('histo_interactions_col_utilisateur'), placeholder: t('histo_filtre_utilisateur_placeholder') },
        { key: "motif",     type: "text", label: "Motif", placeholder: t('histo_filtre_motif_placeholder') },
    ]

    const filterLabelFor = (key: string, value: string): string => {
        switch (key) {
            case "action": return t(ACTION_LABEL_KEYS[value] ?? value)
            case "dateDebut": return `${t('histo_filtre_date_debut')} ${value}`
            case "dateFin": return `${t('histo_filtre_date_fin')} ${value}`
            default: return value
        }
    }

    // Cf. historique.tsx (laveries) pour le raisonnement : badge "statut actuel" affiché
    // uniquement quand au moins deux décisions pour le même utilisateur coexistent sur la page.
    const occurrencesParUtilisateur = new Map<number, number>()
    const dernierIdParUtilisateur   = new Map<number, number>()
    for (const entry of entries) {
        occurrencesParUtilisateur.set(entry.utilisateur_id, (occurrencesParUtilisateur.get(entry.utilisateur_id) ?? 0) + 1)
        if (!dernierIdParUtilisateur.has(entry.utilisateur_id)) dernierIdParUtilisateur.set(entry.utilisateur_id, entry.id)
    }
    const estDecisionActuelle = (entry: HistoriqueInteractionEntry) =>
        (occurrencesParUtilisateur.get(entry.utilisateur_id) ?? 0) > 1 && dernierIdParUtilisateur.get(entry.utilisateur_id) === entry.id

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-semibold text-foreground mb-6">
                    {t('histo_interactions_titre')}
                </h1>

                {/* ── Filtres ── */}
                <HistoriqueActiveFilters
                    filters={filters}
                    labelFor={filterLabelFor}
                    onRemove={key => setFilters(f => ({ ...f, [key]: undefined }))}
                    onOpenFilters={() => setFilterModalOpen(true)}
                    filterButtonLabel={t('histo_filtre_rechercher')}
                />
                <HistoriqueFilterModal
                    open={filterModalOpen}
                    onOpenChange={setFilterModalOpen}
                    title={t('histo_filtre_rechercher')}
                    fields={filterFields}
                    filters={filters}
                    onApply={setFilters}
                />

                {/* ── Skeleton ── */}
                {loading && (
                    <div role="status" aria-live="polite" className="flex flex-col gap-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-12 bg-card rounded-xl animate-pulse border border-border" />
                        ))}
                        <span className="sr-only">Chargement…</span>
                    </div>
                )}

                {/* ── Erreur ── */}
                {!loading && error && (
                    <div
                        role="alert"
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm"
                    >
                        {error}
                    </div>
                )}

                {/* ── État vide ── */}
                {!loading && !error && entries.length === 0 && (
                    <p className="text-center text-muted-foreground py-12 text-sm">
                        {t('histo_interactions_vide')}
                    </p>
                )}

                {/* ── Tableau ── */}
                {!loading && !error && entries.length > 0 && (
                    <>
                        <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
                            <table className="w-full text-sm">
                                <caption className="sr-only">{t('histo_interactions_titre')}</caption>
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                            {t('histo_interactions_col_action')}
                                        </th>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground">
                                            {t('histo_interactions_col_utilisateur')}
                                        </th>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                            {t('histo_interactions_col_admin')}
                                        </th>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                            {t('histo_interactions_col_date')}
                                        </th>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground">
                                            {t('histo_interactions_col_motif')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry, idx) => (
                                        <tr
                                            key={`${entry.type_interaction}-${entry.id}`}
                                            className={`border-t border-border transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <Badge variant="outline" className={BADGE_STYLES[entry.action_label]}>
                                                        {t(ACTION_LABEL_KEYS[entry.action_label] ?? entry.action_label)}
                                                    </Badge>
                                                    {estDecisionActuelle(entry) && (
                                                        <Badge variant="outline" className="border-border text-muted-foreground">
                                                            {t('histo_statut_actuel')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    to={`/admin/utilisateurs/${entry.utilisateur_id}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                >
                                                    {entry.utilisateur_nom_complet}
                                                </Link>
                                                <p className="text-xs text-muted-foreground mt-0.5">{entry.utilisateur_email}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                                {entry.administrateur_email ?? `#${entry.administrateur_id}`}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                <time dateTime={entry.horodatage}>
                                                    {entry.date} - {entry.horodatage}
                                                </time>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground max-w-48">
                                                <span title={entry.motif ?? undefined} className="truncate block">{entry.motif ?? "—"}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <PaginationBar
                            page={pagination.page}
                            totalPages={pagination.total_pages}
                            onChange={handlePageChange}
                        />
                    </>
                )}
            </main>
        </div>
    )
}
