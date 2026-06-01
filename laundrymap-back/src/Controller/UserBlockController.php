<?php

namespace App\Controller;

use App\Entity\Administrateur;
use App\Entity\Utilisateur;
use App\Entity\UtilisateurHistoriqueInteraction;
use App\Enum\StatutEnum;
use App\Repository\AdministrateurRepository;
use App\Repository\UtilisateurHistoriqueInteractionRepository;
use App\Repository\UtilisateurRepository;
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
    ) {}

    /**
     * TODO(human) — Implémente cet endpoint.
     *
     * POST /api/v1/admin/users/{id}/block
     * Bloque un utilisateur (temporairement ou définitivement).
     *
     * Étapes :
     * 1. Récupérer l'admin connecté via getAdminOrNull() → 403 si null
     * 2. Récupérer l'utilisateur cible par $id → 404 si absent
     * 3. Décoder le body JSON : type ("TEMPORARY"|"PERMANENT"), reason, expires_at
     * 4. Valider :
     *    - reason absente ou vide → 400 (RG-234)
     *    - type = "TEMPORARY" sans expires_at → 400
     *    - expires_at dans le passé → 400
     * 5. Appliquer le blocage :
     *    - $user->setStatut(StatutEnum::BANNI)
     *    - $user->setBlockedUntil($expiresAt ou null)
     * 6. Créer une entrée UtilisateurHistoriqueInteraction (action=BANNI, motif=$reason)
     * 7. persist + flush, retourner 201
     */
    #[Route('/admin/users/{id}/block', name: 'block', methods: ['POST'])]
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
        // TODO(human) : implémenter cet endpoint
    }

    #[Route('/admin/users/{id}/block', name: 'unblock', methods: ['DELETE'])]
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

    #[Route('/admin/users/{id}/blocks', name: 'history', methods: ['GET'])]
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

    private function getAdminOrNull(): ?Administrateur
    {
        $user = $this->getUser();
        if (!$user instanceof Utilisateur) {
            return null;
        }

        return $this->administrateurRepository->findOneByEmail($user->getEmail());
    }
}
