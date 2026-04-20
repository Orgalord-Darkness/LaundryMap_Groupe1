// ─── PersonalSpaceNavbar — onglets de navigation de l'espace personnel ────────
// Usage :
//   <PersonalSpaceNavbar active="Favoris" onChange={(tab) => navigate(`/espace/${tab.toLowerCase()}`)} />
//
// Props :
//   active   — onglet actuellement actif (doit correspondre à l'une des valeurs de TABS)
//   onChange — callback appelé avec la valeur de l'onglet sélectionné

export const PERSONAL_SPACE_TABS = ["Profil", "Favoris", "Préférences", "Avis"] as const
export type PersonalSpaceTab = (typeof PERSONAL_SPACE_TABS)[number]

export const TAB_ROUTES: Record<PersonalSpaceTab, string | null> = {
    Profil: "/user/informations",
    Favoris: "/user/favoris",
    Préférences: null,
    Avis: null,
}

interface PersonalSpaceNavbarProps {
    active: PersonalSpaceTab
    onChange: (tab: PersonalSpaceTab) => void
}

export function PersonalSpaceNavbar({ active, onChange }: PersonalSpaceNavbarProps) {
    return (
        <nav aria-label="Navigation espace personnel" className="w-full">
            <div
                role="tablist"
                className="flex items-center w-full border-b border-gray-200 bg-white"
            >
                {PERSONAL_SPACE_TABS.map((tab) => {
                    const isActive = tab === active
                    return (
                        <button
                            key={tab}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => onChange(tab)}
                            className={`
                                flex-1 py-3 text-sm font-medium text-center
                                transition-colors duration-150
                                relative whitespace-nowrap
                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset
                                ${isActive
                                    ? "text-primary"
                                    : "text-gray-500 hover:text-gray-700"
                                }
                            `}
                        >
                            {tab}
                            {/* Indicateur souligné sous l'onglet actif */}
                            {isActive && (
                                <span
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                    aria-hidden="true"
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}