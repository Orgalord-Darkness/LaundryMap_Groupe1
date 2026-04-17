import { useState, useEffect, useRef, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Suggestion {
    label: string      // Adresse complète affichée (ex: "12 Rue de la Paix 75001 Paris")
    city: string
    postcode: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Appel à l'API gouvernementale d'autocomplétion d'adresses françaises.
// Gratuite, sans clé API, gère les accents et fautes de frappe.
async function fetchSuggestions(query: string): Promise<Suggestion[]> {
    if (query.trim().length < 2) return []

    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
    const response = await fetch(url)
    if (!response.ok) return []

    const data = await response.json()
    return (data.features ?? []).map((f: Record<string, Record<string, string>>) => ({
        label: f.properties.label,
        city: f.properties.city,
        postcode: f.properties.postcode,
    }))
}

// ─── SearchBar — champ de recherche avec autocomplétion ───────────────────────

interface SearchBarProps {
    onSearch: (query: string) => void
    loading: boolean
    onFilterClick: () => void
    activeFilterCount: number
}

export function SearchBar({ onSearch, loading, onFilterClick, activeFilterCount }: SearchBarProps) {
    const { t } = useTranslation()

    const [value, setValue] = useState("")
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const [touched, setTouched] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ─── Autocomplétion : appel API avec debounce 300ms ───────────────────────
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (value.trim().length < 2) {
            setSuggestions([])
            setShowDropdown(false)
            return
        }

        debounceRef.current = setTimeout(async () => {
            const results = await fetchSuggestions(value)
            setSuggestions(results)
            setShowDropdown(results.length > 0)
            setActiveIndex(-1)
        }, 300)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [value])

    // ─── Ferme le dropdown si clic en dehors ──────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // ─── Sélection d'une suggestion ───────────────────────────────────────────
    const handleSelectSuggestion = useCallback((suggestion: Suggestion) => {
        setValue(suggestion.label)
        setSuggestions([])
        setShowDropdown(false)
        setActiveIndex(-1)
        setTouched(false)
        onSearch(suggestion.label)
    }, [onSearch])

    // ─── Navigation clavier dans le dropdown ──────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) {
            if (e.key === "Enter") handleSubmit(e as unknown as React.FormEvent)
            return
        }

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex((prev) => Math.max(prev - 1, -1))
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                handleSelectSuggestion(suggestions[activeIndex])
            } else {
                handleSubmit(e as unknown as React.FormEvent)
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false)
            setActiveIndex(-1)
        }
    }

    // ─── Soumission du formulaire ─────────────────────────────────────────────
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setTouched(true)
        setShowDropdown(false)
        if (value.trim() === "") return
        onSearch(value.trim())
    }

    // ─── Rendu ────────────────────────────────────────────────────────────────

    return (
        <form
            onSubmit={handleSubmit}
            role="search"
            aria-label="Rechercher une laverie"
            className="flex gap-2 items-start"
        >
            {/* Champ + dropdown */}
            <div ref={containerRef} className="flex-1 relative">
                <label htmlFor="search-input" className="sr-only">
                    {t("search_placeholder")}
                </label>

                <input
                    id="search-input"
                    type="text"
                    value={value}
                    onChange={(e) => { setValue(e.target.value); setTouched(false) }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    placeholder={t("search_placeholder")}
                    aria-label={t("search_placeholder")}
                    aria-autocomplete="list"
                    aria-expanded={showDropdown}
                    aria-controls="search-suggestions"
                    aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
                    disabled={loading}
                    autoComplete="off"
                    className={`
                        w-full rounded-xl border px-4 py-2.5 text-sm bg-white
                        shadow-sm outline-none transition-all duration-200
                        focus:ring-2 focus:ring-primary/40 focus:border-primary
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${touched && value.trim() === "" ? "border-red-400" : "border-gray-200"}
                    `}
                />

                {/* Message de validation */}
                {touched && value.trim() === "" && (
                    <p className="text-xs text-red-500 mt-1 ml-1" role="alert">
                        Veuillez saisir une ville ou un code postal.
                    </p>
                )}

                {/* Dropdown de suggestions */}
                {showDropdown && (
                    <ul
                        id="search-suggestions"
                        role="listbox"
                        aria-label="Suggestions d'adresses"
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    >
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                id={`suggestion-${index}`}
                                role="option"
                                aria-selected={activeIndex === index}
                                onMouseDown={() => handleSelectSuggestion(suggestion)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={`
                                    px-4 py-2.5 text-sm cursor-pointer transition-colors duration-100
                                    flex flex-col gap-0.5
                                    ${activeIndex === index
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }
                                `}
                            >
                                <span className="font-medium leading-tight">{suggestion.label}</span>
                                <span className="text-xs text-gray-400">{suggestion.postcode} {suggestion.city}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Bouton filtres */}
            <div className="relative shrink-0">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onFilterClick}
                    aria-label="Ouvrir les filtres"
                    className="rounded-xl px-4 gap-2 py-2.5"
                >
                    <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Filtres</span>
                </Button>
                {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {activeFilterCount}
                    </span>
                )}
            </div>

            {/* Bouton rechercher */}
            <Button
                type="submit"
                disabled={loading}
                aria-label={t("search_button")}
                className="rounded-xl px-5 gap-2 shrink-0 py-2.5"
            >
                {loading ? (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                    <Search className="w-4 h-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{t("search_button")}</span>
            </Button>
        </form>
    )
}
