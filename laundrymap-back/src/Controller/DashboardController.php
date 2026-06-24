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
    #[OA\Security(name: 'bearer')]
    public function dashboard(): JsonResponse
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

        $laveries = $this->laverieRepository->findActivesByProfessionnel($professionnel);

        $noteMoyenneGlobale = null;
        $totalNotes = 0;
        $sommeNotes = 0;

        foreach ($laveries as $laverie) {
            $moyenne = $this->laverieNoteRepository->findAverageRatingByLaverie($laverie);
            $nbAvis  = $this->laverieNoteRepository->countAvisByLaverie($laverie);
            if ($moyenne !== null && $nbAvis > 0) {
                $sommeNotes  += $moyenne * $nbAvis;
                $totalNotes  += $nbAvis;
            }
        }

        if ($totalNotes > 0) {
            $noteMoyenneGlobale = round($sommeNotes / $totalNotes, 1);
        }

        $data = array_map(function (Laverie $laverie) {
            $logo = $laverie->getLogo();
            $adresse = $laverie->getAdresse();

            return [
                'id'      => $laverie->getId(),
                'nom'     => $laverie->getNomEtablissement(),
                'statut'  => $laverie->getStatut()->value,
                'logoUrl' => $logo?->getEmplacement(),
                'rating'  => $this->laverieNoteRepository->findAverageRatingByLaverie($laverie),
                'avis'    => $this->laverieNoteRepository->countAvisByLaverie($laverie),
                'adresse'      => $adresse ? [
                    'adresse'     => $adresse->getAdresse(),
                    'rue'         => $adresse->getRue(),
                    'ville'       => $adresse->getVille(),
                    'code_postal' => $adresse->getCodePostal(),
                ] : null,
                'date_ajout'   => $laverie->getDateAjout()?->format('d/m/Y'),
            ];
        }, $laveries);

        return $this->json([
            'laveries' => $data,
            'total'    => count($data),
            'noteMoyenneGlobale'  => $noteMoyenneGlobale,
        ]);
    }
}
