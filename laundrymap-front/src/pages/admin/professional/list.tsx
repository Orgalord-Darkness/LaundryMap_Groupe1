import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/lib/apiClient'

interface ProItem {
    id: number
    siren: number
    statut: string
    utilisateur: { id: number; nom: string; prenom: string; email: string }
    adresse: { ville: string; pays: string } | null
}

function ProfessionnalAccountValidationList() {
    const navigate = useNavigate()
    const [pros, setPros] = useState<ProItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        apiClient.get('/professionnel/admin/list', { params: { statut: 'en attente' } })
            .then(res => setPros(res.data.data ?? []))
            .catch(() => setError('Impossible de charger la liste des professionnels.'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-4 max-w-md mx-auto mt-10">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (error) {
        return <div className="p-10 text-red-500 dark:text-red-400 text-center">{error}</div>
    }

    return (
        <div className="flex flex-col items-center p-4 min-h-screen">
            <h1 className="font-bold text-2xl mt-6">Validation des comptes professionnels</h1>
            <p className="text-muted-foreground text-center mt-2 mb-6">
                Gérez les comptes professionnels en attente de validation
            </p>

            {pros.length === 0 ? (
                <p className="text-gray-400 mt-10">Aucun compte en attente de validation.</p>
            ) : (
                <div className="w-full max-w-sm flex flex-col gap-4">
                    {pros.map((pro) => (
                        <div
                            key={pro.id}
                            className="bg-card border border-border shadow-md p-6 rounded-lg"
                        >
                            <h3 className="text-xl font-semibold text-foreground">
                                {pro.utilisateur.prenom} {pro.utilisateur.nom}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">{pro.utilisateur.email}</p>

                            <div className="mt-3">
                                <span className="text-sm font-semibold text-foreground">SIREN : </span>
                                <span className="text-sm text-muted-foreground">{pro.siren}</span>
                            </div>

                            {pro.adresse?.ville && (
                                <div className="mt-1">
                                    <span className="text-sm font-semibold text-foreground">Ville : </span>
                                    <span className="text-sm text-muted-foreground">{pro.adresse.ville}</span>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => navigate(`/admin/professionnel/${pro.id}`)}
                                className="mt-5 px-5 py-2 rounded-md text-white text-sm font-medium bg-primary hover:bg-secondary hover:text-primary hover:border-1 hover:border-primary cursor-pointer"
                            >
                                Examiner
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProfessionnalAccountValidationList
