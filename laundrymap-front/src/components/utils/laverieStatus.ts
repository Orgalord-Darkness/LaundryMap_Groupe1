import type { HoraireSlot } from "./type"

export const BIENTOT_SEUIL_MINUTES = 60

export type LaverieStatusType = "OUVERT" | "FERME" | "BIENTOT_FERME" | "BIENTOT_OUVERT"

const JOURS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]

function heureEnMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(":").map(Number)
    return h * 60 + m
}

function jourCourant(): string {
    return JOURS_FR[new Date().getDay()]
}

function minutesCourantes(): number {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
}

export function getLaverieStatus(
    fermetures: HoraireSlot[],
    seuil = BIENTOT_SEUIL_MINUTES
): LaverieStatusType {
    if (fermetures.length === 0) return "FERME"

    const maintenant = minutesCourantes()
    const slotsAujourdhui = fermetures.filter(slot => slot.jour === jourCourant())

    if (slotsAujourdhui.length === 0) return "FERME"

    for (const slot of slotsAujourdhui) {
        const debut = heureEnMinutes(slot.heureDebut)
        const fin = heureEnMinutes(slot.heureFin)

        if (maintenant >= debut && maintenant < fin) {
            return (fin - maintenant) <= seuil ? "BIENTOT_FERME" : "OUVERT"
        }

        if (maintenant < debut && (debut - maintenant) <= seuil) {
            return "BIENTOT_OUVERT"
        }
    }

    return "FERME"
}
