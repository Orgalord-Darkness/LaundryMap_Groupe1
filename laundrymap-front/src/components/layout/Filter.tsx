// ─── FilterTabs — composant réutilisable mobile-first ────────────────────────
// Usage :
//   <FilterTabs
//     tabs={[{ label: "En attente", value: "EN_ATTENTE" }, ...]}
//     active={onglet}
//     onChange={setOnglet}
//   />

interface Tab<T extends string> {
    label: string
    value: T
}

interface FilterTabsProps<T extends string> {
    tabs: Tab<T>[]
    active: T
    onChange: (value: T) => void
}

export function FilterTabs<T extends string>({
    tabs,
    active,
    onChange,
}: FilterTabsProps<T>) {
    return (
        <div
            role="tablist"
            aria-label="Filtrer par statut"
            className="flex items-center gap-2 w-full mb-6"
        >
            {tabs.map(({ label, value }) => (
                <button
                    key={value}
                    role="tab"
                    aria-selected={active === value}
                    onClick={() => onChange(value)}
                    className={`
                        flex-1 py-2 px-3 rounded-xl text-sm font-medium
                        transition-colors duration-150 whitespace-nowrap
                        ${active === value
                            ? "bg-primary text-white shadow-sm"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                        }
                    `}
                >
                    {label}
                </button>
            ))}
        </div>
    )
}