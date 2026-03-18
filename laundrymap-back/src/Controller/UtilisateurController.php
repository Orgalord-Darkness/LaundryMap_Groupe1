<?php

namespace App\Controller;

use Google\Client as GoogleClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Response;
use App\Repository\UtilisateurRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\SerializerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Encoder\JWTDecoderInterface;
use App\Entity\Utilisateur;
use App\Enum\StatutEnum;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use Symfony\Component\Serializer\Annotation\Groups;

#[Route('/api/v1/utilisateur')]
final class UtilisateurController extends AbstractController
{
    
    /**
     * Route de connexion
     */
    #[Route('/login_check', name: 'api_login_check_doc', methods: ['POST'])]
    #[OA\Tag(name: 'Utilisateur')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['email', 'mot_de_passe'],
            properties: [
                new OA\Property(property: 'email', type: 'string', example: 'jean.dupont@email.com'),
                new OA\Property(property: 'mot_de_passe', type: 'string', example: 'MonMotDePasse123!')
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
    public function login_check_doc(
        Request $request,
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlGeneratorInterface $urlGenerator,
        UserPasswordHasherInterface $passwordHasher,
        UtilisateurRepository $utilisateurRepository,
        TagAwareCacheInterface $cachePool,
        JWTTokenManagerInterface $jwtManager

    ): Response
    {
        $isGood = true; 
        $messages = [];
        $donnees = json_decode($request->getContent(), true);
        
        if (empty($donnees['email']) || empty($donnees['mot_de_passe'])) {
            $messages['email'] = "Le champ 'email' est requis.";
            $messages['mot_de_passe'] = "Le champ 'mot de passe' est requis.";
            $isGood = false;
            return $this->json(
                $messages,
                Response::HTTP_BAD_REQUEST
            );
        }

        $email = $donnees['email'];
        $motDePasse = $donnees['mot_de_passe'];

        if ($utilisateurRepository->emailExiste($email) === false) {
            $messages['email'] = "Identifiants invalides.";
            $isGood = false;
        }       

        $utilisateur = $utilisateurRepository->findActifByEmail($email); 
        if($utilisateur === null) {
            $messages['email'] = "Identifiants invalides."; 
            $isGood = false;
        }
        $motDePasseValide = $utilisateur->getMotDePasse(); 
        
        if(!password_verify($motDePasse, $motDePasseValide)) {
            $messages['mot_de_passe'] = "Identifiants invalides.";
            $isGood = false;
        }

        $utilisateurRepository->updateDateDerniereConnexion($utilisateur);

        if (!$isGood) {
            return $this->json(
                $messages,
                Response::HTTP_BAD_REQUEST
            );
        }

        try {
            $token = $jwtManager->create($utilisateur);
            return $this->json([
                'message' => 'Connexion réussie',
                'token_data' => $token,
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 401);
        }

    }

    /**
     * Route d'inscription
     */
    #[Route('/inscription', name: 'app_inscription', methods: ['POST'])]
    #[OA\Tag(name: 'Utilisateur')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['email', 'mot_de_passe', 'nom', 'prenom'],
            properties: [
                new OA\Property(property: 'email', type: 'string', example: 'jean.dupont@email.com'),
                new OA\Property(property: 'mot_de_passe', type: 'string', example: 'MonMotDePasse123!'),
                new OA\Property(property: 'confirmation_mot_de_passe', type: 'string', example: 'MonMotDePasse123!'),
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
        if(!is_array($donnees)) {
            return $this->json(
                ['message' => 'Données invalides'],
                Response::HTTP_BAD_REQUEST
            );
        }
        $messages = [];
        $isGood = true; 
        $champs = ['email', 'mot_de_passe', 'confirmation_mot_de_passe', 'nom', 'prenom'];
        foreach ($champs as $champ) {
            if (empty($donnees[$champ])) {
                $isGood = false;
                $messages[$champ] = "Le champ '$champ' est requis.";
            }
        }

        $email = $donnees['email'];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $messages['email']  = ($messages['email'] ?? '') . "Le format d'email est invalide.";
            $isGood = false;
        }
        if ($utilisateurRepository->emailExiste($donnees['email'])) {
            $messages['email'] = ($messages['email'] ?? '') . "L'email est déjà utilisé.";
            $isGood = false;
        }

        $nom = htmlspecialchars($donnees['nom']);
        $prenom = htmlspecialchars($donnees['prenom']);
        $motDePasse = $donnees['mot_de_passe'];
        $confirmationMotDePasse = $donnees['confirmation_mot_de_passe'];

        if ($motDePasse !== $confirmationMotDePasse) {
            $messages['confirmation_mot_de_passe'] = "La confirmation du mot de passe ne correspond pas.";
            $isGood = false;
        }
        $verifMaj = preg_match('/[A-Z]/', $motDePasse);
        $verifMin = preg_match('/[a-z]/', $motDePasse);
        $verifSpec = preg_match('/[^a-zA-Z0-9]/', $motDePasse);

        if (strlen($motDePasse) < 8) {
            $messages['mot_de_passe'] = ($messages['mot_de_passe'] ?? '') . "Le mot de passe doit contenir au moins 8 caractères.\n";
            $isGood = false;
        }
        if (!$verifMaj) {
            $messages['mot_de_passe'] = ($messages['mot_de_passe'] ?? '') . "Le mot de passe doit contenir au moins 1 majuscule.\n";
            $isGood = false;
        }
        if (!$verifMin) {
            $messages['mot_de_passe'] = ($messages['mot_de_passe'] ?? '') . "Le mot de passe doit contenir au moins 1 minuscule.\n";
            $isGood = false;
        }
        if (!$verifSpec) {
            $messages['mot_de_passe'] = ($messages['mot_de_passe'] ?? '') . "Le mot de passe doit contenir au moins 1 caractère spécial.\n";
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
        

        if (!$isGood) {
            return $this->json(
                $messages,
                Response::HTTP_BAD_REQUEST
            );
        }

        $utilisateurRepository->inscription($utilisateur);

        $cachePool->invalidateTags(['utilisateurCache']);
        $location = $urlGenerator->generate('app_inscription', [], UrlGeneratorInterface::ABSOLUTE_URL);

        return $this->json(['message' => 'Inscription réussie', 'id' => $utilisateur->getId()], Response::HTTP_CREATED, ['Location' => $location]);
        
    }

    /**
     * Route d'inscription via Google SSO
     */
    #[Route('/inscription/google', name: 'app_inscription_google', methods: ['POST'])]
    #[OA\Tag(name: 'Utilisateur')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['token'],
            properties: [
                new OA\Property(property: 'token', type: 'string', example: 'eyJhbGciOiJSUzI1NiIs...')
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Utilisateur créé via Google SSO',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'jwt', type: 'string'),
                new OA\Property(property: 'email', type: 'string'),
                new OA\Property(property: 'nom', type: 'string'),
                new OA\Property(property: 'prenom', type: 'string'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Token Google invalide')]
    public function inscriptionGoogle(
        Request $request,
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlGeneratorInterface $urlGenerator,
        UserPasswordHasherInterface $passwordHasher,
        UtilisateurRepository $utilisateurRepository,
        TagAwareCacheInterface $cachePool,
        JWTTokenManagerInterface $jwtManager, 
    ): JsonResponse {
        $code = json_decode($request->getContent(), true)['token'];

        $client = new GoogleClient(['client_id' => $_ENV['GOOGLE_CLIENT_ID']]);
        $client->setClientSecret($_ENV['GOOGLE_CLIENT_SECRET']);
        $client->setRedirectUri('postmessage'); // ← obligatoire avec auth-code + popup
        
        $tokenData = $client->fetchAccessTokenWithAuthCode($code);
        
        if (isset($tokenData['error'])) {
            return $this->json(['message' => 'Code Google invalide'], Response::HTTP_BAD_REQUEST);
        }

        $payload = $client->verifyIdToken($tokenData['id_token']);

        if (!$payload) {
            return $this->json(['message' => 'Token Google invalide'], Response::HTTP_BAD_REQUEST);
        }

        $email = $payload['email']; 
        $googleId = $payload['sub'];
        $nom = $payload['family_name']; 
        $prenom = $payload['given_name'];

        $utilisateur = $utilisateurRepository->findOneByEmail($email);
        if (!$utilisateur) {
            $utilisateur = new Utilisateur();
            $utilisateur->setEmail($email);
            $utilisateur->setNom($nom);
            $utilisateur->setPrenom($prenom);
            $motDePasseAleatoire = bin2hex(random_bytes(32)); // On génère un mot de passe aléatoire pour les utilisateurs Google SSO et pour la sécurité
            $motDePasseHashe = $passwordHasher->hashPassword($utilisateur, $motDePasseAleatoire);
            $utilisateur->setMotDePasse($motDePasseHashe);
            $utilisateur->setOauthId($googleId);
            $utilisateur->setStatut(StatutEnum::VALIDE);    
            $utilisateur->setDateCreation(new \DateTime());
            $utilisateur->setDateModification(new \DateTime());
            $utilisateurRepository->inscription($utilisateur);
            $cachePool->invalidateTags(['utilisateurCache']);
            $location = $urlGenerator->generate('app_inscription', [], UrlGeneratorInterface::ABSOLUTE_URL);
            return $this->json(['message' => 'Inscription Google réussie', 'id' => $utilisateur->getId()], Response::HTTP_CREATED, ['Location' => $location]);
        }

        $jwt = $jwtManager->create($utilisateur);
        $tokenData = $client->fetchAccessTokenWithAuthCode($code);

        return $this->json(['message' => 'Connexion Google réussie', 'token' => $jwt], Response::HTTP_OK);
    }

    /**
    * Route mes informations 
    */
    #[Route('/mes_informations', name: 'app_informations', methods: ['GET'])]
    #[OA\Tag(name: 'Utilisateur')]
    #[OA\Security(name: 'Bearer')] 
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
    public function informations(
        UtilisateurRepository $utilisateurRepository,
    ): JsonResponse {
        $utilisateurActuel = $this->getUser();
        $utilisateur = $utilisateurRepository->findOneBy(['email' => $utilisateurActuel->getUserIdentifier()]);

        if( $utilisateur === null) {
            return $this->json(['message' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }   

        return $this->json([
            'id' => $utilisateur?->getId(),
            'email' => $utilisateur?->getEmail(),
            'nom' => $utilisateur?->getNom(),
            'prenom' => $utilisateur?->getPrenom(), 
        ]);
    }

    /*
    * Route de modification des informations personnelles 
    */
    #[Route('/modification', name: 'app_modification', methods: ['POST'])]
    #[OA\Tag(name: 'Utilisateur')]
    #[OA\Security(name: 'Bearer')] 
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['email', 'mot_de_passe', 'nom', 'prenom'],
            properties: [
                new OA\Property(property: 'mot_de_passe', type: 'string', example: 'MonMotDePasse123!'),
                new OA\Property(property: 'confirmation_mot_de_passe', type: 'string', example: 'MonMotDePasse123!'),
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
                new OA\Property(property: 'nom', type: 'string', example: 'Dupont'),
                new OA\Property(property: 'prenom', type: 'string', example: 'Jean'),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Données invalides')]
    public function modification(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        UrlGeneratorInterface $urlGenerator,
        TagAwareCacheInterface $cachePool,
        UtilisateurRepository $utilisateurRepository,
    ): JsonResponse {

        $utilisateur = $this->getUser();

        if (!$utilisateur) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $donnees = json_decode($request->getContent(), true);

        if (!is_array($donnees)) {
            return $this->json(['message' => 'Corps de la requête invalide ou vide'], Response::HTTP_BAD_REQUEST);
        }

        $messages = [];
        $isGood = true;

        $nom = htmlspecialchars($donnees['nom'] ?? $utilisateur->getNom());
        $prenom = htmlspecialchars($donnees['prenom'] ?? $utilisateur->getPrenom());
        $motDePasse = $donnees['mot_de_passe'];
        $confirmationMotDePasse = $donnees['confirmation_mot_de_passe'];

        if(password_verify($motDePasse, $utilisateur->getMotDePasse()) === true && $nom === $utilisateur->getNom() && $prenom === $utilisateur->getPrenom()) {
            return $this->json(['message' => 'Aucune modification détectée'], Response::HTTP_BAD_REQUEST);
        }

        if(!empty($confirmationMotDePasse)) {
            
            if ($motDePasse !== $confirmationMotDePasse) {
                $messages['confirmation_mot_de_passe'] = "La confirmation du mot de passe ne correspond pas.";
                $isGood = false;
            }

            if (strlen($motDePasse) < 8) {
                $messages['mot_de_passe'][] = "Le mot de passe doit contenir au moins 8 caractères.";
                $isGood = false;
            }
            if (!preg_match('/[A-Z]/', $motDePasse)) {
                $messages['mot_de_passe'][] = "Le mot de passe doit contenir au moins 1 majuscule.";
                $isGood = false;
            }
            if (!preg_match('/[a-z]/', $motDePasse)) {
                $messages['mot_de_passe'][] = "Le mot de passe doit contenir au moins 1 minuscule.";
                $isGood = false;
            }
            if (!preg_match('/[^a-zA-Z0-9]/', $motDePasse)) {
                $messages['mot_de_passe'][] = "Le mot de passe doit contenir au moins 1 caractère spécial.";
                $isGood = false;
            }    
        }   
        

        if (!$isGood) {
            return $this->json([
                'message' => 'Validation échouée',
                'erreurs' => $messages
            ], Response::HTTP_BAD_REQUEST);
        }

        $utilisateur->setNom($nom);
        $utilisateur->setPrenom($prenom);
        $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $motDePasse));


        $utilisateurRepository->modification($utilisateur);

        $cachePool->invalidateTags(['utilisateurCache']);

        return $this->json([
            'message' => 'Informations mises à jour avec succès',
            'utilisateur' => [
                'id' => $utilisateur->getId(),
                'email' => $utilisateur->getEmail(),
                'nom' => $utilisateur->getNom(),
                'prenom' => $utilisateur->getPrenom(),
            ]
        ], Response::HTTP_OK);
    }
}
