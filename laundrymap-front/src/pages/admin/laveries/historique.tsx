import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Badge } from "@/components/ui/badge"
import { fetchHistoriquePage } from "@/components/utils/historiqueService"
import type { HistoriqueEntry, HistoriqueFilters } from "@/components/utils/historiqueService"
import { PaginationBar } from "./list"
import { HistoriqueFilterModal, type FilterFieldConfig } from "@/components/layout/historique/HistoriqueFilterModal"
import { HistoriqueActiveFilters } from "@/components/layout/historique/HistoriqueActiveFilters"
import { HistoriqueDetailButton, type DetailField } from "@/components/layout/historique/HistoriqueDetailButton"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginationState {
    page: number
    total_pages: number
    total: number
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<"VALIDE" | "REFUSE", string> = {
    VALIDE: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
    REFUSE: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400",
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function HistoriqueLaverie() {
    const { t } = useTranslation()

    const [entries, setEntries]       = useState<HistoriqueEntry[]>([])
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, total_pages: 1, total: 0 })
    const [loading, setLoading]       = useState(false)
    const [error, setError]           = useState<string | null>(null)
    const [filters, setFilters]       = useState<HistoriqueFilters>({})
    const [filterModalOpen, setFilterModalOpen] = useState(false)

    const fetchHistorique = useCallback(async (page: number) => {
        setLoading(true)
        setError(null)
        try {
            const result = await fetchHistoriquePage(page, filters)
            setEntries(result.entries)
            setPagination({ page: result.page, total_pages: result.total_pages, total: result.total })
        } catch {
            setError(t('histo_laverie_erreur_chargement'))
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
                { value: "VALIDE", label: t('action_valide') },
                { value: "REFUSE", label: t('action_refuse') },
            ],
        },
        { key: "dateDebut", type: "date", label: t('histo_filtre_date_debut') },
        { key: "dateFin",   type: "date", label: t('histo_filtre_date_fin') },
        { key: "laverie",   type: "text", label: "Laverie", placeholder: t('histo_filtre_laverie_placeholder') },
        { key: "motif",     type: "text", label: "Motif",   placeholder: t('histo_filtre_motif_placeholder') },
    ]

    const filterLabelFor = (key: string, value: string): string => {
        switch (key) {
            case "action": return value === "VALIDE" ? t('action_valide') : t('action_refuse')
            case "dateDebut": return `${t('histo_filtre_date_debut')} ${value}`
            case "dateFin": return `${t('histo_filtre_date_fin')} ${value}`
            default: return value
        }
    }

    // Entrée la plus récente par laverie sur la page courante (entries est trié par date desc) —
    // ne couvre que la page affichée : si la dernière décision d'une laverie est sur une autre
    // page, aucun badge n'apparaît pour elle ici. Le badge n'est utile que lorsqu'au moins deux
    // décisions pour la même laverie coexistent sur la page (sinon c'est trivialement la seule).
    const occurrencesParLaverie = new Map<number, number>()
    const dernierIdParLaverie   = new Map<number, number>()
    for (const entry of entries) {
        occurrencesParLaverie.set(entry.laverie_id, (occurrencesParLaverie.get(entry.laverie_id) ?? 0) + 1)
        if (!dernierIdParLaverie.has(entry.laverie_id)) dernierIdParLaverie.set(entry.laverie_id, entry.id)
    }
    const estDecisionActuelle = (entry: HistoriqueEntry) =>
        (occurrencesParLaverie.get(entry.laverie_id) ?? 0) > 1 && dernierIdParLaverie.get(entry.laverie_id) === entry.id

    const detailFieldsFor = (entry: HistoriqueEntry): DetailField[] => [
        { label: t('histo_laverie_col_action'), value: t(entry.action === "VALIDE" ? "action_valide" : "action_refuse") },
        { label: t('histo_laverie_col_laverie'), value: entry.laverie_nom },
        { label: t('histo_laverie_col_proprietaire'), value: entry.proprietaire },
        { label: t('histo_laverie_col_admin'), value: entry.administrateur_email ?? `#${entry.administrateur_id}` },
        { label: t('histo_laverie_col_date'), value: `${entry.date} - ${entry.horodatage}` },
        { label: t('histo_laverie_col_motif'), value: entry.motif ?? "—" },
    ]

    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-5xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-semibold text-foreground mb-6">
                    {t('histo_laverie_titre')}
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
                        {t('histo_laverie_vide')}
                    </p>
                )}

                {/* ── Tableau ── */}
                {!loading && !error && entries.length > 0 && (
                    <>
                        <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
                            <table className="w-full text-sm">
                                <caption className="sr-only">{t('histo_laverie_titre')}</caption>
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                            {t('histo_laverie_col_action')}
                                        </th>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground">
                                            {t('histo_laverie_col_laverie')}
                                        </th>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                            {t('histo_laverie_col_admin')}
                                        </th>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                                            {t('histo_laverie_col_date')}
                                        </th>
                                        <th scope="col" className="text-left px-4 py-3 font-medium text-muted-foreground">
                                            {t('histo_col_detail')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry, idx) => (
                                        <tr
                                            key={entry.id}
                                            className={`border-t border-border transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <Badge variant="outline" className={BADGE_STYLES[entry.action]}>
                                                        {t(entry.action === "VALIDE" ? "action_valide" : "action_refuse")}
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
                                                    to={`/admin/laverie/${entry.laverie_id}`}
                                                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                >
                                                    {entry.laverie_nom}
                                                </Link>
                                                <p className="text-xs text-muted-foreground mt-0.5">{entry.proprietaire}</p>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-xs">
                                                {entry.administrateur_email ?? `#${entry.administrateur_id}`}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                <time dateTime={entry.horodatage}>
                                                    {entry.date} - {entry.horodatage}
                                                </time>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <HistoriqueDetailButton fields={detailFieldsFor(entry)} />
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
