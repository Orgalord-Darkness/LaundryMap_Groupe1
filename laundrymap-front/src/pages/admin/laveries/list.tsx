import { useEffect, useState, useCallback, useRef } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer"
import { FilterTabs } from "@/components/layout/Filter"
import apiClient from "@/lib/apiClient"
import i18n from "@/i18n"

const API_BASE = import.meta.env.VITE_API_BASE_URL

// ─── Types ────────────────────────────────────────────────────────────────────

type StatutOnglet = "EN_ATTENTE" | "VALIDE" | "REFUSE"

interface LaverieAPI {
    id: number
    nom_etablissement: string
    statut: StatutOnglet
    date_ajout: string
    logo: { id: number; emplacement: string } | null
    professionnel: {
        id: number
        utilisateur: { id: number; nom: string; prenom: string }
    } | null
}

interface Laverie {
    id: number
    nom_etablissement: string
    statut: StatutOnglet
    image_url: string | null
    proprietaire_nom: string
    date_creation: string
    soumis_il_y_a: string
}

interface PaginationState {
    page: number
    total_pages: number
    total: number
}

// ─── Config ───────────────────────────────────────────────────────────────────

function getOnglets(t: (key: string) => string) {
    return [
        { label: t("admin_onglet_en_attente"), value: "EN_ATTENTE" as StatutOnglet },
        { label: t("admin_onglet_valides"),    value: "VALIDE"     as StatutOnglet },
        { label: t("admin_onglet_refuses"),    value: "REFUSE"     as StatutOnglet },
    ]
}

const BADGE_STYLES: Record<StatutOnglet, string> = {
    EN_ATTENTE: "bg-amber-100 text-amber-700 border border-amber-200",
    VALIDE:     "bg-emerald-100 text-emerald-700 border border-emerald-200",
    REFUSE:     "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800",
}

function getBadgeLabels(t: (key: string) => string): Record<StatutOnglet, string> {
    return {
        EN_ATTENTE: t("admin_badge_en_attente"),
        VALIDE:     t("admin_badge_valide"),
        REFUSE:     t("admin_badge_refuse"),
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
    })
}

function tempsEcoule(iso: string): string {
    const diff    = Date.now() - new Date(iso).getTime()
    const jours   = Math.floor(diff / 86_400_000)
    const heures  = Math.floor(diff / 3_600_000)
    const minutes = Math.floor(diff / 60_000)
    if (jours > 0)   return i18n.t("temps_jours", { count: jours })
    if (heures > 0)  return i18n.t("temps_heures", { count: heures })
    if (minutes > 0) return i18n.t("temps_minutes", { count: minutes })
    return i18n.t("temps_instant")
}

function normaliser(raw: LaverieAPI): Laverie {
    const u = raw.professionnel?.utilisateur
    return {
        id:                raw.id,
        nom_etablissement: raw.nom_etablissement,
        statut:            raw.statut,
        image_url:         raw.logo ? `${API_BASE}${raw.logo.emplacement}` : null,
        proprietaire_nom:  u ? `${u.prenom} ${u.nom}` : "—",
        date_creation:     formatDate(raw.date_ajout),
        soumis_il_y_a:     tempsEcoule(raw.date_ajout),
    }
}

// ─── Menu 3 points ────────────────────────────────────────────────────────────

function ContextMenu({
    laverieId,
    onClose,
    onDeleteRequest,
}: {
    laverieId: number
    onClose: () => void
    onDeleteRequest: () => void
}) {
    const { t } = useTranslation()
    const ref = useRef<HTMLDivElement>(null)

    // Fermeture au clic extérieur
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [onClose])

    const items = [
        {
            label: t('fiche_commentaires_titre'),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            href: `/user/fiche-laverie/${laverieId}`,
        },
        {
            label: t('admin_voir_demande'),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M12 20h9M12 4h9M4 7h16M4 12h16M4 17h16" />
                </svg>
            ),
            href: `/admin/laverie/${laverieId}`,
        },
        {
            label: t('menu_editer'),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            ),
            href: `/pro/laverie/${laverieId}`,
        },
        {
            label: t('supprimer'),
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            ),
            onClick: onDeleteRequest,
            danger: true,
        },
    ]

    return (
        <div
            ref={ref}
            role="menu"
            aria-label={t('actions')}
            className="absolute right-0 bottom-10 z-20 bg-card rounded-2xl shadow-lg border border-border py-1 min-w-[170px] overflow-hidden"
        >
            {items.map(({ label, icon, href, onClick, danger }) => {
                const className = `flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-background w-full text-left ${
                    danger ? "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300" : "text-foreground"
                }`
                if (onClick) {
                    return (
                        <button
                            key={label}
                            type="button"
                            role="menuitem"
                            onClick={() => { onClick(); onClose() }}
                            className={className}
                        >
                            {icon}
                            {label}
                        </button>
                    )
                }
                return (
                    <a key={label} href={href} role="menuitem" onClick={onClose} className={className}>
                        {icon}
                        {label}
                    </a>
                )
            })}
        </div>
    )
}

