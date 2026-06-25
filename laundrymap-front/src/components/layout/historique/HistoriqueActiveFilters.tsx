import { X, SlidersHorizontal } from "lucide-react"

// ─── HistoriqueActiveFilters — chips de filtres actifs + bouton d'ouverture de la modale ──

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

interface HistoriqueActiveFiltersProps<F extends Record<string, string | undefined>> {
    filters: F
    labelFor: (key: string, value: string) => string
    onRemove: (key: string) => void
    onOpenFilters: () => void
    filterButtonLabel: string
}

export function HistoriqueActiveFilters<F extends Record<string, string | undefined>>({
    filters,
    labelFor,
    onRemove,
    onOpenFilters,
    filterButtonLabel,
}: HistoriqueActiveFiltersProps<F>) {
    const activeEntries = Object.entries(filters).filter(([, value]) => !!value) as [string, string][]

    return (
        <div className="flex flex-wrap items-center gap-2 mb-5">
            <button
                type="button"
                onClick={onOpenFilters}
                className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
                <SlidersHorizontal className="size-4" />
                {filterButtonLabel}
                {activeEntries.length > 0 && (
                    <span className="inline-flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground text-xs">
                        {activeEntries.length}
                    </span>
                )}
            </button>

            {activeEntries.map(([key, value]) => (
                <FilterChip key={key} label={labelFor(key, value)} onRemove={() => onRemove(key)} />
            ))}
        </div>
    )
}
