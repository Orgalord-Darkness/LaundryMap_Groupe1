<?php

namespace App\Controller;

use App\Repository\LaverieRepository;
use App\Repository\LaverieMediaRepository;
use App\Repository\LaverieFermetureRepository;
use App\Repository\LaverieEquipementRepository;
use App\Repository\LaverieNoteRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;


#[Route('/api/v1')]
class FicheLaverieController extends AbstractController
{
    public function __construct(
        private readonly LaverieRepository           $laverieRepository,
        private readonly LaverieMediaRepository      $laverieMediaRepository,
        private readonly LaverieFermetureRepository  $laverieFermetureRepository,
        private readonly LaverieEquipementRepository $laverieEquipementRepository,
        private readonly LaverieNoteRepository       $laverieNoteRepository,
        private readonly EntityManagerInterface      $entityManager,
    ) {}


    
    // GET /api/v1/fiche-laverie/{id}  (accès public)
    
    #[Route('/fiche-laverie/{id}', name: 'api_fiche_laverie', methods: ['GET'])]
    public function ficheLaverie(int $id, Request $request): JsonResponse
    {
        // Récupération de la laverie ──────────────────────────────────
        $laverie = $this->laverieRepository->find($id);

        if (!$laverie || $laverie->getSupprimeLe() !== null) {
            return $this->json(['message' => 'Laverie introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        $baseUrl = $request->getSchemeAndHttpHost();


        //  Logo ────────────────────────────────────────────────────────
        $logoUrl = null;
        if ($laverie->getLogo() !== null) {
            $logoUrl = $baseUrl . '/' . ltrim($laverie->getLogo()->getEmplacement(), '/');
        }


        //  Images du carousel (LaverieMedia → Media) ───────────────────
        $laverieMedias = $this->laverieMediaRepository->findBy(['laverie' => $laverie]);
        $images = array_values(array_map(
            fn($lm) => $baseUrl . '/' . ltrim($lm->getMedia()->getEmplacement(), '/'),
            $laverieMedias
        ));


        //  Adresse ─────────────────────────────────────────────────────
        $adresse = $laverie->getAdresse();


        //  Services ────────────────────────────────────────────────────
        $services = $laverie->getServices()
            ->map(fn($service) => $service->getNom())
            ->toArray();


        //  Méthodes de paiement ────────────────────────────────────────
        $paymentMethods = $laverie->getMethodePaiements()
            ->map(fn($methode) => $methode->getNom())
            ->toArray();


        //  Horaires (LaverieFermeture) ─────────────────────────────────
        //   Deux entrées possibles par jour (matin / après-midi)
        //   On groupe par jour puis on trie par heure_debut pour identifier AM/PM
        $fermetures = $this->laverieFermetureRepository->findBy(
            ['laverie' => $laverie],
            ['jour' => 'ASC']
        );

        $slotsParJour = [];
        foreach ($fermetures as $fermeture) {
            $jourLabel = $fermeture->getJour()->value; // ex: 'lundi', 'mardi'...

            $slotsParJour[$jourLabel][] = [
                'debut' => $fermeture->getHeureDebut()->format('H:i'),
                'fin'   => $fermeture->getHeureFin()->format('H:i'),
            ];
        }

        // Tri croissant par heure au sein de chaque jour → slot[0] = matin, slot[1] = après-midi
        $horaires = [];
        foreach ($slotsParJour as $jour => $slots) {
            usort($slots, fn($a, $b) => $a['debut'] <=> $b['debut']);

            $horaires[] = [
                'day'     => ucfirst($jour), // 'lundi' → 'Lundi' pour l'affichage
                'openAm'  => $slots[0]['debut'] ?? null,
                'closeAm' => $slots[0]['fin']   ?? null,
                'openPm'  => $slots[1]['debut'] ?? null,
                'closePm' => $slots[1]['fin']   ?? null,
            ];
        }

        // Statut ouvert / fermé (calculé dynamiquement) ──────────────
        $isOpen = $this->calculateIsOpen($fermetures);


        //  Machines (LaverieEquipement) ───────────────────────────────
        //   EquipementEnum : 'machine_a_laver' | 'seche_linge' | 'autre'
        $equipementLabels = [
            'machine_a_laver' => 'Machine à laver',
            'seche_linge'     => 'Sèche-linge',
            'autre'           => 'Autre',
        ]; 

        $equipements = $this->laverieEquipementRepository->findBy(['laverie' => $laverie]);
        $machines = array_values(array_map(
            fn($equipement) => [
                'type'     => $equipementLabels[$equipement->getType()->value] ?? $equipement->getType()->value,
                'capacity' => $equipement->getCapacite(),
                'duration' => $equipement->getDuree(),
                'price'    => $equipement->getTarif(),
            ],
            $equipements
        ));


        // Notes & commentaires (LaverieNote) ─────────────────────────
        //   Toutes les notes non supprimées pour calculer la moyenne
        $notes = $this->laverieNoteRepository->findBy(
            ['laverie' => $laverie],
            ['note_le' => 'DESC']
        );

        $totalNotes  = count($notes);
        $moyenneNote = 0.0;
        if ($totalNotes > 0) {
            $somme       = array_sum(array_map(fn($n) => $n->getNote(), $notes));
            $moyenneNote = round($somme / $totalNotes, 1);
        }

        //  affiche que les notes qui ont un commentaire non supprimé
        $reviews = [];
        foreach ($notes as $note) {
            if ($note->getCommentaire() === null || $note->getCommentaireSupprimeMotif() !== null) {
                continue;
            }

            $utilisateur = $note->getUtilisateur();
            $initiales   = urlencode($utilisateur->getPrenom() . '+' . $utilisateur->getNom());
            $avatarUrl   = "https://ui-avatars.com/api/?name={$initiales}&background=e2e8f0&color=475569&size=64";

            $reviews[] = [
                'id'      => $note->getId(),
                'author'  => $utilisateur->getPrenom() . ' ' . $utilisateur->getNom(),
                'avatar'  => $avatarUrl,
                'rating'  => $note->getNote(),
                'date'    => ($note->getCommentaireLe() ?? $note->getNoteLe())->format('d/m/Y'),
                'comment' => $note->getCommentaire(),
            ];
        }

        //  Favori pour l'utilisateur connecté (null si visiteur non connecté) ──
        $currentUser = $this->getUser();
        $isFavorite  = $currentUser !== null && $laverie->getFavoris()->contains($currentUser);

        //  Réponse JSON ───────────────────────────────────────────────
        return $this->json([
            'id'             => $laverie->getId(),
            'name'           => $laverie->getNomEtablissement(),
            'logo'           => $logoUrl,
            'images'         => $images,
            'rating'         => $moyenneNote,
            'reviewCount'    => $totalNotes,
            'isOpen'         => $isOpen,
            'isFavorite'     => $isFavorite,
            'description'    => $laverie->getDescription(),
            'email'          => $laverie->getContactEmail(),
            'address'        => $adresse?->getAdresse(),
            'city'           => $adresse?->getVille(),
            'postalCode'     => (string) ($adresse?->getCodePostal() ?? ''),
            'lat'            => $adresse?->getLatitude(),
            'lng'            => $adresse?->getLongitude(),
            'services'       => $services,
            'paymentMethods' => $paymentMethods,
            'horaires'       => $horaires,
            'machines'       => $machines,
            'reviews'        => $reviews,
        ]);
    }


    
    // POST /api/v1/user/fiche-laverie/{id}/favori  (connecté uniquement)
    // Toggle : ajoute ou retire la laverie des favoris de l'utilisateur

    #[Route('/user/fiche-laverie/{id}/favori', name: 'api_user_fiche_laverie_favori', methods: ['POST'])]
    public function toggleFavori(int $id): JsonResponse
    {
        $laverie = $this->laverieRepository->find($id);
 
        if (!$laverie || $laverie->getSupprimeLe() !== null) {
            return $this->json(['message' => 'Laverie introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }
 
        /** @var \App\Entity\Utilisateur $currentUser */
        $currentUser = $this->getUser();
 
        if ($laverie->getFavoris()->contains($currentUser)) {
            
            $laverie->removeFavori($currentUser);
            $isFavorite = false;
        } else {
            
            $laverie->addFavori($currentUser);
            $isFavorite = true;
        }
 
        $this->entityManager->flush();
 
        return $this->json([
            'isFavorite' => $isFavorite,
            'message'    => $isFavorite ? 'Laverie ajoutée aux favoris.' : 'Laverie retirée des favoris.',
        ]);
    }




    // Calcul dynamique ouvert / fermé
    private function calculateIsOpen(array $fermetures): bool
    {
        $maintenant    = new \DateTime('now');
        $heureActuelle = $maintenant->format('H:i');

       
        $jourActuel = match ($maintenant->format('N')) {
            '1' => 'lundi',
            '2' => 'mardi',
            '3' => 'mercredi',
            '4' => 'jeudi',
            '5' => 'vendredi',
            '6' => 'samedi',
            '7' => 'dimanche',
            default => '',
        };

        foreach ($fermetures as $fermeture) {
            if ($fermeture->getJour()->value !== $jourActuel) {
                continue;
            }

            $debut = $fermeture->getHeureDebut()->format('H:i');
            $fin   = $fermeture->getHeureFin()->format('H:i');

            if ($heureActuelle >= $debut && $heureActuelle <= $fin) {
                return true;
            }
        }

        return false;
    }
}