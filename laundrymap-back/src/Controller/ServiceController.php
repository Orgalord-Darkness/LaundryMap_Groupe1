<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;   // ✔ IMPORT CORRECT
use Symfony\Component\Routing\Attribute\Route;
use App\Repository\ServiceRepository;
use OpenApi\Attributes as OA;

#[Route('/api/v1/services')]
final class ServiceController extends AbstractController
{
    #[Route('/list', name: 'services_list', methods: ['GET'])]
    #[OA\Tag(name: 'Services')]
    public function listServices(ServiceRepository $serviceRepository): JsonResponse
    {
        return $this->json(
            $serviceRepository->findAll(),
            Response::HTTP_OK
        );
    }
}
