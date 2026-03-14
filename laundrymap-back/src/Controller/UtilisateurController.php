<?php

namespace App\Controller;

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

        try {
            $token = $jwtManager->create($utilisateur);

            return $this->json(
                [
                    'message' => 'Connexion réussie',
                    'token_data' => $token,
                ],
                Response::HTTP_OK
            );

        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], 401);
        }

        if (!$isGood) {
            return $this->json(
                $messages,
                Response::HTTP_BAD_REQUEST
            );
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

    #[Route('/mes_informations', name: 'app_informations', methods: ['GET'])]
    #[OA\Tag(name: 'Utilisateur')]
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
        Request $request,
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlGeneratorInterface $urlGenerator,
        UserPasswordHasherInterface $passwordHasher,
        UtilisateurRepository $utilisateurRepository,
        TagAwareCacheInterface $cachePool,
    ): JsonResponse {
        $utilisateur = $this->getUser();

        if (!$utilisateur) {
            return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json($utilisateur, Response::HTTP_OK, [], [AbstractObjectNormalizer::GROUPS => ['informations']]);
    }

    /**
     * Route de modification d'infos 
     */
    #[Route('/modification', name: 'app_modification', methods: ['POST'])]
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
    public function modification(
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

        $utilisateurRepository->modification($utilisateur);

        $cachePool->invalidateTags(['utilisateurCache']);
        $location = $urlGenerator->generate('app_informations', [], UrlGeneratorInterface::ABSOLUTE_URL);

        return $this->json(['message' => 'Informations mises à jour', 'id' => $utilisateur->getId()], Response::HTTP_OK, ['Location' => $location]);
        
    }
}
