import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { PersonalSpaceNavbar, TAB_ROUTES, type PersonalSpaceTab } from "@/components/ui/PersonalSpaceNavbar"
import axios from "axios"

type ReviewItem = {
    id: number
    note: number
    note_le: string
    commentaire: string | null
    commentaire_le: string | null
    laverie: {
        id: number
        nom: string
    }
}

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/utilisateur/review`


// ---------- Sous-composants ----------

function StarRating({ note }: { note: number }) {
    return (
        <div className="flex gap-0.5" aria-label={`Note : ${note} sur 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`text-lg leading-none ${star <= note ? "text-yellow-400" : "text-gray-200"}`}
                >
                    ★
                </span>
            ))}
        </div>
    )
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

// Modale de confirmation de suppression
function ConfirmDeleteModal({
    onConfirm,
    onCancel,
    loading,
}: {
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-2">
                    Supprimer cet avis ?
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                    Cette action est irréversible. Votre note et votre commentaire seront définitivement supprimés.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                    >
                        {loading ? "Suppression…" : "Supprimer"}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Carte d'un avis
function ReviewCard({
    review,
    onDeleteRequest,
}: {
    review: ReviewItem
    onDeleteRequest: (id: number) => void
}) {
    return (
        <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
            {/* En-tête */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-gray-800 text-sm leading-tight">
                    {review.laverie.nom}
                </p>
                <button
                    onClick={() => onDeleteRequest(review.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors shrink-0 text-lg leading-none"
                    aria-label="Supprimer cet avis"
                    title="Supprimer"
                >
                    ✕
                </button>
            </div>

            {/* Note */}
            <StarRating note={review.note} />
            <p className="text-xs text-gray-400 mt-0.5">
                Noté le {formatDate(review.note_le)}
            </p>

            {/* Commentaire */}
            {review.commentaire ? (
                <div className="mt-3">
                    <p className="text-sm text-gray-600">{review.commentaire}</p>
                    {review.commentaire_le && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            Commenté le {formatDate(review.commentaire_le)}
                        </p>
                    )}
                </div>
            ) : (
                <p className="mt-3 text-xs text-gray-400 italic">Aucun commentaire.</p>
            )}
        </div>
    )
}

// ---------- Page principale ---------- 

export default function Review() {
    const navigate = useNavigate()

    const [reviews, setReviews]           = useState<ReviewItem[]>([])
    const [loading, setLoading]           = useState(true)
    const [error, setError]               = useState<string | null>(null)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [deleteLoading, setDeleteLoading]   = useState(false)

    const handleTabChange = (tab: PersonalSpaceTab) => {
        const route = TAB_ROUTES[tab]
        if (route) navigate(route)
    }

    // Chargement initial
    useEffect(() => {
        axios
            .get<ReviewItem[]>(BASE_URL, { withCredentials: true })
            .then((res) => setReviews(res.data))
            .catch(() => setError("Impossible de charger vos avis."))
            .finally(() => setLoading(false))
    }, [])

    // Suppression confirmée
    const handleDeleteConfirm = async () => {
        if (deleteTargetId === null) return
        setDeleteLoading(true)
        try {
            await axios.delete(`${BASE_URL}/${deleteTargetId}`, {
                withCredentials: true,
            })
            // Mise à jour locale sans recharger la page
            setReviews((prev) => prev.filter((r) => r.id !== deleteTargetId))
            setDeleteTargetId(null)
        } catch {
            setError("La suppression a échoué. Veuillez réessayer.")
            setDeleteTargetId(null)
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Modale de confirmation */}
            {deleteTargetId !== null && (
                <ConfirmDeleteModal
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTargetId(null)}
                    loading={deleteLoading}
                />
            )}

            {/* Header */}
            <div className="bg-white px-4 pt-6 pb-0">
                <div className="max-w-lg mx-auto">
                    <div className="text-center mb-4">
                        <h1 className="text-xl font-bold text-gray-900">Espace personnel</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Mes avis</p>
                    </div>
                    <PersonalSpaceNavbar active="Avis" onChange={handleTabChange} />
                </div>
            </div>

            {/* Contenu */}
            <main className="flex-1 px-4 py-5 w-full max-w-lg mx-auto">

                {loading && (
                    <p className="text-center py-10 text-gray-400 text-sm">
                        Chargement de vos avis…
                    </p>
                )}

                {error && (
                    <p className="text-center py-10 text-red-500 text-sm">{error}</p>
                )}

                {!loading && !error && (
                    <>
                        {/* Compteur */}
                        {reviews.length > 0 && (
                            <p className="text-xs text-gray-400 mb-3">
                                {reviews.length} avis{reviews.length > 1 ? "" : ""}
                            </p>
                        )}

                        <div className="space-y-3">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        onDeleteRequest={setDeleteTargetId}
                                    />
                                ))
                            ) : (
                                <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
                                    <p className="text-gray-400 text-sm">
                                        Vous n'avez pas encore laissé d'avis.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}

            </main>
        </div>
    )
}