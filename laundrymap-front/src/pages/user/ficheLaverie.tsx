import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CardMachine from "@/components/ui/cardMachine";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";


// TYPES - à vérifier doublons dans un fichier types.ts / laundry.ts

interface Machine {
  type: string;
  capacity: number;
  duration: number;
  price: number;
}

interface Horaire {
  day: string;
  openAm: string;
  closeAm: string;
  openPm: string;
  closePm: string;
}

interface Review {
  id: number;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface Laverie {
  id: number;
  name: string;
  logo: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  isFavorite: boolean;
  address: string;
  city: string;
  postalCode: string;
  email: string;
  lat: number;
  lng: number;
  services: string[];
  paymentMethods: string[];
  horaires: Horaire[];
  machines: Machine[];
  reviews: Review[];
  description: string;
}


// SOUS-COMPOSANTS 

/** Étoiles de notation */
const StarRating = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) => {
  const starSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${starSize} ${
            star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

/** Badge Ouvert / Fermé */
const StatusBadge = ({ isOpen }: { isOpen: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
      isOpen ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
      }`}
    />
    {isOpen ? "Ouvert" : "Fermé"}
  </span>
);

/** Carte avis */
const ReviewCard = ({ review }: { review: Review }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 shadow-sm">
    <div className="flex items-center gap-3">
      <img
        src={review.avatar}
        alt={review.author}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm">{review.author}</p>
        <p className="text-xs text-slate-400">{review.date}</p>
      </div>
      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
        <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-xs font-bold text-amber-600">{review.rating}</span>
      </div>
    </div>
    <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
  </div>
);




// COMPOSANT PRINCIPAL

function FicheLaverie() {

  const { id } = useParams<{ id: string }>();

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/fiche-laverie/${id}`;
  const favoriUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/fiche-laverie/${id}/favori`;


  const [laverie, setLaverie] = useState<Laverie | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isFavLoading, setIsFavLoading] = useState<boolean>(false);

  
  const token = localStorage.getItem("token");
  const isConnected = token !== null;


  // Carousel
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);



  // ── Fetch de la laverie ──
  useEffect(() => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    setError(null);
 
    const headers: HeadersInit = { "Content-Type": "application/json" };

    if (token) headers["Authorization"] = `Bearer ${token}`;
 
    fetch(url, { method: "GET", headers })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Erreur ${response.status} : ${response.statusText}`);
        }
        const data: Laverie = await response.json();
        setLaverie(data);
        setIsFavorite(data.isFavorite);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, url]);


   // ── Toggle favori ──
  const handleToggleFavori = () => {
    
    const currentToken = localStorage.getItem("token");
 
    if (!currentToken) {
      console.warn("[Favori] Aucun token dans localStorage.");
      return;
    }
    if (isFavLoading) {
      console.warn("[Favori] Requête déjà en cours.");
      return;
    }
 
    setIsFavLoading(true);

    fetch(favoriUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      })
      .catch((err) => {
        console.error("[Favori] Erreur :", err);
      })
      .finally(() => {
        setIsFavLoading(false);
      });
  };



  // ── URLs de navigation ──
  const mapsUrl = laverie ? `https://www.google.com/maps/search/?api=1&query=${laverie.lat},${laverie.lng}` : "#";
  const wazeUrl = laverie ? `https://waze.com/ul?ll=${laverie.lat},${laverie.lng}&navigate=yes` : "#";



  // ÉTATS DE CHARGEMENT / ERREUR

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <div className="w-10 h-10 border-4 border-gray/30 border-t-gray-500 rounded-full animate-spin" />
          <p className="text-sm font-medium opacity-70">Chargement de la laverie…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-xl">
          <p className="text-4xl mb-3">⚠️</p>
          <h2 className="text-slate-800 font-bold text-lg mb-2">Une erreur est survenue</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!laverie) {
    return null;
  }

  

  return (

    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100">
      <div className="w-full max-w-5xl mx-auto space-y-6">

        {/* ── HERO INFO ── */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-5 w-full">
          <div className="flex items-start gap-4">
            <img
              src={laverie.logo}
              alt="Logo laverie"
              className="w-16 h-16 rounded-lg object-cover shadow-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {laverie.name}
                </h1>
                {isConnected && (
                <button
                  onClick={handleToggleFavori}
                  aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  className="flex-shrink-0 p-2 rounded-full bg-slate-50 hover:bg-rose-50 transition-colors mt-0.5"
                > 
                  <svg
                    className={`w-5 h-5 transition-colors ${
                      isFavorite ? "text-rose-500 fill-rose-500" : "text-slate-400"
                    }`}
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <StatusBadge isOpen={laverie.isOpen} />
                <div className="flex items-center gap-1.5">
                  <StarRating rating={laverie.rating} />
                  <span className="text-sm font-bold text-slate-700">{laverie.rating}</span>
                  <span className="text-xs text-slate-400">({laverie.reviewCount} avis)</span>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-slate-500 text-sm leading-relaxed lg:ml-20">
            {laverie.description}
          </p>
        </div>

        {/* ── CAROUSEL IMAGES ── */}
        <div className="w-full">
          <Carousel setApi={setApi}>
            <CarouselContent>
              {laverie.images.map((image, index) => (
                <CarouselItem key={index}>
                  <Card className="m-px">
                    <CardContent className="flex justify-center p-0">
                      <img
                        src={image}
                        alt={`Photo ${index + 1} de ${laverie.name}`}
                        className="w-full rounded-lg object-cover max-h-80"
                      />
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <div className="py-2 text-center text-sm text-gray/60">
            {current} / {count}
          </div>
        </div>

        {/* ── ADRESSE & NAVIGATION ── */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-4 w-full space-y-4">
          <h3 className="text-slate-900 text-lg font-semibold">📍 Adresse & Itinéraire</h3>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800">{laverie.address}</p>
              <p className="text-slate-500 text-sm">{laverie.postalCode} {laverie.city}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-lg font-semibold text-sm active:scale-95 transition-transform shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Google Maps
            </a>
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-sky-400 text-white py-3 px-4 rounded-lg font-semibold text-sm active:scale-95 transition-transform shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm0 20c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm-1-14v2H9v2h2v6h2V9h2V7h-2V5h-2z" />
              </svg>
              Waze
            </a>
          </div>
        </div>

        {/* ── SERVICES & HORAIRES ── */}
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">

          {/* Services */}
          <div className="border border-slate-100 shadow-sm rounded-md p-6 bg-white">
            <h3 className="text-slate-900 text-2xl font-semibold mb-3 text-center">Services</h3>

            <div className="mt-4">
              <h4 className="text-slate-900 text-lg font-semibold mb-3">Équipements disponibles</h4>
              <div className="grid grid-cols-2 gap-3">
                {laverie.services.map((service) => (
                  <div key={service} className="flex items-center text-[15px] text-slate-600 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" className="mr-3 fill-green-500 flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z" />
                    </svg>
                    {service}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-slate-900 text-lg font-semibold mb-3">Moyens de paiement</h4>
              <div className="grid grid-cols-2 gap-3">
                {laverie.paymentMethods.map((method) => (
                  <div key={method} className="flex items-center text-[15px] text-slate-600 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" className="mr-3 fill-green-500 flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z" />
                    </svg>
                    {method}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-slate-900 text-lg font-semibold mb-3">Informations</h4>
              {laverie.email && (
              <div className="flex items-center text-[15px] text-slate-600 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" className="mr-3 fill-green-500 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z" />
                </svg>
                Email : <a href={`mailto:${laverie.email}`} className="ml-1 text-blue-600 hover:underline">{laverie.email}</a>
              </div>
              )}
            </div>
          </div>

          {/* Horaires */}
          <div className="border border-slate-100 shadow-sm rounded-md p-6 bg-white">
            <h3 className="text-slate-900 text-2xl font-semibold mb-3 text-center">Horaires</h3>

            <div className="mt-4 space-y-3">
              {laverie.horaires.map((horaire) => (
                <div
                  key={horaire.day}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-2 last:border-0"
                >
                  <h4 className="text-slate-900 text-sm font-bold w-24">{horaire.day}</h4>
                  <div className="flex gap-4 text-sm text-slate-600 font-medium">
                    <span>{horaire.openAm} – {horaire.closeAm}</span>
                    <span className="text-slate-300">|</span>
                    <span>{horaire.openPm} – {horaire.closePm}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* ── LISTE MACHINES ── */}
        <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-6 mt-12 max-sm:max-w-sm mx-auto">

          <div className="border border-gray-100 shadow-sm rounded-md bg-white p-6">
            <h3 className="text-slate-900 text-2xl font-semibold mb-4 text-center">Liste des machines</h3>

            {/* Liste Machines pour une laverie  */}
            <div className="mx-10">
              <div className="mt-4">
                {laverie.machines.map((machine, index) => (
                  <CardMachine
                    key={index}
                    name={machine.type}
                    capacity={machine.capacity}
                    duration={machine.duration}
                    price={machine.price}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Machines Wiline */}
          <div className="border border-gray-100 shadow-sm rounded-md p-6 bg-white">
            <h3 className="text-slate-900 text-2xl font-semibold mb-3 text-center">Machines Wiline</h3>

          </div>
        </div>


        {/* ── COMMENTAIRES ── */}
        <div className="border border-gray-100 shadow-sm rounded-md p-6 bg-white">
          <h3 className="text-slate-900 text-2xl font-semibold mb-4 text-center">
            Commentaires
          </h3>
          {laverie.reviews.length > 0 ? (
            <div className="space-y-3">
              {laverie.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 text-sm py-6">
              Aucun commentaire pour le moment.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default FicheLaverie;
