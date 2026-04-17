<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\FavoriRepository; 
use App\Entity\User; 

final class FavoriController extends AbstractController
{
    #[Route('/favori-list', name: 'app_favori_list')]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Security(name: 'bearer')]
    public function list(FavoriRepository $repository): Response
    {
        if ($this->getUser instanceof User) {
            return $this->json(
                [$message => 'Vous n\'êtes pas connecté ', ], 
                Response::HTTP_FORBIDDEN
            );
        }

        $laveries = $repository->findByUser($this->getUser());

        if (empty($laveries)) {
            return $this->json(
                [$message => 'Aucune laverie trouvée', ], 
                Response::HTTP_NO_CONTENT
            );
        }

        return $this->json([
            'laveries' => $laveries,
        ], Response::HTTP_OK); 

    }
}
