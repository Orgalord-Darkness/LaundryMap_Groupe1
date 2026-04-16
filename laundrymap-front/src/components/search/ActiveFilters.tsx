import { X } from "lucide-react"
import type { SearchFilters } from "@/components/utils/type"

// ─── Libellés affichés dans les chips ─────────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
    "Wi-Fi": "Wifi",
    "Parking": "Parking",
    "Table": "Banc / Table",
    "Distributeur de lessive": "Distributeur de lessive",
}

const PAYMENT_LABELS: Record<string, string> = {
    "Carte Bleue": "Carte Bleue",
    "Pièces": "Pièces",
    "Billet": "Billet",
    "Carte Fidélité": "Carte Fidélité",
}

// ─── FilterChip — un filtre actif avec bouton de suppression ──────────────────

interface FilterChipProps {
    label: string
    onRemove: () => void
}

function FilterChip({ label, onRemove }: FilterChipProps) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Supprimer le filtre ${label}`}
                className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
            >
                <X className="size-3" />
            </button>
        </span>
    )
}

// ─── ActiveFilters — barre de chips des filtres actifs ────────────────────────

interface ActiveFiltersProps {
    filters: SearchFilters
    onRemoveFilter: (type: "openAt" | "service" | "payment", value: string) => void
}

export function ActiveFilters({ filters, onRemoveFilter }: ActiveFiltersProps) {
    const hasFilters =
        filters.openAt !== "" ||
        filters.services.length > 0 ||
        filters.payments.length > 0

    if (!hasFilters) return null

    return (
        <div className="flex flex-wrap gap-2 py-1" aria-label="Filtres actifs">
            {filters.openAt && (
                <FilterChip
                    label={`Ouvert à ${filters.openAt}`}
                    onRemove={() => onRemoveFilter("openAt", "")}
                />
            )}
            {filters.services.map((s) => (
                <FilterChip
                    key={s}
                    label={SERVICE_LABELS[s] ?? s}
                    onRemove={() => onRemoveFilter("service", s)}
                />
            ))}
            {filters.payments.map((p) => (
                <FilterChip
                    key={p}
                    label={PAYMENT_LABELS[p] ?? p}
                    onRemove={() => onRemoveFilter("payment", p)}
                />
            ))}
        </div>
    )
}
