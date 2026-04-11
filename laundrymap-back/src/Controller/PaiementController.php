<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;   // ✔ IMPORT CORRECT
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\MethodePaiementRepository; 
use OpenApi\Attributes as OA;

#[Route('/api/v1/paiements')]
final class PaiementController extends AbstractController
{
    #[Route('/list', name: 'paiements_list', methods: ['GET'])]
    #[OA\Tag(name: 'Paiements')]
    public function listPaiements(MethodePaiementRepository $paiementRepository): JsonResponse
    {
        return $this->json(
            $paiementRepository->findAll(),
            Response::HTTP_OK
        );
    }
}
