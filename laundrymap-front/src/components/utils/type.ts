export type StatutOnglet = "EN_ATTENTE" | "VALIDE" | "REFUSE"
export const STATUT_LABELS: Record<StatutOnglet, string> = {
    EN_ATTENTE: "En attente",
    VALIDE:     "Validé",
    REFUSE:     "Refusé",
}

export type Role = "guest" | "utilisateur" | "professionnel" | "administrateur"

export interface Laverie {
    id: number
    nom_etablissement: string
    proprietaire_nom: string
    date_creation: string
    statut: StatutOnglet
    image_url?: string
    soumis_il_y_a?: string
}

export interface PaginationState {
    page: number
    total_pages: number
    total: number
}

export const BADGE_LABELS = {
    ouvert: "Ouvert",
    ferme: "Fermé",
    // Add other statuses as needed
}

export const BADGE_STYLES = {
    ouvert: "bg-green-100 text-green-800",
    ferme: "bg-red-100 text-red-800",
    // Add other statuses as needed
}

export interface LaverieAPI {
    id: number
    nom_etablissement: string
    statut: StatutOnglet
    date_ajout: string
    logo: {
        id: number
        emplacement: string
    } | null
    professionnel: {
        id: number
        utilisateur: {
            id: number
            nom: string
            prenom: string
        }
    } | null
}

export interface Service {
  id: number | string;
  nom: string;
}

export interface Paiement {
  id: number | string;
  nom: string;
}

export type JourSemaine =
  | "lundi"
  | "mardi"
  | "mercredi"
  | "jeudi"
  | "vendredi"
  | "samedi"
  | "dimanche"

export interface DaySchedule {
  open: boolean
  start: string | null
  end: string | null
}

export type WeekSchedule = Record<JourSemaine, DaySchedule>

