<?php

namespace App\Controller;

use App\Entity\Administrateur;
use App\Repository\UtilisateurHistoriqueInteractionRepository;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/admin/utilisateurs', name: 'historique_utilisateur_')]
final class HistoriqueUtilisateurController extends AbstractController
{
    private const ACTIONS_VALIDES = ['BLOCAGE', 'LEVEE_BLOCAGE', 'VALIDATION_PRO', 'REFUS_PRO'];

    public function __construct(
        private UtilisateurHistoriqueInteractionRepository $historiqueRepository,
    ) {}

    #[Route('/historique', name: 'liste', methods: ['GET'])]
    #[OA\Tag(name: 'Historique interactions utilisateur')]
    #[OA\Security(name: 'Bearer')]
    #[OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', example: 1))]
    #[OA\Parameter(name: 'action', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['BLOCAGE', 'LEVEE_BLOCAGE', 'VALIDATION_PRO', 'REFUS_PRO']))]
    #[OA\Parameter(name: 'date_debut', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date', example: '2024-01-01'))]
    #[OA\Parameter(name: 'date_fin', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date', example: '2024-12-31'))]
    #[OA\Parameter(name: 'utilisateur', in: 'query', required: false, schema: new OA\Schema(type: 'string'))]
    #[OA\Parameter(name: 'motif', in: 'query', required: false, schema: new OA\Schema(type: 'string'))]
    #[OA\Response(
        response: 200,
        description: 'Historique récupéré avec succès',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'enregistrements', type: 'array',
                    items: new OA\Items(type: 'object', properties: [
                        new OA\Property(property: 'id',                  type: 'integer'),
                        new OA\Property(property: 'type_interaction',    type: 'string', example: 'BLOCAGE'),
                        new OA\Property(property: 'date',                type: 'string', format: 'date-time'),
                        new OA\Property(property: 'action',              type: 'string'),
                        new OA\Property(property: 'action_label',        type: 'string', example: 'BLOCAGE'),
                        new OA\Property(property: 'motif_action',        type: 'string', nullable: true),
                        new OA\Property(property: 'utilisateur_id',      type: 'integer'),
                        new OA\Property(property: 'utilisateur_nom',     type: 'string'),
                        new OA\Property(property: 'utilisateur_prenom',  type: 'string'),
                        new OA\Property(property: 'utilisateur_email',   type: 'string'),
                        new OA\Property(property: 'administrateur_id',   type: 'integer'),
                        new OA\Property(property: 'administrateur_email', type: 'string'),
                    ])
                ),
                new OA\Property(property: 'page',        type: 'integer'),
                new OA\Property(property: 'limit',       type: 'integer'),
                new OA\Property(property: 'total',       type: 'integer'),
                new OA\Property(property: 'total_pages', type: 'integer'),
            ]
        )
    )]
    #[OA\Response(response: 403, description: 'Accès refusé')]
    public function liste(Request $request): JsonResponse
    {
        if (!$this->getAdminOrNull()) {
            return $this->json(['message' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $page   = max(1, (int) $request->query->get('page', 1));
        $limit  = 10;
        $offset = ($page - 1) * $limit;

        $actionParam = $request->query->get('action');
        $action = in_array($actionParam, self::ACTIONS_VALIDES, true) ? $actionParam : null;

        $dateDebut = null;
        $dateFin   = null;
        if ($request->query->get('date_debut')) {
            $dateDebut = \DateTime::createFromFormat('Y-m-d', $request->query->get('date_debut')) ?: null;
            $dateDebut?->setTime(0, 0, 0);
        }
        if ($request->query->get('date_fin')) {
            $dateFin = \DateTime::createFromFormat('Y-m-d', $request->query->get('date_fin')) ?: null;
            $dateFin?->setTime(23, 59, 59);
        }

        $utilisateur = $request->query->get('utilisateur') ?: null;
        $motif       = $request->query->get('motif') ?: null;

        $total           = $this->historiqueRepository->getHistoriqueInteractionsCount($action, $dateDebut, $dateFin, $utilisateur, $motif);
        $enregistrements = $this->historiqueRepository->getHistoriqueInteractions($offset, $limit, $action, $dateDebut, $dateFin, $utilisateur, $motif);

        return $this->json([
            'enregistrements' => $enregistrements,
            'page'            => $page,
            'limit'           => $limit,
            'total'           => $total,
            'total_pages'     => (int) ceil($total / $limit),
        ], Response::HTTP_OK);
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
