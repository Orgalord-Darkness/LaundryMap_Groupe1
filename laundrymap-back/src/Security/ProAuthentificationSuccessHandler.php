<?php

namespace App\Security;

use App\Repository\ProfessionnelRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;

class ProAuthentificationSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    public function __construct(
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly ProfessionnelRepository $professionnelRepository,
    ) {}

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): JsonResponse
    {
        $utilisateur = $token->getUser();

        // Vérifie que cet utilisateur est bien un professionnel
        $professionnel = $this->professionnelRepository->findOneBy([
            'utilisateur' => $utilisateur,
        ]);

        if (!$professionnel) {
            return new JsonResponse(
                ['message' => 'Accès refusé : vous n\'êtes pas un professionnel.'],
                Response::HTTP_FORBIDDEN
            );
        }

        // Génère et retourne le token JWT
        $jwt = $this->jwtManager->create($utilisateur);

        return new JsonResponse(['token' => $jwt]);
    }
}