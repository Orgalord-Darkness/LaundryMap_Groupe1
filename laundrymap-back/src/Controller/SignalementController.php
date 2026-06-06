<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use App\Entity\LaverieNoteSignalement;
use App\Entity\Utilisateur;
use App\Enum\MotifEnum;
use App\Enum\StatutEnum;
use App\Repository\LaverieNoteSignalementRepository;
use App\Repository\LaverieNoteRepository;
use App\Service\SendEmailService;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;

#[Route('/api/v1', name: 'signalement_')]
final class SignalementController extends AbstractController
{
    public function __construct(
        private LaverieNoteSignalementRepository $laverieNoteSignalementRepository,
        private LaverieNoteRepository $laverieNoteRepository,
        private EntityManagerInterface $entityManager,
        private SendEmailService $sendEmailService,
        #[Autowire(env: 'int:SIGNALEMENT_SEUIL_MASQUAGE')]
        private int $seuilMasquage,
        #[Autowire(env: 'int:SIGNALEMENT_LIMITE_UTILISATEUR')]
        private int $limiteUtilisateur,
        #[Autowire(env: 'int:SIGNALEMENT_PERIODE_HEURES')]
        private int $periodeHeures,
    ) {}

    #[Route('/utilisateur/avis/{id}/signalement', name: 'app_add_signalement', methods: ['POST'])]
    #[OA\Tag(name: 'Signalement')]
    #[OA\RequestBody(
        description: 'Données pour créer un signalement',
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'motif', type: 'string', example: 'spam'),
                new OA\Property(property: 'commentaire', type: 'string', example: 'Ce commentaire est offensant.'),
            ]
        )
    )]
    public function addSignalement(int $id, Request $request): Response
    {
        $note = $this->laverieNoteRepository->find($id);
        if (!$note) {
            return $this->json(['message' => 'Avis non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $utilisateur = $this->getUser();
        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['message' => 'Vous devez être connecté pour signaler un avis'], Response::HTTP_UNAUTHORIZED);
        }

        if ($utilisateur->getStatut() === StatutEnum::BANNI) {
            return $this->json(['message' => 'Votre compte est actuellement bloqué. Vous ne pouvez pas signaler d\'avis.'], Response::HTTP_FORBIDDEN);
        }

        $body = json_decode($request->getContent(), true);

        $motifValue = $body['motif'] ?? null;
        if (!$motifValue) {
            return $this->json(['message' => 'Le champ "motif" est requis'], Response::HTTP_BAD_REQUEST);
        }

        $motif = MotifEnum::tryFrom($motifValue);
        if (!$motif) {
            return $this->json(['message' => 'Motif invalide. Valeurs acceptées : ' . implode(', ', array_column(MotifEnum::cases(), 'value'))], Response::HTTP_BAD_REQUEST);
        }

        // RG-206 : doublon
        $existant = $this->laverieNoteSignalementRepository->findOneBy([
            'utilisateur'  => $utilisateur,
            'laverie_note' => $note,
        ]);
        if ($existant) {
            return $this->json(['message' => 'Vous avez déjà signalé cet avis'], Response::HTTP_CONFLICT);
        }

        // RG-210 : rate limiting par utilisateur sur la période configurée
        $depuis = new \DateTime("-{$this->periodeHeures} hours");
        $nbSignalementsUser = $this->laverieNoteSignalementRepository->countByUtilisateurSince($utilisateur, $depuis);
        if ($nbSignalementsUser >= $this->limiteUtilisateur) {
            return $this->json(['message' => 'Vous avez atteint la limite de signalements autorisés sur cette période'], Response::HTTP_TOO_MANY_REQUESTS);
        }

        $laverieNoteSignalement = new LaverieNoteSignalement();
        $laverieNoteSignalement->setLaverieNote($note);
        $laverieNoteSignalement->setUtilisateur($utilisateur);
        $laverieNoteSignalement->setMotif($motif);
        $laverieNoteSignalement->setCommentaire($body['commentaire'] ?? null);
        $laverieNoteSignalement->setDate(new \DateTime());

        $this->entityManager->persist($laverieNoteSignalement);
        $this->entityManager->flush();

        // Notification e-mail à l'auteur du commentaire signalé
        $auteur = $note->getUtilisateur();
        if ($auteur && $note->getCommentaire()) {
            $this->sendEmailService->sendSignalementNotification(
                $auteur->getEmail(),
                $note->getCommentaire(),
                $motif->value,
            );
        }

        // RG-209 : masquage automatique si seuil de signalements atteint
        $totalSignalements = $this->laverieNoteSignalementRepository->countByNote($note);
        if ($totalSignalements >= $this->seuilMasquage && $note->getCommentaireSupprimeMotif() === null) {
            $note->setCommentaireSupprimeMotif('Masqué automatiquement suite à des signalements');
            $note->setCommentaireSupprimeLe(new \DateTime());
            $this->entityManager->flush();
        }

        return $this->json([
            'message' => 'Signalement ajouté avec succès',
            'signalement' => [
                'id'             => $laverieNoteSignalement->getId(),
                'motif'          => $laverieNoteSignalement->getMotif()->value,
                'commentaire'    => $laverieNoteSignalement->getCommentaire(),
                'date'           => $laverieNoteSignalement->getDate()->format('Y-m-d H:i:s'),
                'utilisateur_id' => $utilisateur->getId(),
                'laverie_note_id' => $note->getId(),
            ],
        ], Response::HTTP_CREATED);
    }

    #[Route('/admin/signalements', name: 'app_signalements', methods: ['GET'])]
    #[OA\Tag(name: 'Signalement')]
    public function getSignalements(): JsonResponse
    {
        return $this->json(
            $this->laverieNoteSignalementRepository->getSignalements(),
            Response::HTTP_OK
        );
    }

    #[Route('/admin/utilisateurs/signalements', name: 'app_utilisateurs_signalements', methods: ['GET'])]
    #[OA\Tag(name: 'Signalement')]
    #[OA\Response(response: 200, description: 'Utilisateurs avec leurs commentaires signalés')]
    public function getUtilisateursSignales(): JsonResponse
    {
        $rows = $this->laverieNoteSignalementRepository->getUtilisateursSignales();

        $result = [];
        foreach ($rows as $row) {
            $userId = $row['user_id'];

            if (!isset($result[$userId])) {
                $result[$userId] = [
                    'utilisateur' => [
                        'id'     => $row['user_id'],
                        'nom'    => $row['nom'],
                        'prenom' => $row['prenom'],
                        'email'  => $row['email'],
                        'statut' => $row['statut'],
                    ],
                    'total_signalements'   => 0,
                    'commentaires_signales' => [],
                ];
            }

            $noteId = $row['note_id'];
            $noteIndex = null;
            foreach ($result[$userId]['commentaires_signales'] as $i => $c) {
                if ($c['note_id'] === $noteId) {
                    $noteIndex = $i;
                    break;
                }
            }

            if ($noteIndex === null) {
                $result[$userId]['commentaires_signales'][] = [
                    'note_id'          => $noteId,
                    'commentaire'      => $row['note_commentaire'],
                    'nb_signalements'  => 1,
                ];
            } else {
                $result[$userId]['commentaires_signales'][$noteIndex]['nb_signalements']++;
            }

            $result[$userId]['total_signalements']++;
        }

        usort($result, fn($a, $b) => $b['total_signalements'] <=> $a['total_signalements']);

        return $this->json(array_values($result), Response::HTTP_OK);
    } 

    #[Route('/admin/signalements/{id}', name: 'admin_delete_signalements', methods: ['DELETE'])]
    #[OA\Tag(name: 'Signalement')]
    public function removeSignalement(int $id): JsonResponse
    {
        $signalement = $this->laverieNoteSignalementRepository->find($id);
        if (!$signalement) {
            return $this->json(
                ['message' => 'Signalement non trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }
        $this->entityManager->remove($signalement);
        $this->entityManager->flush();

        return $this->json(['message' => 'Signalement supprimé'], Response::HTTP_OK);
    }

    #[Route('/admin/avis/{id}', name: 'admin_delete_avis', methods: ['DELETE'])]
    #[OA\Tag(name: 'Signalement')]
    #[OA\RequestBody(
        description: 'Motif de suppression du commentaire',
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'motif', type: 'string', example: 'Contenu inapproprié'),
            ]
        )
    )]
    public function removeAvis(int $id, Request $request): JsonResponse
    {
        $avis = $this->laverieNoteRepository->find($id);
        if (!$avis) {
            return $this->json(
                ['message' => 'Commentaire non trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }

        $body = json_decode($request->getContent(), true);
        $motif = $body['motif'] ?? null;
        if (!$motif) {
            return $this->json(['message' => 'Le champ "motif" est requis'], Response::HTTP_BAD_REQUEST);
        }

        $avis->setCommentaireSupprimeMotif($motif);
        $avis->setCommentaireSupprimeLe(new \DateTime());
        $this->entityManager->flush();

        return $this->json(['message' => 'Commentaire masqué'], Response::HTTP_OK);
    }

}
