<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\LaverieNoteSignalement;
use App\Entity\Utilisateur;
use App\Enum\MotifEnum;
use App\Repository\LaverieNoteSignalementRepository;
use App\Repository\LaverieNoteRepository;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;

#[Route('/api/v1/utilisateur', name: 'signalement_')]
final class SignalementController extends AbstractController
{
    public function __construct(
        private LaverieNoteSignalementRepository $laverieNoteSignalementRepository,
        private LaverieNoteRepository $laverieNoteRepository,
        private EntityManagerInterface $entityManager
    ) {}

    #[Route('/avis/{id}/signalement', name: 'app_add_signalement', methods: ['POST'])]
    #[OA\Tag(name: 'Signalement')]
    #[OA\RequestBody(
        description: 'Données pour créer un signalement',
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'laverie_note_id', type: 'integer', example: 1),
                new OA\Property(property: 'motif', type: 'string', example: 'Contenu inapproprié'),
                new OA\Property(property: 'commentaire', type: 'string', example: 'Ce commentaire est offensant.'),
            ]
        )
    )]
    public function addSignalement(int $id, Request $request): Response
    {
        $note = $this->laverieNoteRepository->find($id);
        if (!$note) {
            return $this->json([
                'message' => 'Avis non trouvé',
            ], Response::HTTP_NOT_FOUND);
        }

        $body = json_decode($request->getContent(), true);

        $utilisateur = $this->getUser();
        if (!$utilisateur instanceof Utilisateur) {
            return $this->json([
                'message' => 'Vous devez être connecté pour signaler un avis',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $motifValue = $body['motif'] ?? null;
        if (!$motifValue) {
            return $this->json([
                'message' => 'Le champ "motif" est requis',
            ], Response::HTTP_BAD_REQUEST);
        }
        
        $motif = MotifEnum::tryFrom($motifValue);
        if (!$motif) {
            return $this->json([
                'message' => 'Motif de signalement invalide',
            ], Response::HTTP_BAD_REQUEST);
        }

        $existant = $this->laverieNoteSignalementRepository->findOneBy([
            'utilisateur'  => $utilisateur,
            'laverie_note' => $note,
        ]);
        if ($existant) {
            return $this->json([
                'message' => 'Vous avez déjà signalé cet avis',
            ], Response::HTTP_CONFLICT);
        }

        $laverieNoteSignalement = new LaverieNoteSignalement();
        $laverieNoteSignalement->setLaverieNote($note);
        $laverieNoteSignalement->setUtilisateur($utilisateur);
        $laverieNoteSignalement->setMotif($motif);
        $laverieNoteSignalement->setCommentaire($body['commentaire'] ?? null);
        $laverieNoteSignalement->setDate(new \DateTime());

        $this->entityManager->persist($laverieNoteSignalement);
        $this->entityManager->flush();

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
}
