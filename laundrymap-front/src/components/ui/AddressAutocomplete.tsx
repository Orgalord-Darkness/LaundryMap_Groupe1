import { useState, useEffect, useRef, useCallback } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressSuggestion {
    label:        string
    housenumber?: string
    street?:      string
    name:         string
    postcode:     string
    city:         string
}

export interface AddressSelection {
    address:  string
    postcode: string
    city:     string
}

interface AddressAutocompleteProps {
    value:        string
    onChange:     (val: string) => void
    onSelect:     (selection: AddressSelection) => void
    className?:   string
    placeholder?: string
}

// ─── Fetch des suggestions ────────────────────────────────────────────────────

async function fetchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
    if (query.trim().length < 3) return []
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=fr`
    const response = await fetch(url)
    if (!response.ok) return []
    const data = await response.json()
    return (data.features ?? []).map((f: any) => {
        const p = f.properties
        const label = [p.housenumber, p.street ?? p.name, p.postcode, p.city]
            .filter(Boolean)
            .join(' ')
        return {
            label,
            housenumber: p.housenumber,
            street:      p.street,
            name:        p.name ?? label,
            postcode:    p.postcode ?? '',
            city:        p.city ?? '',
        }
    })
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function AddressAutocomplete({
    value,
    onChange,
    onSelect,
    className,
    placeholder,
}: AddressAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [activeIndex, setActiveIndex]   = useState(-1)

    const containerRef = useRef<HTMLDivElement>(null)
    const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ─── Autocomplétion avec debounce 300ms ──────────────────────────────────
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (value.trim().length < 3) {
            setSuggestions([])
            setShowDropdown(false)
            return
        }
        debounceRef.current = setTimeout(async () => {
            const results = await fetchAddressSuggestions(value)
            setSuggestions(results)
            setShowDropdown(results.length > 0)
            setActiveIndex(-1)
        }, 300)
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
    }, [value])

    // ─── Fermeture si clic en dehors ──────────────────────────────────────────
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
    const handleSelectSuggestion = useCallback((suggestion: AddressSuggestion) => {
        const address = suggestion.housenumber && suggestion.street
            ? `${suggestion.housenumber} ${suggestion.street}`
            : suggestion.name
        onChange(address)
        onSelect({ address, postcode: suggestion.postcode, city: suggestion.city })
        setSuggestions([])
        setShowDropdown(false)
        setActiveIndex(-1)
    }, [onChange, onSelect])

    // ─── Navigation clavier ───────────────────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) return
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex(prev => Math.max(prev - 1, -1))
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                handleSelectSuggestion(suggestions[activeIndex])
            } else {
                setShowDropdown(false)
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false)
            setActiveIndex(-1)
        }
    }

    // ─── Rendu ────────────────────────────────────────────────────────────────
    return (
        <div ref={containerRef} className="relative w-full">
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder={placeholder}
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={showDropdown}
                aria-controls="address-suggestions"
                aria-activedescendant={activeIndex >= 0 ? `addr-suggestion-${activeIndex}` : undefined}
                className={`w-full rounded-md border px-3 py-2 text-sm bg-background outline-none transition-all
                    focus:ring-2 focus:ring-primary/40 focus:border-primary h-11 ${className ?? ""}`}
            />

            {showDropdown && (
                <ul
                    id="address-suggestions"
                    role="listbox"
                    aria-label="Suggestions d'adresses"
                    className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                >
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            id={`addr-suggestion-${index}`}
                            role="option"
                            aria-selected={activeIndex === index}
                            onMouseDown={() => handleSelectSuggestion(suggestion)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`
                                px-4 py-2.5 text-sm cursor-pointer transition-colors flex flex-col gap-0.5
                                ${activeIndex === index
                                    ? "bg-primary/10 text-primary"
                                    : "text-foreground hover:bg-background"
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
    )
}
