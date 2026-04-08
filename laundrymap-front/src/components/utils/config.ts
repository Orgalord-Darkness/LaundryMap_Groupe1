import type { StatutOnglet } from "./type"  

export const ONGLETS: { label: string; statut: StatutOnglet }[] = [
    { label: "En attente", statut: "EN_ATTENTE" },
    { label: "Validés",    statut: "VALIDE"     },
    { label: "Refusés",    statut: "REFUSE"     },
]

export const BADGE_STYLES: Record<StatutOnglet, string> = {
    EN_ATTENTE: "bg-amber-100 text-amber-700 border border-amber-200",
    VALIDE:     "bg-emerald-100 text-emerald-700 border border-emerald-200",
    REFUSE:     "bg-red-100 text-red-600 border border-red-200",
}

export const BADGE_LABELS: Record<StatutOnglet, string> = {
    EN_ATTENTE: "En attente",
    VALIDE:     "Validé",
    REFUSE:     "Refusé",
}