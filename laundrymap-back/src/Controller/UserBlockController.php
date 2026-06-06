<?php

namespace App\Controller;

use App\Entity\Administrateur;
use App\Entity\UtilisateurHistoriqueInteraction;
use App\Enum\StatutEnum;
use App\Repository\AdministrateurRepository;
use App\Repository\LaverieNoteSignalementRepository;
use App\Repository\UtilisateurHistoriqueInteractionRepository;
use App\Repository\UtilisateurRepository;
use App\Service\SendEmailService;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1', name: 'user_block_')]
final class UserBlockController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UtilisateurRepository $utilisateurRepository,
        private AdministrateurRepository $administrateurRepository,
        private UtilisateurHistoriqueInteractionRepository $historiqueRepository,
        private LaverieNoteSignalementRepository $signalementRepository,
        private SendEmailService $sendEmailService,
    ) {}

    #[Route('/admin/users/{id}/block', name: 'block', methods: ['POST'], requirements: ['id' => '\d+'])]  
    #[OA\Tag(name: 'Modération utilisateur')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'type', type: 'string', example: 'TEMPORARY'),
                new OA\Property(property: 'reason', type: 'string', example: 'Comportement abusif'),
                new OA\Property(property: 'expires_at', type: 'string', example: '2026-07-01T00:00:00+00:00'),
            ]
        )
    )]
    #[OA\Response(response: 201, description: 'Utilisateur bloqué')]
    #[OA\Response(response: 400, description: 'Données invalides')]
    #[OA\Response(response: 403, description: 'Accès refusé')]
    #[OA\Response(response: 404, description: 'Utilisateur non trouvé')]
    public function blockAction(int $id, Request $request): JsonResponse
    {
        $admin = $this->getAdminOrNull();
        if (!$admin) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }
        $user = $this->utilisateurRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }   
        $data = json_decode($request->getContent(), true);
        $type = $data['type'] ?? null;
        $reason = $data['reason'] ?? null;
        $expiresAtRaw = $data['expires_at'] ?? null;
        $expiresAt = $expiresAtRaw ? new \DateTime($expiresAtRaw) : null;   

        if (!$reason || trim($reason) === '') {
            return $this->json(['message' => 'Le motif de blocage est requis.'], Response::HTTP_BAD_REQUEST);
        }
        if ($type === 'TEMPORARY' && !$expiresAt) {
            return $this->json(['message' => 'La date d\'expiration est requise pour un blocage temporaire.'], Response::HTTP_BAD_REQUEST);
        }
        if ($expiresAt && $expiresAt < new \DateTime()) {
            return $this->json(['message' => 'La date d\'expiration doit être dans le futur.'], Response::HTTP_BAD_REQUEST);
        }
        $user->setStatut(StatutEnum::BANNI);
        $user->setBlockedUntil($expiresAt);
        $historique = new UtilisateurHistoriqueInteraction();
        $historique->setAdministrateur($admin);
        $historique->setUtilisateur($user);
        $historique->setAction(StatutEnum::BANNI);
        $historique->setMotifAction($reason);
        $historique->setDate(new \DateTime());
        $this->entityManager->persist($historique);
        $this->entityManager->flush();

        $this->sendEmailService->sendBannissementNotification(
            $user->getEmail(),
            $reason,
            $expiresAt,
        );

        return $this->json(['message' => 'Utilisateur bloqué avec succès.'], Response::HTTP_CREATED);
        
    }

    #[Route('/admin/users/{id}/unblock', name: 'unblock', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    #[OA\Tag(name: 'Modération utilisateur')]
    #[OA\Response(response: 200, description: 'Blocage levé')]
    #[OA\Response(response: 403, description: 'Accès refusé')]
    #[OA\Response(response: 404, description: 'Utilisateur non bloqué')]
    public function unblockAction(int $id): JsonResponse
    {
        $admin = $this->getAdminOrNull();
        if (!$admin) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $user = $this->utilisateurRepository->find($id);
        if (!$user || $user->getStatut() !== StatutEnum::BANNI) {
            return $this->json(['message' => 'Aucun blocage actif pour cet utilisateur.'], Response::HTTP_NOT_FOUND);
        }

        $user->setStatut(StatutEnum::VALIDE);
        $user->setBlockedUntil(null);

        $historique = new UtilisateurHistoriqueInteraction();
        $historique->setAdministrateur($admin);
        $historique->setUtilisateur($user);
        $historique->setAction(StatutEnum::VALIDE);
        $historique->setMotifAction('Levée manuelle du blocage');
        $historique->setDate(new \DateTime());

        $this->entityManager->persist($historique);
        $this->entityManager->flush();

        return $this->json(['message' => 'Blocage levé avec succès.'], Response::HTTP_OK);
    }

    #[Route('/admin/users/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Tag(name: 'Modération utilisateur')]
    #[OA\Response(response: 200, description: 'Informations de l\'utilisateur')]
    #[OA\Response(response: 403, description: 'Accès refusé')]
    #[OA\Response(response: 404, description: 'Utilisateur non trouvé')]
    public function showAction(int $id): JsonResponse
    {
        if (!$this->getAdminOrNull()) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $user = $this->utilisateurRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id' => $user->getId(), 
            'nom'=> $user->getNom(),
            'prenom' => $user->getPrenom(),
            'email' => $user->getEmail(), 
            'statut' => $user->getStatut()?->value
        ], Response::HTTP_OK);  
    }

    #[Route('/admin/users/{id}/blocks', name: 'history', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Tag(name: 'Modération utilisateur')]
    #[OA\Response(response: 200, description: 'Historique des blocages')]
    #[OA\Response(response: 403, description: 'Accès refusé')]
    #[OA\Response(response: 404, description: 'Utilisateur non trouvé')]
    public function historyAction(int $id): JsonResponse
    {
        if (!$this->getAdminOrNull()) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $user = $this->utilisateurRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }

        $historique = $this->historiqueRepository->findBlocagesByUtilisateur($user);

        return $this->json(array_map(fn($h) => [
            'id'         => $h->getId(),
            'action'     => $h->getAction()->value,
            'motif'      => $h->getMotifAction(),
            'admin_id'   => $h->getAdministrateur()?->getId(),
            'date'       => $h->getDate()->format(\DateTime::ATOM),
        ], $historique), Response::HTTP_OK);
    }

    #[Route('/admin/blocks', name: 'list', methods: ['GET'])]
    #[OA\Tag(name: 'Modération utilisateur')]
    #[OA\Parameter(name: 'type', in: 'query', description: 'TEMPORARY ou PERMANENT', schema: new OA\Schema(type: 'string'))]
    #[OA\Parameter(name: 'expires_before', in: 'query', schema: new OA\Schema(type: 'string', format: 'date-time'))]
    #[OA\Response(response: 200, description: 'Liste des utilisateurs bloqués')]
    #[OA\Response(response: 403, description: 'Accès refusé')]
    public function listAction(Request $request): JsonResponse
    {
        if (!$this->getAdminOrNull()) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $type = $request->query->get('type');
        $expiresBeforeRaw = $request->query->get('expires_before');
        $expiresBefore = $expiresBeforeRaw ? new \DateTime($expiresBeforeRaw) : null;

        $users = $this->utilisateurRepository->findAllBannis($type, $expiresBefore);

        return $this->json(array_map(fn($u) => [
            'id'            => $u->getId(),
            'email'         => $u->getEmail(),
            'nom'           => $u->getNom(),
            'prenom'        => $u->getPrenom(),
            'blocked_until' => $u->getBlockedUntil()?->format(\DateTime::ATOM),
            'type'          => $u->getBlockedUntil() !== null ? 'TEMPORARY' : 'PERMANENT',
        ], $users), Response::HTTP_OK);
    }

    #[Route('/admin/users/{id}/reported-comments', name: 'reported_comments', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Tag(name: 'Modération utilisateur')]
    #[OA\Response(response: 200, description: 'Commentaires signalés de l\'utilisateur')]
    #[OA\Response(response: 403, description: 'Accès refusé')]
    #[OA\Response(response: 404, description: 'Utilisateur non trouvé')]
    public function reportedCommentsAction(int $id): JsonResponse
    {
        if (!$this->getAdminOrNull()) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }
        $user = $this->utilisateurRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }
        $rows = $this->signalementRepository->findSignalementsRecusByUtilisateur($user);
        return $this->json(array_map(fn($r) => [
            'id'                   => $r['id'],
            'motif'                => $r['motif'] instanceof \BackedEnum ? $r['motif']->value : (string) $r['motif'],
            'signalement_commentaire' => $r['signalement_commentaire'],
            'date'                 => $r['date'] instanceof \DateTime ? $r['date']->format(\DateTime::ATOM) : $r['date'],
            'note_id'              => $r['note_id'],
            'note_commentaire'     => $r['note_commentaire'],
            'laverie_nom'          => $r['laverie_nom'],
        ], $rows), Response::HTTP_OK);
    }

    #[Route('/admin/users/{id}/reports-made', name: 'reports_made', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Tag(name: 'Modération utilisateur')]
    #[OA\Response(response: 200, description: 'Signalements effectués par l\'utilisateur')]
    #[OA\Response(response: 403, description: 'Accès refusé')]
    #[OA\Response(response: 404, description: 'Utilisateur non trouvé')]
    public function reportsMadeAction(int $id): JsonResponse
    {
        if (!$this->getAdminOrNull()) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }
        $user = $this->utilisateurRepository->find($id);
        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé.'], Response::HTTP_NOT_FOUND);
        }
        $rows = $this->signalementRepository->findSignalementsFaitsByUtilisateur($user);
        return $this->json(array_map(fn($r) => [
            'id'                   => $r['id'],
            'motif'                => $r['motif'] instanceof \BackedEnum ? $r['motif']->value : (string) $r['motif'],
            'signalement_commentaire' => $r['signalement_commentaire'] ?? null,
            'date'                 => $r['date'] instanceof \DateTime ? $r['date']->format(\DateTime::ATOM) : $r['date'],
            'note_id'              => $r['note_id'],
            'note_commentaire'     => $r['note_commentaire'],
            'laverie_nom'          => $r['laverie_nom'],
            'auteur_nom'           => $r['auteur_nom'] ?? null,
            'auteur_prenom'        => $r['auteur_prenom'] ?? null,
        ], $rows), Response::HTTP_OK);
    }

    private function getAdminOrNull(): ?Administrateur
    {
        $user = $this->getUser();
        if ($user instanceof Administrateur) {
            return $user;
        }

        return null;
    }
}