// ─── PaginationBar ────────────────────────────────────────────────────────────

export function PaginationBar({
    page,
    totalPages,
    onChange,
}: {
    page: number
    totalPages: number
    onChange: (p: number) => void
}) {
    const { t } = useTranslation()
    const pages: (number | "…")[] = []
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
        pages.push(1)
        if (page > 3) pages.push("…")
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
        if (page < totalPages - 2) pages.push("…")
        pages.push(totalPages)
    }

    return (
        <nav aria-label={t('pagination_aria')} className="flex items-center justify-center gap-1 mt-8">
            <button
                onClick={() => onChange(page - 1)} disabled={page === 1}
                aria-label={t('pagination_precedente')}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground disabled:opacity-40 hover:bg-background transition-colors text-base"
            >‹</button>

            {pages.map((p, i) =>
                p === "…" ? (
                    <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">…</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onChange(p as number)}
                        aria-current={p === page ? "page" : undefined}
                        aria-label={t('pagination_page', { n: p })}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                            p === page ? "bg-blue-600 text-white shadow-sm" : "border border-border text-muted-foreground hover:bg-background"
                        }`}
                    >{p}</button>
                )
            )}

            <button
                onClick={() => onChange(page + 1)} disabled={page === totalPages}
                aria-label={t('pagination_suivante')}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground disabled:opacity-40 hover:bg-background transition-colors text-base"
            >›</button>
        </nav>
    )
}

// ─── LaverieCard ──────────────────────────────────────────────────────────────

function LaverieCard({
    laverie,
    onDeleted,
}: {
    laverie: Laverie
    onDeleted: (id: number) => void
}) {
    const { t } = useTranslation()
    const badgeLabels = getBadgeLabels(t)
    const [menuOpen, setMenuOpen] = useState(false)
    const [deleteDrawerOpen, setDeleteDrawerOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteError, setDeleteError] = useState("")

    const handleDelete = async () => {
        setDeleteLoading(true)
        setDeleteError("")
        try {
            await apiClient.delete(`/laverie/suppression/${laverie.id}`)
            setDeleteDrawerOpen(false)
            onDeleted(laverie.id)
        } catch {
            setDeleteError(t('admin_laverie_supprimer_erreur'))
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <Card className="overflow-hidden rounded-2xl p-0 gap-0 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Image */}
            <div className="relative bg-card overflow-hidden w-full">
                {laverie.image_url ? (
                    <img
                        src={laverie.image_url}
                        alt={t('favoris_photo_alt', { name: laverie.nom_etablissement })}
                        className="w-full h-auto max-h-44 object-contain"
                    />
                ) : (
                    <div className="h-44 w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <svg className="w-14 h-14 text-blue-300 dark:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 4h16v2H4V4zm0 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8zm4 4v4m4-4v4" />
                        </svg>
                    </div>
                )}
                <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full ${BADGE_STYLES[laverie.statut]}`}>
                    {badgeLabels[laverie.statut]}
                </span>
            </div>

            {/* Contenu */}
            <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                    <h3 className="font-semibold text-foreground text-base leading-tight">
                        {laverie.nom_etablissement}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t('admin_proprietaire', { name: laverie.proprietaire_nom })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {t('admin_cree_le', { date: laverie.date_creation })}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <Button asChild variant="default" size="sm" aria-label={t('admin_voir_demande_aria', { name: laverie.nom_etablissement })}>
                        <Link to={`/admin/laverie/${laverie.id}`}>{t('admin_voir_demande')}</Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                            {t('admin_soumis_il_y_a', { temps: laverie.soumis_il_y_a })}
                        </span>

                        {/* Bouton 3 points */}
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(v => !v)}
                                aria-label={t('plus_actions_aria')}
                                aria-haspopup="true"
                                aria-expanded={menuOpen}
                                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:bg-muted hover:text-muted-foreground transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="5"  r="1.5" />
                                    <circle cx="12" cy="12" r="1.5" />
                                    <circle cx="12" cy="19" r="1.5" />
                                </svg>
                            </button>

                            {menuOpen && (
                                <ContextMenu
                                    laverieId={laverie.id}
                                    onClose={() => setMenuOpen(false)}
                                    onDeleteRequest={() => setDeleteDrawerOpen(true)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>

            <Drawer open={deleteDrawerOpen} onOpenChange={setDeleteDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader className="text-center">
                        <DrawerTitle>{t('admin_laverie_supprimer_titre')}</DrawerTitle>
                        <DrawerDescription>
                            {t('admin_laverie_supprimer_texte', { name: laverie.nom_etablissement })}
                        </DrawerDescription>
                    </DrawerHeader>

                    {deleteError && (
                        <p role="alert" className="px-4 text-red-500 dark:text-red-400 text-sm text-center">
                            {deleteError}
                        </p>
                    )}

                    <DrawerFooter>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            aria-busy={deleteLoading}
                            className="w-full"
                        >
                            {deleteLoading ? t('admin_laverie_supprimer_en_cours') : t('admin_laverie_supprimer_confirmer')}
                        </Button>
                        <DrawerClose asChild>
                            <Button variant="outline" disabled={deleteLoading} className="w-full">
                                {t('annuler')}
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </Card>
    )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function LaveriesValidation() {
    const { t } = useTranslation()
    const onglets = getOnglets(t)
    const badgeLabels = getBadgeLabels(t)
    const [onglet, setOnglet]         = useState<StatutOnglet>("EN_ATTENTE")
    const [laveries, setLaveries]     = useState<Laverie[]>([])
    const [pagination, setPagination] = useState<PaginationState>({ page: 1, total_pages: 1, total: 0 })
    const [loading, setLoading]       = useState(false)
    const [error, setError]           = useState<string | null>(null)

    const fetchLaveries = useCallback(async (statut: StatutOnglet, page: number) => {
        setLoading(true)
        setError(null)
        try {
            const { data: json } = await apiClient.get('/laverie/list', {
                params: { statut, page, limit: 4 },
            })
            setLaveries((json.data ?? []).map(normaliser))
            setPagination({
                page:        json.page        ?? page,
                total_pages: json.total_pages ?? 1,
                total:       json.total       ?? 0,
            })
        } catch {
            setError(t("admin_laveries_erreur_chargement"))
        } finally {
            setLoading(false)
        }
    }, [t])

    useEffect(() => {
        fetchLaveries(onglet, 1)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [onglet, fetchLaveries])

    const handlePageChange = (p: number) => {
        fetchLaveries(onglet, p)
        setPagination(prev => ({ ...prev, page: p }))
        window.scrollTo({ top: 0, behavior: "smooth" })
    }


    return (
        <div className="min-h-screen bg-background">
            <main className="max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-semibold text-foreground mb-5">
                    {t('admin_demandes_laveries_titre')}
                </h1>

                <FilterTabs tabs={onglets} active={onglet} onChange={setOnglet} />

                {loading && (
                    <div role="status" aria-live="polite" className="flex flex-col gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-card rounded-2xl h-64 animate-pulse border border-border" />
                        ))}
                        <span className="sr-only">{t('chargement')}</span>
                    </div>
                )}

                {!loading && error && (
                    <div role="alert" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {!loading && !error && laveries.length === 0 && (
                    <p className="text-center text-gray-400 dark:text-gray-500 py-12 text-sm">
                        {t('admin_laveries_vide')}
                    </p>
                )}

                {!loading && !error && laveries.length > 0 && (
                    <>
                        <div
                            role="list"
                            aria-label={t('admin_laveries_aria_liste', { statut: badgeLabels[onglet].toLowerCase() })}
                            className="flex flex-col gap-5"
                        >
                            {laveries.map(laverie => (
                                <div key={laverie.id} role="listitem">
                                    <LaverieCard
                                        laverie={laverie}
                                        onDeleted={(id) => setLaveries(prev => prev.filter(l => l.id !== id))}
                                    />
                                </div>
                            ))}
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