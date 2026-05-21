import { useState, useEffect } from "react"
import { getLaverieStatus, type LaverieStatusType } from "./laverieStatus"
import type { HoraireSlot } from "./type"

const BADGE_CONFIG: Record<LaverieStatusType, { label: string; classes: string; dot: string }> = {
    OUVERT: {
        label: "Ouvert",
        classes: "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        dot: "bg-emerald-500 animate-pulse",
    },
    BIENTOT_FERME: {
        label: "Ferme bientôt",
        classes: "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
        dot: "bg-orange-500 animate-pulse",
    },
    BIENTOT_OUVERT: {
        label: "Ouvre bientôt",
        classes: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        dot: "bg-blue-500",
    },
    FERME: {
        label: "Fermé",
        classes: "bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
        dot: "bg-rose-500",
    },
}

interface StatusBadgeProps {
    fermetures?: HoraireSlot[]
    className?: string
}

export function StatusBadge({ fermetures, className = "" }: StatusBadgeProps) {
    const [status, setStatus] = useState<LaverieStatusType | null>(null)

    useEffect(() => {
        if (!fermetures || fermetures.length === 0) return

        const compute = () => setStatus(getLaverieStatus(fermetures))
        compute()

        const timer = setInterval(compute, 60_000)
        return () => clearInterval(timer)
    }, [fermetures])

    if (!status) return null

    const { label, classes, dot } = BADGE_CONFIG[status]

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold leading-tight ${classes} ${className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
            {label}
        </span>
    )
}
