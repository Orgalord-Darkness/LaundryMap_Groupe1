<?php

namespace App\Controller;

use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use OpenApi\Attributes as OA;

#[Route('/api/v1/auth')]
final class AuthController extends AbstractController
{
    #[Route('/me', name: 'api_auth_me', methods: ['GET'])]
    #[OA\Tag(name: 'Auth')]
    #[OA\Response(
        response: 200,
        description: 'Informations de la session courante',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'email', type: 'string'),
                new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string')),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Non authentifié')]
    public function me(Request $request, JWTTokenManagerInterface $jwtManager): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }
        $token = $request->cookies->get('BEARER');
        try {
            $payload = $jwtManager->parse($token);
            $roles = $payload['roles'] ?? $user->getRoles();
        } catch (\Throwable) {
            $roles = $user->getRoles();
        }
        return new JsonResponse([
            'email' => $user->getUserIdentifier(),
            'roles' => $roles,
        ]);
    }

    #[Route('/logout', name: 'api_auth_logout', methods: ['POST'])]
    #[OA\Tag(name: 'Auth')]
    #[OA\Response(response: 200, description: 'Déconnexion réussie')]
    public function logout(): JsonResponse
    {
        $cookie = Cookie::create('BEARER')
            ->withValue('')
            ->withExpires(1)
            ->withPath('/')
            ->withDomain(null)
            ->withSecure(false)
            ->withHttpOnly(true)
            ->withSameSite('strict');
        $response = new JsonResponse(['message' => 'Déconnexion réussie']);
        $response->headers->setCookie($cookie);
        return $response;
    }
}
