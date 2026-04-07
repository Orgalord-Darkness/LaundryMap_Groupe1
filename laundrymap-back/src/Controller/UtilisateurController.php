<?php

namespace App\Controller;

use App\Entity\Utilisateur;
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
use App\Enum\StatutEnum;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Service\EmailVerificationService;

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
        JWTTokenManagerInterface $jwtManager,

    ): Response
    {
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
            return $this->json(
                $messages,
                Response::HTTP_BAD_REQUEST
            );
        }       

        $utilisateur = $utilisateurRepository->findActifByEmail($email); 
        if($utilisateur === null) {
            $messages['email'] = "Identifiants invalides."; 
            return $this->json(
                $messages,
                Response::HTTP_BAD_REQUEST
            );
        }
        $motDePasseValide = $utilisateur->getMotDePasse(); 
        
        if(!password_verify($motDePasse, $motDePasseValide)) {
            $messages['mot_de_passe'] = "Identifiants invalides.";
            return $this->json(
                $messages,
                Response::HTTP_BAD_REQUEST
            );
        }

        if($utilisateur->getRole() === 'en attente') {
            $message['email'] = "Identifiants invalides."; 
            return $this->json(
                $messages,
                Response::HTTP_BAD_REQUEST
            );
        }

        $utilisateurRepository->updateDateDerniereConnexion($utilisateur);

        try {
            $token = $jwtManager->create($utilisateur, ['role' => $utilisateur->getRole()[0]]);
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
        EmailVerificationService $emailVerificationService
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
        if(strlen($nom) > 50) {
            $messages['nom'] = "Le nom ne doit pas dépasser 50 caractères.";
            $isGood = false;
        }
        
        $prenom = htmlspecialchars($donnees['prenom']);
        if(strlen($prenom) > 50) {
            $messages['prenom'] = "Le prénom ne doit pas dépasser 50 caractères.";
            $isGood = false;
        }
        $motDePasse = $donnees['mot_de_passe'];
        if(strlen($motDePasse) > 255) {
            $messages['mot_de_passe'] = "Le mot de passe ne doit pas dépasser 255 caractères.";
            $isGood = false;
        }   
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
        $utilisateur->setMotDePasse($motDePasseHashe);


        $utilisateur->setStatut(StatutEnum::EN_ATTENTE);

        $utilisateur->setDateCreation(new \DateTime());
        $utilisateur->setDateModification(new \DateTime());

        if (!$isGood) {
            return $this->json($messages, Response::HTTP_BAD_REQUEST);
        }

        $utilisateurRepository->inscription($utilisateur);

        $emailVerificationService->sendVerificationEmail($utilisateur);

        return $this->json(
            [
                'message' => 'Inscription réussie. Vérifiez votre e-mail pour activer votre compte.',
                'id' => $utilisateur->getId()
            ],
            Response::HTTP_CREATED
        );

    }

    #[Route('/validation/{token}', name: 'app_valider_email', methods: ['GET'])]
    public function validerEmail(
        string $token,
        JWTTokenManagerInterface $jwtManager,
        UtilisateurRepository $utilisateurRepository,
        TagAwareCacheInterface $cachePool
    ): Response

    {
       try {
            $payload = $jwtManager->parse($token);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Token invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if (($payload['purpose'] ?? null) !== 'email_validation') {
            return $this->json(['message' => 'Token non valide pour la validation email.'], Response::HTTP_BAD_REQUEST);
        }

        if (($payload['exp'] ?? 0) < time()) {
            return $this->json(['message' => 'Token expiré.'], Response::HTTP_BAD_REQUEST);
        }

        $utilisateur = $utilisateurRepository->find($payload['user_id'] ?? 0);

        if (!$utilisateur) {
            return $this->json(['message' => 'Utilisateur introuvable.'], Response::HTTP_BAD_REQUEST);
        }

       $utilisateur->setStatut(StatutEnum::VALIDE);
        $utilisateurRepository->inscription($utilisateur);
        $cachePool->invalidateTags(['utilisateurCache']);

        return $this->render('emails/confirmationAccountEmail.html.twig', [
            'frontend_login_url' => env(CORS_ALLOW_ORIGIN).'/user/login'
        ]);


        $cachePool->invalidateTags(['utilisateurCache']);

        return $this->json(['message' => 'E-mail confirmé avec succès. Vous pouvez maintenant vous connecter.'], Response::HTTP_OK);


    }

    #[Route('/resend-validation', name: 'app_renvoyer_validation', methods: ['POST'])]
    public function renvoyerEmailValidation(
        Request $request,
        UtilisateurRepository $utilisateurRepository,
        TagAwareCacheInterface $cachePool,
        UrlGeneratorInterface $urlGenerator
    ): JsonResponse {
        $donnees = json_decode($request->getContent(), true);
        $email = $donnees['email'] ?? null;

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'Email invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $utilisateur = $utilisateurRepository->findOneByEmail($email);
        if (!$utilisateur || $utilisateur->getStatut() !== StatutEnum::EN_ATTENTE) {
            return $this->json(['message' => 'Aucun compte à valider pour cet email.'], Response::HTTP_BAD_REQUEST);
        }

        $token = bin2hex(random_bytes(32));
        $utilisateur->setVerificationToken($token);
        $utilisateurRepository->inscription($utilisateur);
        $cachePool->invalidateTags(['utilisateurCache']);

        $verificationUrl = $urlGenerator->generate('app_valider_email', ['token' => $token], UrlGeneratorInterface::ABSOLUTE_URL);

        return $this->json(['message' => 'Email de validation renvoyé.', 'verification_url' => $verificationUrl], Response::HTTP_OK);
    }

    #[Route('/mot_de_passe/oublie', name: 'app_motdepasse_oublie', methods: ['POST'])]
    public function motDePasseOublie(
        Request $request,
        UtilisateurRepository $utilisateurRepository,
        TagAwareCacheInterface $cachePool
    ): JsonResponse {
        $donnees = json_decode($request->getContent(), true);
        $email = $donnees['email'] ?? null;

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => 'Email invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $utilisateur = $utilisateurRepository->findOneByEmail($email);
        if (!$utilisateur || $utilisateur->getStatut() !== StatutEnum::VALIDE) {
            return $this->json(['message' => 'Aucun compte actif trouvé pour cet email.'], Response::HTTP_BAD_REQUEST);
        }

        $resetToken = bin2hex(random_bytes(32));
        $utilisateur->setResetToken($resetToken);
        $utilisateurRepository->inscription($utilisateur);
        $cachePool->invalidateTags(['utilisateurCache']);

        return $this->json(['message' => 'Token de réinitialisation de mot de passe généré.', 'reset_token' => $resetToken], Response::HTTP_OK);
    }

    #[Route('/mot_de_passe/reinitialisation', name: 'app_motdepasse_reinitialisation', methods: ['POST'])]
    public function reinitialisationMotDePasse(
        Request $request,
        UtilisateurRepository $utilisateurRepository,
        UserPasswordHasherInterface $passwordHasher,
        TagAwareCacheInterface $cachePool
    ): JsonResponse {
        $donnees = json_decode($request->getContent(), true);
        $resetToken = $donnees['reset_token'] ?? null;
        $motDePasse = $donnees['mot_de_passe'] ?? null;
        $confirmation = $donnees['confirmation_mot_de_passe'] ?? null;

        if (!$resetToken || !$motDePasse || !$confirmation) {
            return $this->json(['message' => 'Données manquantes.'], Response::HTTP_BAD_REQUEST);
        }

        if ($motDePasse !== $confirmation) {
            return $this->json(['message' => 'La confirmation du mot de passe ne correspond pas.'], Response::HTTP_BAD_REQUEST);
        }

        $utilisateur = $utilisateurRepository->findOneByResetToken($resetToken);
        if (!$utilisateur) {
            return $this->json(['message' => 'Token de réinitialisation invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $motDePasse));
        $utilisateur->setResetToken(null);
        $utilisateurRepository->inscription($utilisateur);
        $cachePool->invalidateTags(['utilisateurCache']);

        return $this->json(['message' => 'Mot de passe réinitialisé avec succès.'], Response::HTTP_OK);
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
                new OA\Property(property: 'password', type: 'string'),
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
        $client->setRedirectUri('postmessage');
        
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
        $motDePasse = $code['password']; 

        $utilisateur = $utilisateurRepository->findOneByEmail($email);
        if (!$utilisateur) {
            $utilisateur = new Utilisateur();
            $utilisateur->setEmail($email);
            $utilisateur->setNom($nom);
            $utilisateur->setPrenom($prenom);
            $motDePasseHashe = $passwordHasher->hashPassword($utilisateur, $motDePasse);
            $utilisateur->setMotDePasse($motDePasseHashe);
            $utilisateur->setOauthId($googleId);
            $utilisateur->setStatut(StatutEnum::VALIDE);    
            $utilisateur->setDateCreation(new \DateTime());
            $utilisateur->setDateModification(new \DateTime());
            $utilisateurRepository->inscription($utilisateur); 
        }

        $tokenData = $client->fetchAccessTokenWithAuthCode($code);

        $utilisateurRepository->updateDateDerniereConnexion($utilisateur);

        try {
            $cachePool->invalidateTags(['utilisateurCache']);
            $location = $urlGenerator->generate('app_inscription', [], UrlGeneratorInterface::ABSOLUTE_URL);
            $token = $jwtManager->create($utilisateur, ['role' => $utilisateur->getRole()[0]]);
            return $this->json([
                'message' => 'Connexion réussie',
                'token_data' => $token,
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            return new JsonResponse(['message' => $e->getMessage()], 401);
        }
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
    #[Route('/modification', name: 'app_modification', methods: ['PUT'])]
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
        $motDePasse = $donnees['mot_de_passe'] ?? '';
        $confirmationMotDePasse = $donnees['confirmation_mot_de_passe'] ?? '';

        $changed = false;
        if ($nom !== $utilisateur->getNom() || $prenom !== $utilisateur->getPrenom()) {
            $changed = true;
        }

        if ($motDePasse !== '' || $confirmationMotDePasse !== '') {
            $changed = true;

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

        if (!$changed) {
            return $this->json(['message' => 'Aucune modification détectée'], Response::HTTP_BAD_REQUEST);
        }

        if (!$isGood) {
            
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
        } else {
            if (!empty($motDePasse)) {
                $messages['confirmation_mot_de_passe'] = "La confirmation du mot de passe est requise lorsque le mot de passe est modifié.";
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

        if ($motDePasse !== '') {
            $utilisateur->setMotDePasse($passwordHasher->hashPassword($utilisateur, $motDePasse));
        }

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
