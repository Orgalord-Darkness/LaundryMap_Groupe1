<?php

namespace App\Controller;

use App\Repository\LaverieRepository;
use App\Repository\LaverieMediaRepository;
use App\Repository\LaverieFermetureRepository;
use App\Repository\LaverieFermetureExceptionnelleRepository;
use App\Repository\LaverieEquipementRepository;
use App\Repository\LaverieNoteRepository;
use App\Repository\LaverieNoteSignalementRepository;
use App\Repository\MotInjurieuxRepository;
use App\Entity\Laverie;
use App\Entity\Utilisateur;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\LaverieNote;
use App\Enum\StatutEnum;
use App\Service\SendEmailService;
use App\Service\WiLineService;
use Symfony\Component\DependencyInjection\Attribute\Autowire;


#[Route('/api/v1')]
class FicheLaverieController extends AbstractController
{
    public function __construct(
        private readonly LaverieRepository                          $laverieRepository,
        private readonly LaverieMediaRepository                     $laverieMediaRepository,
        private readonly LaverieFermetureRepository                 $laverieFermetureRepository,
        private readonly LaverieFermetureExceptionnelleRepository   $laverieFermetureExceptionnelleRepository,
        private readonly LaverieEquipementRepository                $laverieEquipementRepository,
        private readonly LaverieNoteRepository                      $laverieNoteRepository,
        private readonly LaverieNoteSignalementRepository           $laverieNoteSignalementRepository,
        private readonly MotInjurieuxRepository                     $motInjurieuxRepository,
        private readonly EntityManagerInterface                     $entityManager,
        private readonly SendEmailService                           $sendEmailService,
        #[Autowire(env: 'int:SIGNALEMENT_SEUIL_MASQUAGE')]
        private readonly int                                        $seuilMasquage,
    ) {}


    
    // GET /api/v1/fiche-laverie/{id}  (accès public)
    
