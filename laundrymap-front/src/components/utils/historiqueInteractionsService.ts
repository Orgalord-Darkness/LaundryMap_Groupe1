import apiClient from "@/lib/apiClient"

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionLabel = "BLOCAGE" | "LEVEE_BLOCAGE" | "VALIDATION_PRO" | "REFUS_PRO"

export interface HistoriqueInteractionEntryRaw {
    id: number
    type_interaction: "BLOCAGE" | "COMPTE_PRO"
    date: string
    action: string
    action_label: string
    motif_action: string | null
    utilisateur_id: number
    utilisateur_nom: string
    utilisateur_prenom: string
    utilisateur_email: string
    administrateur_id: number
    administrateur_email: string | null
}

export interface HistoriqueInteractionEntry {
    id: number
    type_interaction: "BLOCAGE" | "COMPTE_PRO"
    date: string
    horodatage: string
    action_label: string
    utilisateur_id: number
    utilisateur_nom_complet: string
    utilisateur_email: string
    motif: string | null
    administrateur_id: number
    administrateur_email: string | null
}

export interface HistoriqueInteractionPage {
    entries: HistoriqueInteractionEntry[]
    page: number
    total_pages: number
    total: number
}

// ─── Normalisation ────────────────────────────────────────────────────────────

export function normaliser(raw: HistoriqueInteractionEntryRaw): HistoriqueInteractionEntry {
    const dateObj    = new Date(raw.date)
    const date       = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    const horodatage = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

    return {
        id:                   raw.id,
        type_interaction:     raw.type_interaction,
        date,
        horodatage,
        action_label:         raw.action_label,
        utilisateur_id:       raw.utilisateur_id,
        utilisateur_nom_complet: `${raw.utilisateur_prenom} ${raw.utilisateur_nom}`,
        utilisateur_email:    raw.utilisateur_email,
        motif:                raw.motif_action,
        administrateur_id:    raw.administrateur_id,
        administrateur_email: raw.administrateur_email ?? null,
    }
}

// ─── Filtres ──────────────────────────────────────────────────────────────────

export interface HistoriqueInteractionFilters {
    [key: string]: string | undefined
    action?: ActionLabel
    dateDebut?: string
    dateFin?: string
    utilisateur?: string
    motif?: string
}

// ─── Accès API ────────────────────────────────────────────────────────────────

export async function fetchHistoriqueInteractionsPage(
    page: number,
    filters: HistoriqueInteractionFilters = {},
): Promise<HistoriqueInteractionPage> {
    const params: Record<string, string | number> = { page }
    if (filters.action)      params.action      = filters.action
    if (filters.dateDebut)   params.date_debut   = filters.dateDebut
    if (filters.dateFin)     params.date_fin     = filters.dateFin
    if (filters.utilisateur) params.utilisateur  = filters.utilisateur
    if (filters.motif)       params.motif        = filters.motif

    const { data: json } = await apiClient.get('/admin/utilisateurs/historique', { params })
    return {
        entries:     (json.enregistrements ?? []).map(normaliser),
        page:        json.page        ?? page,
        total_pages: json.total_pages ?? 1,
        total:       json.total       ?? 0,
    }
}
