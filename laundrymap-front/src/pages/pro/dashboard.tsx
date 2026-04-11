import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from 'react-router';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Valeurs de LaverieStatutEnum::value
interface Laundry {
  id: number;
  nom: string;
  statut: 'VALIDE' | 'REFUSE' | 'EN_ATTENTE';
  logoUrl: string | null;
  rating: number | null;
  avis: number;
}


const statutConfig: Record<
  Laundry['statut'],
  { variant: 'default' | 'destructive' | 'secondary'; label: string }
> = {
  'VALIDE':     { variant: 'default',     label: 'Validée'    },
  'REFUSE':     { variant: 'destructive', label: 'Refusée'    },
  'EN_ATTENTE': { variant: 'secondary',   label: 'En attente' },
}; 

function ProDashboard() {
  const [laundries, setLaundries] = useState<Laundry[]>([]);
  const [total, setTotal]        = useState<number>(0);

  const [loading, setLoading]     = useState<boolean>(true);
  const [error, setError]        = useState<string | null>(null);
  const navigate = useNavigate();

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
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Chargement...</p>;
  if (error)   return <p className="text-center mt-10 text-red-500">{error}</p>;
 
  return (
    <>
      <div className="flex flex-col items-center p-4 min-h-screen">

        <h1 className="font-bold text-2xl mt-6">Tableau de bord</h1>
        <p className="text-gray-500 text-center mt-2">Bienvenue dans votre espace professionnel</p>

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

        <div className="p-4 my-5 w-full">
          <div className="max-w-6xl max-lg:max-w-3xl max-sm:max-w-sm mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

              {laundries.map((laundry) => {
                
                const config = statutConfig[laundry.statut] ?? statutConfig['EN_ATTENTE'];

                return (
                  <Card className="relative mx-auto w-full max-w-sm pt-0" key={laundry.id}>

                    <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
                    <img
                      src={laundry.logoUrl ?? '/placeholder.png'}
                      alt={laundry.nom}
                      className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
                    />

                    <CardHeader>
                      <CardAction>
                        
                        <Badge variant={config.variant} className="mt-2">
                          {config.label}
                        </Badge>
                      </CardAction>

                      <CardTitle>{laundry.nom}</CardTitle>

                      <CardDescription>

                        {laundry.rating !== null ? (
                          <>
                            <span className="text-yellow-500">★ {laundry.rating}</span>
                            <span className="text-gray-500 ml-2">{laundry.avis} avis</span>
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Aucun avis</span>
                        )}
                      </CardDescription>
                    </CardHeader>

                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => navigate(`/pro/laverie/${laundry.id}`)}
                      >
                        Voir la laverie
                      </Button>
                    </CardFooter>

                  </Card>
                );
              })}

            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default ProDashboard