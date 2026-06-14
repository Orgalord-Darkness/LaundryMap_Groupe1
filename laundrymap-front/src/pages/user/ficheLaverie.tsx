import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/components/context/AuthContext";
import axios from "axios";
import CardMachine from "@/components/ui/cardMachine";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/utils/StatusBadge";
import type { HoraireSlot } from "@/components/utils/type";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import SignalementForm from "@/components/layout/SignalementForm";
import { LaverieActions } from "@/components/ui/optionsButton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";


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
  rue: string;
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


/** Carte avis */
const ReviewCard = ({
  review,
  isConnected,
  onSignal,
}: {
  review: Review;
  isConnected: boolean;
  onSignal: (id: number) => void;
}) => (
  <div className="bg-card rounded-2xl border border-slate-100 p-4 flex flex-col gap-3 shadow-sm">
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
      {isConnected && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">⋮</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSignal(review.id)}>
              Signaler ce commentaire
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
    <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
  </div>
);



// ------- Pour Note & Avis ---


/** Sélecteur d'étoiles interactif pour le formulaire d'avis */
const StarPicker = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          <svg
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || value) ? "text-amber-400" : "text-slate-200"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-amber-500">
          {["", "Mauvais", "Passable", "Bien", "Très bien", "Excellent"][value]}
        </span>
      )}
    </div>
  );
};

