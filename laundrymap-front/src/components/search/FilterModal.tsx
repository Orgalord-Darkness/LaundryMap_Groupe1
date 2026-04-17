import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckboxGroup } from "@/components/ui/checkboxGroupEdit"
import type { SearchFilters } from "@/components/utils/type"

// ─── Options disponibles ──────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
    { value: "Wi-Fi", label: "Wifi" },
    { value: "Parking", label: "Parking" },
    { value: "Table", label: "Banc / Table" },
    { value: "Distributeur de lessive", label: "Distributeur de lessive" },
]

const PAYMENT_OPTIONS = [
    { value: "Carte Bleue", label: "Carte Bleue" },
    { value: "Pièces", label: "Pièces" },
    { value: "Billet", label: "Billet" },
    { value: "Carte Fidélité", label: "Carte Fidélité" },
]

const EMPTY_FILTERS: SearchFilters = { openAt: "", services: [], payments: [] }

// ─── FilterModal — modale de filtres de recherche ─────────────────────────────

interface FilterModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    filters: SearchFilters
    onFiltersChange: (filters: SearchFilters) => void
}

export function FilterModal({ open, onOpenChange, filters, onFiltersChange }: FilterModalProps) {

    function handleReset() {
        onFiltersChange(EMPTY_FILTERS)
    }

    function handleApply() {
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Filtrer les laveries</DialogTitle>
                </DialogHeader>

                {/* Horaires */}
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-gray-700">Horaires</p>
                    <label htmlFor="filter-time" className="text-sm text-gray-500">
                        Ouvert à partir de
                    </label>
                    <input
                        id="filter-time"
                        type="time"
                        value={filters.openAt}
                        onChange={(e) => onFiltersChange({ ...filters, openAt: e.target.value })}
                        className="w-36 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                </div>

                {/* Services */}
                <CheckboxGroup
                    title="Services"
                    options={SERVICE_OPTIONS}
                    disabled={false}
                    value={filters.services}
                    onChange={(updater) => {
                        const next = typeof updater === "function" ? updater(filters.services) : updater
                        onFiltersChange({ ...filters, services: next })
                    }}
                />

                {/* Paiements */}
                <CheckboxGroup
                    title="Moyens de paiement"
                    options={PAYMENT_OPTIONS}
                    disabled={false}
                    value={filters.payments}
                    onChange={(updater) => {
                        const next = typeof updater === "function" ? updater(filters.payments) : updater
                        onFiltersChange({ ...filters, payments: next })
                    }}
                />

                <DialogFooter>
                    <Button variant="outline" onClick={handleReset}>
                        Réinitialiser
                    </Button>
                    <Button onClick={handleApply}>
                        Appliquer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
