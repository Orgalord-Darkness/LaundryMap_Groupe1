import axios from "axios"
import { useState } from "react"

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
    withCredentials: true,
})
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
    return config
})

interface FavoriteButtonProps {
    laverieId: number
    onRemoved: () => void
    className?: string
}

export function DeleteFavoriteButton({ laverieId, onRemoved, className = "" }: FavoriteButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleRemove = async () => {
        if (loading) return
        setLoading(true)
        try {
            await api.delete(`/favori/remove/${laverieId}`)
            onRemoved()
        } catch (err) {
            console.error("Erreur suppression favori", err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleRemove}
            disabled={loading}
            aria-label="Retirer des favoris"
            title="Retirer des favoris"
            className={`
                group relative flex items-center justify-center
                w-10 h-10 rounded-full
                bg-white/90 backdrop-blur-sm
                shadow-md border border-white/60
                transition-all duration-200
                hover:scale-110 hover:shadow-lg hover:bg-red-50
                active:scale-95
                disabled:opacity-60 disabled:cursor-not-allowed
                ${className}
            `}
        >
            {loading ? (
                // Spinner pendant la suppression
                <svg
                    className="w-4 h-4 animate-spin text-red-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
            ) : (
                // Cœur plein rouge (favori actif) — au hover, affiche un minus pour indiquer la suppression
                <span className="relative">
                    {/* Cœur par défaut */}
                    <svg
                        className="w-5 h-5 text-red-500 fill-red-500 group-hover:opacity-0 transition-opacity duration-150"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                    </svg>
                    {/* Cœur barré au hover */}
                    <svg
                        className="w-5 h-5 text-red-400 fill-red-100 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                        />
                        {/* Trait de suppression */}
                        <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" stroke="#ef4444" />
                    </svg>
                </span>
            )}
        </button>
    )
}