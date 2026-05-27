<?php

namespace App\Controller;

use App\Repository\AdministrateurRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/admin')]
final class AdminAuthController extends AbstractController
{
    public function __construct(
        #[Autowire('%env(bool:COOKIE_SECURE)%')]
        private readonly bool $cookieSecure,
        #[Autowire('%kernel.environment%')]
        private readonly string $appEnv,
    ) {}

    #[Route('/login_check', name: 'admin_login_check', methods: ['POST'])]
    #[OA\Tag(name: 'Authentification Admin')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['email', 'password'],
            properties: [
                new OA\Property(property: 'email',    type: 'string', example: 'admin@example.com'),
                new OA\Property(property: 'password', type: 'string', example: 'Admin1234.'),
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Connexion réussie — token JWT',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'token', type: 'string', example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...'),
                new OA\Property(property: 'email', type: 'string', example: 'admin@example.com'),
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Identifiants invalides')]
    public function loginCheck(
        Request $request,
        AdministrateurRepository $adminRepository,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $jwtManager,
    ): JsonResponse {
        $body   = json_decode($request->getContent(), true);
        $email  = $body['email']    ?? null;
        $mdp    = $body['password'] ?? null;

        if (!$email || !$mdp) {
            return $this->json(['message' => 'Les champs email et password sont requis'], Response::HTTP_UNAUTHORIZED);
        }

        $admin = $adminRepository->findOneByEmail($email);

        if (!$admin || !$passwordHasher->isPasswordValid($admin, $mdp)) {
            return $this->json(['message' => 'Identifiants invalides'], Response::HTTP_UNAUTHORIZED);
        }

        $token = $jwtManager->create($admin);

        $cookie = Cookie::create('BEARER')
            ->withValue($token)
            ->withExpires(time() + 3600)
            ->withPath('/')
            ->withDomain(null)
            ->withSecure($this->cookieSecure)
            ->withHttpOnly(true)
            ->withSameSite('strict');

        $data = ['email' => $admin->getEmail()];
        if ($this->appEnv === 'dev') {
            $data['token'] = $token;
        }
        $response = $this->json($data, Response::HTTP_OK);

        $response->headers->setCookie($cookie);

        return $response;
    }
}
