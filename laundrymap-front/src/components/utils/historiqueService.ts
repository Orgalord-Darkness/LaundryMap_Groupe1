import apiClient from "@/lib/apiClient"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HistoriqueEntryRaw {
    id: number
    date: string
    action: string
    motif_action: string | null
    laverie_id: number
    laverie_nom: string
    proprietaire_nom: string
    proprietaire_prenom: string
    administrateur_id: number
}

export interface HistoriqueEntry {
    id: number
    date: string
    horodatage: string
    action: "VALIDE" | "REFUSE"
    laverie_id: number
    laverie_nom: string
    proprietaire: string
    motif: string | null
    administrateur_id: number
}

export interface HistoriquePage {
    entries: HistoriqueEntry[]
    page: number
    total_pages: number
    total: number
}

// ─── Normalisation ────────────────────────────────────────────────────────────

export function normaliser(raw: HistoriqueEntryRaw): HistoriqueEntry {
    const dateObj    = new Date(raw.date)
    const date       = dateObj.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    const horodatage = dateObj.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

    return {
        id:               raw.id,
        date,
        horodatage,
        action:           raw.action === "VALIDE" ? "VALIDE" : "REFUSE",
        laverie_id:       raw.laverie_id,
        laverie_nom:      raw.laverie_nom,
        proprietaire:     `${raw.proprietaire_prenom} ${raw.proprietaire_nom}`,
        motif:            raw.motif_action,
        administrateur_id: raw.administrateur_id,
    }
}

// ─── Accès API ────────────────────────────────────────────────────────────────
export async function fetchHistoriquePage(page: number): Promise<HistoriquePage> {
    const { data: json } = await apiClient.get('/admin/laveries/historique', { params: { page } })
    return {
        entries:     (json.enregistrements ?? []).map(normaliser),
        page:        json.page        ?? page,
        total_pages: json.total_pages ?? 1,
        total:       json.total       ?? 0,
    }
}
