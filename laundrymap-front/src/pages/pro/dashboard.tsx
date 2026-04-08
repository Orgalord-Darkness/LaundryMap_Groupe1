import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface Laundry {
    id: number;
    nom: string;
    statut: 'validée' | 'refusée' | 'en_attente';
    logoUrl: string | null;
    rating: number | null;
    avis: number;
}

function LaundryCard({ laundry }: { laundry: Laundry }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center">
                <img
                    src={laundry.logoUrl ?? 'https://laverie.mobi/public_medias/image_file/file/0193500f-d148-7b3f-a980-1df9ebf0f33d/large_400f90fa.jpeg'}
                    alt={laundry.nom}
                    className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex-1">
                    <h3 className="font-semibold text-lg">{laundry.nom}</h3>
                    <div className="flex items-center mt-1">
                        {laundry.rating !== null && (
                            <span className="text-yellow-500">★ {laundry.rating}</span>
                        )}
                        <span className="text-gray-500 ml-2">({laundry.avis} avis)</span>
                    </div>
                    <div className="mt-2">
                        {laundry.statut === 'validée' && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Validée
                            </span>
                        )}
                        {laundry.statut === 'refusée' && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                Refusée
                            </span>
                        )}
                        {laundry.statut === 'en_attente' && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                En attente
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/pro/laverie/${laundry.id}`}>Modifier</Link>
                </Button>
            </div>
        </div>
    )
}

function ProDashboard() {
    const [laundries, setLaundries] = useState<Laundry[]>([])
    const [total, setTotal]         = useState<number>(0)
    const [loading, setLoading]     = useState<boolean>(true)
    const [error, setError]         = useState<string | null>(null)
    const navigate                  = useNavigate()

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/professionnel/dashboard`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (response.status === 401) {
                    navigate('/pro/login')
                    return
                }
                if (!response.ok) throw new Error('Erreur serveur')
                return response.json()
            })
            .then((data) => {
                if (!data) return
                setLaundries(data.laveries ?? [])
                setTotal(data.total ?? 0)
            })
            .catch(() => setError('Impossible de charger vos laveries.'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <p className="text-center mt-10 text-gray-500">Chargement...</p>
    if (error)   return <p className="text-center mt-10 text-red-500">{error}</p>

    return (
        <div className="flex flex-col items-center p-4 min-h-screen">
            <h1 className="font-bold text-2xl mt-6">Tableau de bord</h1>
            <p className="text-gray-500 text-center mt-2">
                Bienvenue dans votre espace professionnel
            </p>

            <div className="w-[150px] my-12">
                <div className="bg-[#0077B6] text-white p-4 rounded-lg shadow-md text-center">
                    <p className="text-lg font-semibold">{total}</p>
                    <p className="text-sm">Laveries</p>
                </div>
            </div>

            <Link to="/addLaundry" className="w-11/12 max-w-md mt-4">
                <Button type="button" className="w-full">
                    Ajouter une laverie
                </Button>
            </Link>

            <div className="w-full max-w-md mt-6 overflow-y-auto max-h-[500px]">
                {laundries.length === 0 ? (
                    <p className="text-center text-gray-500 mt-6">
                        Vous n'avez pas encore de laverie.
                    </p>
                ) : (
                    laundries.map((laundry) => (
                        <LaundryCard key={laundry.id} laundry={laundry} />
                    ))
                )}
            </div>
        </div>
    )
}

export default ProDashboard