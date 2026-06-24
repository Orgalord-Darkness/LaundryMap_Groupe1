import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// ─── HistoriqueFilterModal — modale de filtres générique pour les pages d'historique admin ──

export interface FilterFieldConfig {
    key: string
    type: "select" | "date" | "text"
    label: string
    placeholder?: string
    options?: { value: string; label: string }[]
}

interface HistoriqueFilterModalProps<F extends Record<string, string | undefined>> {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    fields: FilterFieldConfig[]
    filters: F
    onApply: (filters: F) => void
}

export function HistoriqueFilterModal<F extends Record<string, string | undefined>>({
    open,
    onOpenChange,
    title,
    fields,
    filters,
    onApply,
}: HistoriqueFilterModalProps<F>) {
    const { t } = useTranslation()
    const [draft, setDraft] = useState<F>(filters)

    // Le brouillon repart de l'état appliqué à chaque (ré)ouverture de la modale.
    // Ajusté pendant le rendu plutôt que dans un effet pour éviter un rendu en cascade.
    const [prevOpen, setPrevOpen] = useState(open)
    if (open !== prevOpen) {
        setPrevOpen(open)
        if (open) setDraft(filters)
    }

    function setField(key: string, value: string) {
        setDraft(d => ({ ...d, [key]: value || undefined }))
    }

    function handleApply() {
        onApply(draft)
        onOpenChange(false)
    }

    function handleReset() {
        const empty = {} as F
        setDraft(empty)
        onApply(empty)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md p-0 gap-0 flex flex-col" showCloseButton={false}>
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
                </DialogHeader>

                <div className="px-6 flex flex-col gap-4 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 220px)" }}>
                    {fields.map(field => (
                        <div key={field.key} className="flex flex-col gap-1.5">
                            <label htmlFor={`filter-${field.key}`} className="text-sm font-medium text-foreground">
                                {field.label}
                            </label>
                            {field.type === "select" ? (
                                <select
                                    id={`filter-${field.key}`}
                                    value={draft[field.key] ?? ""}
                                    onChange={e => setField(field.key, e.target.value)}
                                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {field.options?.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    id={`filter-${field.key}`}
                                    type={field.type}
                                    value={draft[field.key] ?? ""}
                                    onChange={e => setField(field.key, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            )}
                        </div>
                    ))}
                    <div className="h-1" />
                </div>

                <div className="flex flex-col gap-2 px-6 py-4 border-t border-border bg-card">
                    <Button onClick={handleApply} className="w-full font-semibold">
                        {t('histo_filtre_appliquer')}
                    </Button>
                    <button
                        onClick={handleReset}
                        className="text-sm text-gray-400 hover:text-muted-foreground transition-colors py-1"
                    >
                        {t('histo_filtre_reinitialiser')}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
