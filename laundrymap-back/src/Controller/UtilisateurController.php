<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use App\Repository\UtilisateurRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\SerializerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTDecoderInterface;
use App\Entity\Utilisateur;
use App\Enum\StatutEnum;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Contracts\Cache\TagAwareCacheInterface;

final class UtilisateurController extends AbstractController
{
    
    /**
     * Route de connexion
     */
    #[Route('/api/login_check', name: 'api_login_check_doc', methods: ['POST'])]
    #[OA\Tag(name: 'Auth')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['email', 'password'],
            properties: [
                new OA\Property(property: 'username', type: 'string', example: 'admin'),
                new OA\Property(property: 'password', type: 'string', example: 'adminpass')
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Connexion réussie (JWT token)',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'token', type: 'string', example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...')
            ]
        )
    )]
    #[OA\Response(
        response: 401,
        description: 'Identifiants invalides'
    )]
    public function login_check_doc(): Response
    {
        return new Response(null, Response::HTTP_NO_CONTENT);
    }
 
    /**
     * Route d'inscription
     */
    #[Route('/api/v1/utilisateur/inscription', name: 'app_inscripion', methods: ['POST'])]
    #[OA\Tag(name: 'Auth')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['email', 'mot_de_passe', 'nom', 'prenom'],
            properties: [
                new OA\Property(property: 'email', type: 'string', example: 'jean.dupont@email.com'),
                new OA\Property(property: 'mot_de_passe', type: 'string', example: 'MonMotDePasse123!'),
                new OA\Property(property: 'nom', type: 'string', example: 'Dupont'),
                new OA\Property(property: 'prenom', type: 'string', example: 'Jean'),
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Utilisateur créé avec succès',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'id', type: 'integer', example: 1),
                new OA\Property(property: 'email', type: 'string', example: 'jean.dupont@email.com'),
                new OA\Property(property: 'nom', type: 'string', example: 'Dupont'),
                new OA\Property(property: 'prenom', type: 'string', example: 'Jean'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Données invalides')]
    #[OA\Response(response: 409, description: 'Email déjà utilisé')]
    public function inscription(
        Request $request,
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlGeneratorInterface $urlGenerator,
        UserPasswordHasherInterface $passwordHasher,
        UtilisateurRepository $utilisateurRepository,
        TagAwareCacheInterface $cachePool,
    ): JsonResponse {
        
        $donnees = json_decode($request->getContent(), true);
        $messages = [];
        $isGood = true; 

        foreach (['email', 'mot_de_passe', 'nom', 'prenom'] as $champ) {
            if (empty($donnees[$champ])) {
                $message[$champ] = "Le champ '$champ' est requis.";
            }
            $isGood = false;
        }

        $email = $donnees['email'];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $message['email'] = "Le format d'email est invalide.";
            $isGood = false;
        }
        if ($utilisateurRepository->emailExiste($utilisateur->getEmail())) {
            $message['email'] = "L'email est déjà utiliser.";
            $isGood = false;
        }

        $nom = htmlspecialchars($donnees['nom']);
        $prenom = htmlspecialchars($donnees['prenom']);
        $motDePasse = $donnees['mot_de_passe'];

        $verifMaj = preg_match('/[A-Z]/', $motDePasse);
        $verifMin = preg_match('/[a-z]/', $motDePasse);
        $verifSpec = preg_match('/[^a-zA-Z0-9]/', $motDePasse);

        if (strlen($motDePasse) < 8) {
            $message['mot_de_passe'] = "Le mot de passe doit contenir au moins 8 caractères.";
            $isGood = false;
        }
        if (!$verifMaj) {
            $message['mot_de_passe'] = "Le mot de passe doit contenir au moins 1 majuscule.";
            $isGood = false;
        }
        if (!$verifMin) {
            $message['mot_de_passe'] = "Le mot de passe doit contenir au moins 1 minuscule.";
            $isGood = false;
        }
        if (!$verifSpec) {
            $message['mot_de_passe'] = "Le mot de passe doit contenir au moins 1 caractère spécial.";
            $isGood = false;
        }

        $utilisateur = new Utilisateur();
        $utilisateur->setEmail($email);
        $utilisateur->setNom($nom);
        $utilisateur->setPrenom($prenom);

        $motDePasseHashe = $passwordHasher->hashPassword($utilisateur, $donnees['mot_de_passe']);
        $utilisateur->setMotdePasse($motDePasseHashe);

        $utilisateur->setStatut(StatutEnum::VALIDE);
        $utilisateur->setDateCreation(new \DateTime());
        $utilisateur->setDateModification(new \DateTime());
        
        $utilisateurRepository->inscription($utilisateur);

        $cachePool->invalidateTags(['utilisateurCache']);
        $location = $urlGenerator->generate('app_inscripion', [], UrlGeneratorInterface::ABSOLUTE_URL);

        if (!$isGood) {
            return $this->json(
                $messages,
                Response::HTTP_BAD_REQUEST
            );
        }

        return $this->json(['message' => 'Inscription réussie', 'id' => $utilisateur->getId()], Response::HTTP_CREATED, ['Location' => $location]);
        
    }
}
