<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\FavoriRepository;
use App\Entity\Utilisateur;
use App\Entity\Laverie;
use OpenApi\Attributes as OA;

#[Route('/api/v1/favori', name: 'api_pro_')]
class FavoriController extends AbstractController
{
    #[Route('/list', name: 'app_favori_list', methods: ['GET'])]
    #[OA\Tag(name: 'Favori')]
    #[OA\Security(name: 'bearer')]
    #[OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1))]
    #[OA\Parameter(name: 'limit', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 10))]
    public function list(Request $request, FavoriRepository $repository): Response
    {
        $user = $this->getUser();
        if (!$user instanceof Utilisateur) {
            return $this->json(
                ['message' => 'Vous n\'êtes pas connecté'],
                Response::HTTP_FORBIDDEN
            );
        }

        $page   = max(1, (int) $request->query->get('page', 1));
        $limit  = max(1, min(100, (int) $request->query->get('limit', 10)));
        $offset = ($page - 1) * $limit;

        $laveries = $repository->findByUser($user, $offset, $limit);
        $total    = $repository->countByUser($user);

        if (empty($laveries)) {
            return $this->json(
                ['message' => 'Aucune laverie trouvée'],
                Response::HTTP_NO_CONTENT
            );
        }

        $data = array_map(function (Laverie $laverie): array {
            $adresse = $laverie->getAdresse();
            $logo    = $laverie->getLogo();
            return [
                'id'                => $laverie->getId(),
                'nom_etablissement' => $laverie->getNomEtablissement(),
                'statut'            => $laverie->getStatut()?->value,
                'description'       => $laverie->getDescription(),
                'adresse'           => [
                    'adresse'     => $adresse?->getAdresse(),
                    'rue'         => $adresse?->getRue(),
                    'code_postal' => $adresse?->getCodePostal(),
                    'ville'       => $adresse?->getVille(),
                    'pays'        => $adresse?->getPays(),
                    'latitude'    => $adresse?->getLatitude(),
                    'longitude'   => $adresse?->getLongitude(),
                ],
                'logo' => $logo?->getEmplacement(),
            ];
        }, $laveries);

        return $this->json([
            'data'        => $data,
            'page'        => $page,
            'limit'       => $limit,
            'total'       => $total,
            'total_pages' => (int) ceil($total / $limit),
        ], Response::HTTP_OK);
    }

}
