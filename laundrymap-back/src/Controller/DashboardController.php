<?php

namespace App\Controller;

use App\Entity\Laverie;
use App\Entity\Utilisateur;
use App\Entity\Professionnel;

use App\Repository\LaverieRepository;
use App\Repository\LaverieNoteRepository;
use App\Repository\ProfessionnelRepository;

use OpenApi\Attributes as OA;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;


#[Route('/api/v1/professionnel', name: 'api_pro_')]
class DashboardController extends AbstractController
{
    public function __construct(
        private LaverieRepository      $laverieRepository,
        private LaverieNoteRepository  $laverieNoteRepository,
        private ProfessionnelRepository $professionnelRepository,
    ) {}

    #[Route('/dashboard', name: 'dashboard', methods: ['GET'])]
    #[OA\Tag(name: 'Professionnel')]
    #[OA\SecurityScheme(name: 'bearer', type: 'http', scheme: 'bearer')]
    public function dashboard(Request $request): JsonResponse
    {
        
        $utilisateur = $this->getUser();

        if (!$utilisateur instanceof Utilisateur) {
            return $this->json(['error' => 'Non authentifié'], 401);
        }

        
        $professionnel = $this->professionnelRepository->findOneBy([
            'utilisateur' => $utilisateur,
        ]);

        if (!$professionnel instanceof Professionnel) {
            return $this->json(['error' => 'Aucun compte professionnel trouvé'], 403);
        }

        $baseUrl  = $request->getSchemeAndHttpHost();
        $laveries = $this->laverieRepository->findActivesByProfessionnel($professionnel);

        $data = array_map(function (Laverie $laverie) use ($baseUrl) {
            $logo    = $laverie->getLogo();
            $logoUrl = $logo
                ? $baseUrl . '/' . $logo->getEmplacement()
                : null;

            return [
                'id'      => $laverie->getId(),
                'nom'     => $laverie->getNomEtablissement(),
                'statut'  => $laverie->getStatut()->value,
                'logoUrl' => $logoUrl,
                'rating'  => $this->laverieNoteRepository->findAverageRatingByLaverie($laverie),
                'avis'    => $this->laverieNoteRepository->countAvisByLaverie($laverie),
            ];
        }, $laveries);

        return $this->json([
            'laveries' => $data,
            'total'    => count($data),
        ]);
    }
}
