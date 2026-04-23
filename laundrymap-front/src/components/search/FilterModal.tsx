import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
            <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 gap-0 flex flex-col" showCloseButton={false}>

                {/* En-tête */}
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Filtrer les laveries
                    </DialogTitle>
                </DialogHeader>

                {/* Corps scrollable */}
                <div className="px-6 flex flex-col gap-5 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 220px)" }}>

                    {/* Horaires */}
                    <div className="flex flex-col gap-1.5">
                        <p className="text-sm font-semibold text-gray-800">Horaires</p>
                        <label htmlFor="filter-time" className="text-sm text-primary font-medium">
                            Ouvert à partir de
                        </label>
                        <input
                            id="filter-time"
                            type="time"
                            value={filters.openAt}
                            onChange={(e) => onFiltersChange({ ...filters, openAt: e.target.value })}
                            className="w-40 rounded-lg border-2 border-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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

                    {/* Espace bas pour ne pas coller au footer */}
                    <div className="h-1" />
                </div>

                {/* Footer fixe — bouton centré */}
                <div className="flex flex-col gap-2 px-6 py-4 border-t border-gray-100 bg-white">
                    <Button
                        onClick={handleApply}
                        className="w-full font-semibold"
                    >
                        Appliquer
                    </Button>
                    <button
                        onClick={handleReset}
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
                    >
                        Réinitialiser les filtres
                    </button>
                </div>

            </DialogContent>
        </Dialog>
    )
}