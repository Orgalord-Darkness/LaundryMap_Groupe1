<?php

namespace App\Controller;

use App\Repository\UtilisateurRepository;
use App\Repository\ProfessionnelRepository;
use App\Repository\LaverieRepository;
use App\Repository\LaverieNoteRepository;        // adapte si ton entité s'appelle différemment
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;


#[Route('/api/v1/admin/dashboard')]
class AdminDashboardController extends AbstractController
{
    #[Route('/stats', name: 'admin_dashboard_stats', methods: ['GET'])]
    public function stats(
        UtilisateurRepository   $utilisateurRepository,
        LaverieRepository       $laverieRepository,
        LaverieNoteRepository   $laverieNoteRepository,
        ProfessionnelRepository $professionnelRepository,
    ): JsonResponse {

        return $this->json([
            // Cards bleues
            'totalUsers'         => $utilisateurRepository->count([]),
            'totalPros'          => $professionnelRepository->count([]),
            'totalLaundries'     => $laverieRepository->count([]),
            // Cards grises (actions à traiter)
            'accountsToValidate' => $professionnelRepository->countPending(),
            'pendingLaundries'   => $laverieRepository->countPending(),
            'reportedComments'   => $laverieNoteRepository->countReported(),
        ]);
    }
}