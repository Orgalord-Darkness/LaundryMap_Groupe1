import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router';
import { useNavigate, Link } from 'react-router';
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Composant pour une carte de laverie // Test laveries a revoir !!!!!!!!!!!!!
function LaundryCard({ id, name, rating, reviews, imageUrl, status }: {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  status: 'validée' | 'refusée';
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center">
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 object-cover rounded mr-4"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <div className="flex items-center mt-1">
            <span className="text-yellow-500">★ {rating}</span>
            <span className="text-gray-500 ml-2">({reviews} avis)</span>
          </div>
          <div className="mt-2">
            {status === 'validée' ? (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Validée
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                Refusée
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link to={`/pro/laverie/17`}>Modifier</Link>
        </Button>
      </div>
    </div>
  );
}

function ProDashboard() {
  // Données simulées pour les laveries // Test laveries a revoir !!!!!!!!!!!!!
  const [laundries] = useState<Array<{
    id: number;
    name: string;
    rating: number;
    reviews: number;
    imageUrl: string;
    status: 'validée' | 'refusée';
  }>>([
    {
      id: 1,
      name: "Le Petit Guide",
      rating: 4.5,
      reviews: 12,
      imageUrl: "https://laverie.mobi/public_medias/image_file/file/0193500f-d148-7b3f-a980-1df9ebf0f33d/large_400f90fa.jpeg",
      status: 'validée',
    },
    {
      id: 2,
      name: "Laverie Express",
      rating: 3.8,
      reviews: 8,
      imageUrl: "https://laverie.mobi/public_medias/image_file/file/0193500f-d148-7b3f-a980-1df9ebf0f33d/large_400f90fa.jpeg",
      status: 'refusée',
    },
    // Test laveries a revoir !!!!!!!!!!!!!
  ]);

  const stats = {
    laundries: 72,
  };



// Interface alignée sur ce que l'API Symfony retournera
interface Laundry {
  id: number;
  nom: string;
  statut: 'validée' | 'refusée' | 'en_attente';
  logoUrl: string | null;
  rating: number | null;   // null si pas encore implémenté
  avis: number;            // nombre d'avis
}

function ProDashboard() {

  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();


  // fetch dans useEffect
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/professionnel/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Erreur serveur');
        return response.json();
      })
      .then((data) => {
        setLaundries(data.laveries);
        setTotal(data.total);
      })
      .catch(() => setError('Impossible de charger vos laveries.'))
      .finally(() => setLoading(false));
  }, []); // ← tableau vide = exécuté une seule fois au montage


  // guards avant le return principal
  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement...</p>;
  if (error)   return <p className="text-center mt-10 text-red-500">{error}</p>;


  return (
    <>

    <div className="flex flex-col items-center p-4 min-h-screen">
      <h1 className="font-bold text-2xl mt-6">Tableau de bord</h1>
      <p className="text-gray-500 text-center mt-2"> Bienvenue dans votre espace professionnel </p>

      <div className="w-[150px] h-[40px] my-12">
        <div className="bg-[#0077B6] text-white p-4 rounded-lg shadow-md text-center block">
          <p className="text-lg font-semibold">{total}</p>
          <p className="text-sm">Laveries</p>
        </div>
      </div>

      <Link to="/addLaundry" className="w-11/12 max-w-md mt-4">
        <Button type="button" className="w-full">
          Ajouter une laverie
        </Button>
      </Link>

      {/* Liste défilante des laveries // Test laveries a revoir !!!!!!!!!!!!! */}
      <div className="w-full max-w-md mt-6 overflow-y-auto max-h-[500px]">
        {laundries.map((laundry) => (
          <LaundryCard
            key={laundry.id}
            id={laundry.id}
            name={laundry.name}
            rating={laundry.rating}
            reviews={laundry.reviews}
            imageUrl={laundry.imageUrl}
            status={laundry.status}
          />
        ))}
      </div>


    </div>
    

  </>
  );
}

export default ProDashboard;
