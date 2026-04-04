import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router';

// Composant pour une carte de laverie // Test laveries a revoir !!!!!!!!!!!!!
function LaundryCard({ name, rating, reviews, imageUrl, status }: {
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
    </div>
  );
}

function ProDashboard() {
  // Données simulées pour les laveries // Test laveries a revoir !!!!!!!!!!!!!
  const [laundries] = useState<Array<{
    name: string;
    rating: number;
    reviews: number;
    imageUrl: string;
    status: 'validée' | 'refusée';
  }>>([
    {
      name: "Le Petit Guide",
      rating: 4.5,
      reviews: 12,
      imageUrl: "https://laverie.mobi/public_medias/image_file/file/0193500f-d148-7b3f-a980-1df9ebf0f33d/large_400f90fa.jpeg",
      status: 'validée',
    },
    {
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

  return (
    <>

    <div className="flex flex-col items-center p-4 min-h-screen">
      <h1 className="font-bold text-2xl mt-6">Tableau de bord</h1>
      <p className="text-gray-500 text-center mt-2"> Aperçu globale de toutes vos laveries </p>

      <div className="w-[150px] h-[40px] my-12">
        <div className="bg-[#0077B6] text-white p-4 rounded-lg shadow-md text-center block">
          <p className="text-lg font-semibold">{stats.laundries}</p>
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
        {laundries.map((laundry, index) => (
          <LaundryCard
            key={index}
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



// JE sais commentaire a retirer


// import { useState } from 'react';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
// import { Link } from 'react-router';


// function ProDashboard() {

//   const stats = {
//     laundries: 72,
//   };


//   return (
//     <>

//     <div className="flex flex-col items-center justify-content p-4">

//         <h1 className="font-bold text-2xl mt-6">Tableau de bord</h1>
//         <p className="text-gray-500 text-center mt-2">Bienvenue dans votre espace professionnel</p>

//         <div className="w-[150px] h-[40px] my-8">
//             <div  className="bg-[#0077B6] text-white p-4 rounded-lg shadow-md text-center cursor-pointer hover:bg-blue-600 transition-colors block">
//                 <p className="text-lg font-semibold">{stats.laundries}</p>
//                 <p className="text-sm">Laveries</p>
//             </div>
//         </div>

//         <Link to="/AddLaundry" className="w-11/12 max-w-md mt-8">
//             <Button type="button" className="w-full">Ajouter une laverie</Button>
//         </Link>

//     </div>

//     </>
//   )
// }

// export default ProDashboard;