/** Modal d'ajout / modification d'un avis */
const ModalAvis = ({
  onClose,
  onSubmit,
  isSubmitting,
  existingRating = 0,
  existingComment = "",
  apiError = null,
}: {
  onClose: () => void;
  onSubmit: (note: number, commentaire: string) => void;
  isSubmitting: boolean;
  existingRating?: number;
  existingComment?: string;
  apiError?: string | null;
}) => {
  const [note, setNote]           = useState(existingRating);
  const [commentaire, setCommentaire] = useState(existingComment);
  const [formError, setFormError] = useState<string | null>(null);
  const displayError = apiError ?? formError;
 
  const handleSubmit = () => {
    if (note === 0) {
      setFormError("Veuillez sélectionner une note.");
      return;
    }
    if (commentaire.trim().length < 10) {
      setFormError("Le commentaire doit faire au moins 10 caractères.");
      return;
    }
    setFormError(null);
    onSubmit(note, commentaire.trim());
  };
 
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
 
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
 
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {existingRating > 0 ? "Modifier mon avis" : "Laisser un avis"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
 
        {/* Sélecteur d'étoiles */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Votre note *</label>
          <StarPicker value={note} onChange={setNote} />
        </div>
 
        {/* Commentaire */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Votre commentaire *</label>
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Partagez votre expérience avec cette laverie…"
            rows={4}
            maxLength={255}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-between items-center">
            {displayError
              ? <p className="text-xs text-rose-500">{displayError}</p>
              : <span />
            }
            <p className="text-xs text-slate-400 ml-auto">{commentaire.length}/255</p>
          </div>
        </div>
 
        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-primary hover:bg-blue-900 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Envoi…" : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
};

// -- Fin ajout - note & avis ----




const JOURS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

// COMPOSANT PRINCIPAL

function FicheLaverie() {

  const { id } = useParams<{ id: string }>();

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/v1/fiche-laverie/${id}`;
  const favoriUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/fiche-laverie/${id}/favori`;
  const commentaireUrl = `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/fiche-laverie/${id}/commentaire`;

  const [laverie, setLaverie] = useState<Laverie | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isFavLoading, setIsFavLoading] = useState<boolean>(false);

  const [showModal,      setShowModal]      = useState<boolean>(false);
  const [isSubmitting,   setIsSubmitting]   = useState<boolean>(false);
  const [submitSuccess,  setSubmitSuccess]  = useState<boolean>(false);
  const [submitError,    setSubmitError]    = useState<string | null>(null);

  const [userReview,     setUserReview]     = useState<{ note: number; commentaire: string } | null>(null);
  const [signalementReviewId, setSignalementReviewId] = useState<number | null>(null);

  
  const { user } = useAuth();
  const isConnected = user !== null;


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
 
    fetch(url, { method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Erreur ${response.status} : ${response.statusText}`);
        }
        const data: Laverie = await response.json();
        const apiBase = import.meta.env.VITE_API_BASE_URL
        setLaverie({
          ...data,
          logo:   data.logo   ? `${apiBase}${data.logo}`                : data.logo,
          images: data.images ? data.images.map(img => `${apiBase}${img}`) : [],
        });
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
    if (isFavLoading) return;
    setIsFavLoading(true);

    axios.post(favoriUrl, {}, { withCredentials: true })
      .then((response) => {
        setIsFavorite(response.data.isFavorite);
      })
      .catch((err) => {
        console.error("[Favori] Erreur :", err);
      })
      .finally(() => {
        setIsFavLoading(false);
      });
  };



  // Pour ajout note & Commentaire

  // Soumission d'un avis 
  const handleSubmitAvis = (note: number, commentaire: string) => {
    setIsSubmitting(true);
    fetch(commentaireUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ note, commentaire }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setSubmitError(data.message ?? `Erreur ${response.status}`);
          return;
        }
        setSubmitError(null);
        const data = await response.json();
 
        // Ajout du nouvel avis en tête de liste sans recharger la page
        setLaverie((prev) => {
          if (!prev) return prev;
          const newReview: Review = {
            id:      data.id,
            author:  data.author,
            avatar:  data.avatar,
            rating:  note,
            date:    new Date().toLocaleDateString("fr-FR"),
            comment: commentaire,
          };
          // Mise à jour : retirer l'ancien avis de cet utilisateur s'il existait
          const filteredReviews = userReview
            ? prev.reviews.filter((r) => r.author !== data.author)
            : prev.reviews;
 
          return {
            ...prev,
            reviews:     [newReview, ...filteredReviews],
            reviewCount: prev.reviewCount + (userReview ? 0 : 1),
          };
        });
 
        setUserReview({ note, commentaire });
        setSubmitSuccess(true);
        setShowModal(false);
        // Réinitialiser le message de succès après 3s
        setTimeout(() => setSubmitSuccess(false), 3000);
      })
      .catch(() => setSubmitError("Une erreur réseau est survenue."))
      .finally(() => setIsSubmitting(false));
  };

  // fin








  // URL de navigation
  const wazeUrl = laverie ? `https://waze.com/ul?ll=${laverie.lat},${laverie.lng}&navigate=yes` : "#";
  const itineraireUrl = laverie ? `https://www.google.com/maps/dir/?api=1&destination=${laverie.lat},${laverie.lng}` : "";


  // ÉTATS DE CHARGEMENT / ERREUR

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-10 h-10 border-4 border-gray/30 border-t-gray-500 rounded-full animate-spin" />
          <p className="text-sm font-medium opacity-70">Chargement de la laverie…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <div className="bg-card rounded-2xl p-8 max-w-sm mx-4 text-center shadow-xl">
          {/* <p className="text-4xl mb-3">⚠️</p> */}
          <h2 className="text-slate-800 font-bold text-lg mb-2">Une erreur est survenue</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!laverie) {
    return null;
  }

  // Convertir les horaires de la fiche au format HoraireSlot[] pour le badge de statut
  const fermeturesFiche: HoraireSlot[] = laverie.horaires.flatMap((h) => {
    const jour = h.day.toLowerCase()
    const slots: HoraireSlot[] = []
    if (h.openAm && h.closeAm) slots.push({ jour, heureDebut: h.openAm, heureFin: h.closeAm })
    if (h.openPm && h.closePm) slots.push({ jour, heureDebut: h.openPm, heureFin: h.closePm })
    return slots
  })

  return (

    <div className="flex flex-col items-center p-4 min-h-screen bg-muted">
      <div className="w-full max-w-5xl mx-auto space-y-6">

        {/* ── HERO INFO ── */}
        <div className="bg-card rounded-lg border border-slate-100 shadow-sm p-5 w-full">
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
                  className="flex-shrink-0 p-2 rounded-full bg-slate-50 hover:bg-rose-50 transition-colors mt-0.5 cursor-pointer"
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
                <StatusBadge fermetures={fermeturesFiche} />
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

        {/* CAROUSEL IMAGES  */}
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
        <div className="bg-card rounded-lg border border-slate-100 shadow-sm p-4 w-full space-y-4">
          <h3 className="text-slate-900 text-lg font-semibold"> Adresse & Itinéraire </h3>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {laverie.rue && !laverie.address.includes(laverie.rue)
                  ? `${laverie.address} ${laverie.rue}`
                  : laverie.address}
              </p>
              <p className="text-slate-500 text-sm">{laverie.postalCode} {laverie.city}</p>
            </div>
          </div>


          <div className="grid grid-cols-2 gap-3">
            <a href={itineraireUrl} target="_blank" rel=""
              className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-lg font-semibold text-sm active:scale-95 transition-transform shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Google Maps
            </a>
            <a href={wazeUrl} target="_blank" rel=""
              className="flex items-center justify-center gap-2 bg-sky-400 text-white py-3 px-4 rounded-lg font-semibold text-sm active:scale-95 transition-transform shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1C5.9 1 1 5.9 1 12s4.9 11 11 11 11-4.9 11-11S18.1 1 12 1zm0 20c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm-1-14v2H9v2h2v6h2V9h2V7h-2V5h-2z" />
              </svg>
              Waze
            </a>
          </div>


        </div>

        {/* SERVICES & HORAIRES  */}
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">

          {/* Services */}
          <div className="border border-slate-100 shadow-sm rounded-md p-6 bg-card">
            <h3 className="text-slate-900 text-2xl font-semibold mb-3 text-center">Services</h3>

            <div className="mt-4">
              <h4 className="text-slate-900 text-md font-semibold mb-3">Équipements disponibles</h4>

              <div className="flex flex-wrap gap-3">
                {laverie.services.map((service) => (
                  <div key={service} className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary border border-primary/20 px-4 py-2 text-sm font-medium">
                    {service}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-slate-900 text-md font-semibold mb-3">Moyens de paiement</h4>
              <div className="flex flex-wrap gap-3">
                {laverie.paymentMethods.map((method) => (
                  <div key={method} className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary border border-primary/20 px-4 py-2 text-sm font-medium">
                    {method}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-slate-900 text-md font-semibold mb-3">Informations</h4>
              {laverie.email && (
              <div className="flex items-center text-[15px] text-slate-600 font-medium">
                Email : <a href={`mailto:${laverie.email}`} className="ml-1 text-blue-600 hover:underline">{laverie.email}</a>
              </div>
              )}
            </div>
          </div>

          {/* Horaires */}
          <div className="border border-slate-100 shadow-sm rounded-md p-6 bg-card">
            <h3 className="text-slate-900 text-2xl font-semibold mb-3 text-center">Horaires</h3>

            <div className="mt-4 space-y-3">
              {[...laverie.horaires]
                .sort((a, b) => JOURS_ORDER.indexOf(a.day) - JOURS_ORDER.indexOf(b.day))
                .map((horaire) => (
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


        {/* LISTE MACHINES */}
        <div className="grid lg:grid-cols-1 sm:grid-cols-1 gap-6 mt-12 mx-auto w-full">

          <div className="border border-border shadow-sm rounded-md bg-card p-6">
            <h3 className="text-slate-900 text-2xl font-semibold mb-4 text-center">Liste des machines</h3>

            {/* Liste Machines pour une laverie  */} 
            <div className="grid lg:grid-cols-3 sm:grid-cols-1 gap-2">
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



        {/* COMMENTAIRES */}
        <div className="border border-border shadow-sm rounded-md p-6 bg-card">
 
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 text-2xl font-semibold">Commentaires</h3>

            {isConnected && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-primary hover:bg-blue-900 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {userReview ? "Modifier mon avis" : "Laisser un avis"}
              </button>
            )}
          </div>
 
          {/* Message de succès */}
          {submitSuccess && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Votre avis a bien été publié, merci !
            </div>
          )}
 
          {/* Liste des avis */}
          {laverie.reviews.length > 0 ? (
            <div className="space-y-3">
              {laverie.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isConnected={isConnected}
                  onSignal={(id) => setSignalementReviewId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm mb-3">Aucun commentaire pour le moment.</p>
              {isConnected && (
                <button onClick={() => setShowModal(true)} className="text-blue-600 text-sm font-medium hover:underline">
                  Soyez le premier à laisser un avis →
                </button>
              )}
            </div>
          )}
        </div> 

      </div>

      {/* MODAL AVIS */}
      {showModal && (
        <ModalAvis
          onClose={() => { setShowModal(false); setSubmitError(null); }}
          onSubmit={handleSubmitAvis}
          isSubmitting={isSubmitting}
          existingRating={userReview?.note ?? 0}
          existingComment={userReview?.commentaire ?? ""}
          apiError={submitError}
        />
      )}

      {/* SIGNALEMENT */}
      {signalementReviewId !== null && (
        <SignalementForm
          reviewId={signalementReviewId}
          open={signalementReviewId !== null}
          onOpenChange={(open) => { if (!open) setSignalementReviewId(null); }}
        />
      )}



    </div>
  );
}

export default FicheLaverie;