    #[Route('/fiche-laverie/{id}', name: 'api_fiche_laverie', methods: ['GET'])]
    public function ficheLaverie(int $id): JsonResponse
    {
        // Récupération de la laverie
        $laverie = $this->laverieRepository->find($id);

        if (!$laverie || $laverie->getSupprimeLe() !== null) {
            return $this->json(['message' => 'Laverie introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        //  Logo — chemin relatif /fichiers/logo/... directement utilisable par le frontend
        $logoUrl = $laverie->getLogo()?->getEmplacement();

        //  Images du carousel (LaverieMedia → Media)
        $laverieMedias = $this->laverieMediaRepository->findBy(['laverie' => $laverie]);
        $images = array_values(array_filter(array_map(
            fn($lm) => $lm->getMedia()?->getEmplacement(),
            $laverieMedias
        )));


        $adresse = $laverie->getAdresse();

        $services = $laverie->getServices()
            ->map(fn($service) => $service->getNom())
            ->toArray();


        $paymentMethods = $laverie->getMethodePaiements()
            ->map(fn($methode) => $methode->getNom())
            ->toArray();


        //  Horaires (LaverieFermeture) 
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

        // Statut ouvert / fermé (calculé dynamiquement)
        $isOpen = $this->calculateIsOpen($fermetures, $laverie);


        //  Machines (LaverieEquipement) 
        //   EquipementEnum : 'machine_a_laver' | 'seche_linge' | 'autre'
        $equipementLabels = [
            'machine_a_laver' => 'Machine à laver',
            'seche_linge'     => 'Sèche-linge',
            'autre'           => 'Autre',
        ]; 

        $equipements = $this->laverieEquipementRepository->findBy(['laverie' => $laverie]);
        $machines = array_values(array_map(
            fn($equipement) => [
                'id'       => $equipement->getId(),
                'type'     => $equipementLabels[$equipement->getType()->value] ?? $equipement->getType()->value,
                'capacity' => $equipement->getCapacite(),
                'duration' => $equipement->getDuree(),
                'price'    => $equipement->getTarif(),
            ],
            $equipements
        ));


        // Notes & commentaires (LaverieNote) 
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

        $currentUser = $this->getUser();

        $noteIds = array_map(fn($n) => $n->getId(), $notes);
        $signalementCounts = $this->laverieNoteSignalementRepository->countByNoteIds($noteIds);

        $reviews = [];
        foreach ($notes as $note) {
            $nbSignalements = $signalementCounts[$note->getId()] ?? 0;
            if ($note->getCommentaire() === null
                || $note->getCommentaireSupprimeLe() !== null
                || $nbSignalements >= $this->seuilMasquage) {
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
                // ── Réponse du professionnel ──
                'reponse'   => $note->getReponse(),
                'repond_le' => $note->getRepondLe()?->format('d/m/Y'),
            ];
        }

        //  Favori si utilisateur connecté
        $isFavorite = $currentUser !== null && $laverie->getFavoris()->contains($currentUser);

        // ── isProfessional : l'utilisateur connecté est-il le propriétaire de cette laverie ? ──
        $isProfessional = false;
        if ($currentUser !== null) {
            $professionnel = $laverie->getProfessionnel();
            if ($professionnel !== null && $professionnel->getUtilisateurId()?->getId() === $currentUser->getId()) {
                $isProfessional = true;
            }
        }

        // Si l'utilisateur connecté, retourne son avis existant pour pré-remplir le formulaire
        $userReview = null;
        if ($currentUser !== null) {
            $existingNote = $this->laverieNoteRepository->findOneBy([
                'laverie'    => $laverie,
                'utilisateur' => $currentUser,
            ]);
            if ($existingNote !== null) {
                $userReview = [
                    'note'        => $existingNote->getNote(),
                    'commentaire' => $existingNote->getCommentaire(),
                ];
            }
        }


        //  Réponse JSON
        return $this->json([
            'id'             => $laverie->getId(),
            'name'           => $laverie->getNomEtablissement(),
            'logo'           => $logoUrl,
            'images'         => $images,
            'rating'         => $moyenneNote,
            'reviewCount'    => $totalNotes,
            'isOpen'         => $isOpen,
            'isFavorite'     => $isFavorite,
            'isProfessional' => $isProfessional,   // ← nouveau
            'userReview'     => $userReview,
            'description'    => $laverie->getDescription(),
            'email'          => $laverie->getContactEmail(),
            'address'        => $adresse?->getAdresse(),
            'rue'            => $adresse?->getRue(),
            'city'           => $adresse?->getVille(),
            'postalCode'     => (string) ($adresse?->getCodePostal() ?? ''),
            'lat'            => $adresse?->getLatitude(),
            'lng'            => $adresse?->getLongitude(),
            'services'       => $services,
            'paymentMethods' => $paymentMethods,
            'horaires'       => $horaires,
            'machines'       => $machines,
            'reviews'        => $reviews,
            'socialLinks'    => [
                'facebook'  => $laverie->getFacebookUrl(),
                'instagram' => $laverie->getInstagramUrl(),
                'x'         => $laverie->getXUrl(),
                'linkedin'  => $laverie->getLinkedinUrl(),
                'siteWeb'   => $laverie->getSiteWebUrl(),
            ],
        ]);
    }


    // GET /api/v1/fiche-laverie/{id}/machines-statut  (accès public)
    // Interrogé en boucle par le frontend (toutes les 30s) pour rafraîchir le statut des machines
    // sans recharger toute la fiche. Toujours appelé en direct chez Wi-Line (jamais mis en cache).
    #[Route('/fiche-laverie/{id}/machines-statut', name: 'api_fiche_laverie_machines_statut', methods: ['GET'])]
    public function machinesStatut(int $id, WiLineService $wiLineService): JsonResponse
    {
        $laverie = $this->laverieRepository->find($id);

        if (!$laverie || $laverie->getSupprimeLe() !== null) {
            return $this->json(['message' => 'Laverie introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }

        // Laverie pas (encore) reliée à une centrale Wi-Line : rien à afficher
        if (!$laverie->getWiLineReference()) {
            return $this->json(['statuts' => []]);
        }

        $data = $wiLineService->getCentraleDataCached($laverie->getWiLineReference());
        $machineList = $data['machines'] ?? [];

        $equipements = $this->laverieEquipementRepository->findBy(['laverie' => $laverie]);

        $statuts = [];
        foreach ($equipements as $equipement) {
            $equipementReference = $equipement->getEquipementReference();
            if ($equipementReference === null) {
                continue; // On ignore les équipements sans référence Wi-Line
            }

            // $machineList est une liste (pas un tableau indexé par machine_number) :
            // on cherche la machine dont le champ machine_number correspond.
            $machineData = null;
            foreach ($machineList as $machine) {
                if (($machine['machine_number'] ?? null) === $equipementReference) {
                    $machineData = $machine;
                    break;
                }
            }

            if ($machineData !== null) {
                $statuts[] = [
                    'equipementId' => $equipement->getId(),
                    'status'       => $machineData['status'] ?? null,
                    'statusText'   => $machineData['status_text'] ?? null,
                ];
            } else {
                // Aucune machine Wi-Line ne correspond à cet équipement
                $statuts[] = [
                    'equipementId' => $equipement->getId(),
                    'status'       => null,
                    'statusText'   => null, // ou un message par défaut comme "Statut inconnu"
                ];
            }
        }

        return $this->json(['statuts' => $statuts]);
    }




    // Toggle : ajoute ou retire la laverie des favoris de l'utilisateur (connecté uniquement)

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



    // Calcul dynamique ouvert / fermé (tient compte des fermetures exceptionnelles)
    private function calculateIsOpen(array $fermetures, Laverie $laverie): bool
    {
        $maintenant    = new \DateTime('now');
        $heureActuelle = $maintenant->format('H:i');

        // Vérifier d'abord si une fermeture exceptionnelle est active
        $fermeturesExc = $this->laverieFermetureExceptionnelleRepository->findBy(['laverie' => $laverie]);
        foreach ($fermeturesExc as $exc) {
            if ($maintenant >= $exc->getDateDebut() && $maintenant <= $exc->getDateFin()) {
                return false;
            }
        }

       
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


    
    // Crée ou met à jour la note et le commentaire de l'utilisateur connecté
    
    #[Route('/user/fiche-laverie/{id}/commentaire', name: 'api_user_fiche_laverie_commentaire', methods: ['POST'])]
    public function ajouterCommentaire(int $id, Request $request): JsonResponse
    {
        $laverie = $this->laverieRepository->find($id);
 
        if (!$laverie || $laverie->getSupprimeLe() !== null) {
            return $this->json(['message' => 'Laverie introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }
 
        /** @var \App\Entity\Utilisateur $currentUser */
        $currentUser = $this->getUser();

        if($currentUser->getStatut() === StatutEnum::BANNI) {
            return $this->json(['message' => 'Votre compte est actuellement bloqué. Vous ne pouvez pas publier d\'avis.'], JsonResponse::HTTP_FORBIDDEN);
        }
 
        // Validation du corps JSON 
        $body = json_decode($request->getContent(), true);
 
        $note        = $body['note']        ?? null;
        $commentaire = $body['commentaire'] ?? null;
 
        if (!is_int($note) || $note < 1 || $note > 5) {
            return $this->json(
                ['message' => 'La note doit être un entier entre 1 et 5.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }
 
        if (!is_string($commentaire) || mb_strlen(trim($commentaire)) < 10) {
            return $this->json(
                ['message' => 'Le commentaire doit faire au moins 10 caractères.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }
 
        $commentaire = mb_substr(trim($commentaire), 0, 255);

        $motsInterdits = array_map(
            fn($m) => mb_strtolower($m->getLabel()),
            $this->motInjurieuxRepository->findAll()
        );
        $commentaireLower = mb_strtolower($commentaire);
        foreach ($motsInterdits as $mot) {
            if (str_contains($commentaireLower, $mot)) {
                return $this->json(
                    ['message' => 'Votre commentaire contient un ou plusieurs mots interdits.'],
                    JsonResponse::HTTP_UNPROCESSABLE_ENTITY
                );
            }
        }

        // Création ou mise à jour
        // Un seul avis par utilisateur par laverie / cherche un avis existant
        $laverieNote = $this->laverieNoteRepository->findOneBy([
            'laverie'    => $laverie,
            'utilisateur' => $currentUser,
        ]);
 
        $isNew = $laverieNote === null;
 
        if ($isNew) {
            $laverieNote = new LaverieNote();
            $laverieNote->setLaverie($laverie);
            $laverieNote->setUtilisateur($currentUser);
            $laverieNote->setNoteLe(new \DateTime());
        }
 
        $laverieNote->setNote($note);
        $laverieNote->setCommentaire($commentaire);
        $laverieNote->setCommentaireLe(new \DateTime());
 
        if ($isNew) {
            $this->entityManager->persist($laverieNote);
        }
 
        $this->entityManager->flush();
 
        // Réponse 
        $initiales = urlencode($currentUser->getPrenom() . '+' . $currentUser->getNom());
 
        return $this->json([
            'id'      => $laverieNote->getId(),
            'author'  => $currentUser->getPrenom() . ' ' . $currentUser->getNom(),
            'avatar'  => "https://ui-avatars.com/api/?name={$initiales}&background=e2e8f0&color=475569&size=64",
            'rating'  => $laverieNote->getNote(),
            'date'    => $laverieNote->getCommentaireLe()->format('d/m/Y'),
            'comment' => $laverieNote->getCommentaire(),
            'message' => $isNew ? 'Avis publié avec succès.' : 'Avis mis à jour avec succès.',
        ], $isNew ? JsonResponse::HTTP_CREATED : JsonResponse::HTTP_OK);
    }


    

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/user/fiche-laverie/{laverieId}/commentaire/{noteId}/reponse
    // Permet au professionnel propriétaire de répondre à un commentaire
    // ─────────────────────────────────────────────────────────────────────────
    #[Route(
        '/user/fiche-laverie/{laverieId}/commentaire/{noteId}/reponse',
        name: 'api_user_fiche_laverie_reponse',
        methods: ['POST']
    )]
    public function repondreCommentaire(int $laverieId, int $noteId, Request $request): JsonResponse
    {
        $laverie = $this->laverieRepository->find($laverieId);
 
        if (!$laverie || $laverie->getSupprimeLe() !== null) {
            return $this->json(['message' => 'Laverie introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }
 
        /** @var \App\Entity\Utilisateur $currentUser */
        $currentUser = $this->getUser();
 
        // ── Vérification : l'utilisateur est bien le propriétaire de cette laverie ──
        $professionnel = $laverie->getProfessionnel();
        if ($professionnel === null || $professionnel->getUtilisateurId()?->getId() !== $currentUser->getId()) {
            return $this->json(
                ['message' => 'Accès refusé. Vous n\'êtes pas le propriétaire de cette laverie.'],
                JsonResponse::HTTP_FORBIDDEN
            );
        }
 
        // ── Récupération du commentaire à partir de l'id ──
        $laverieNote = $this->laverieNoteRepository->find($noteId);
 
        if ($laverieNote === null || $laverieNote->getLaverie() !== $laverie) {
            return $this->json(['message' => 'Commentaire introuvable.'], JsonResponse::HTTP_NOT_FOUND);
        }
 
        // ── Validation de la réponse ──
        $body    = json_decode($request->getContent(), true);
        $reponse = $body['reponse'] ?? null;
 
        if (!is_string($reponse) || mb_strlen(trim($reponse)) < 5) {
            return $this->json(
                ['message' => 'La réponse doit faire au moins 5 caractères.'],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }
 
        $reponse = mb_substr(trim($reponse), 0, 255);
 
        // ── Enregistrement ──
        $laverieNote->setReponse($reponse);
        $laverieNote->setRepondLe(new \DateTime());
        $this->entityManager->flush();

        // ── Notification email à l'auteur du commentaire (F-12) ──
        $auteur = $laverieNote->getUtilisateur();
        $this->sendEmailService->sendReponseAvisNotification(
            $auteur->getEmail(),
            $auteur->getPrenom(),
            $laverie->getNomEtablissement(),
            $reponse,
        );

        return $this->json([
            'reponse'   => $laverieNote->getReponse(),
            'repond_le' => $laverieNote->getRepondLe()->format('d/m/Y'),
            'message'   => 'Réponse publiée avec succès.',
        ]);
    }

}