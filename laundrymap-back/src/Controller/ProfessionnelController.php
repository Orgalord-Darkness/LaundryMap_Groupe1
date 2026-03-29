<?php

namespace App\Controller;

use App\Entity\Adresse;
use App\Entity\Professionnel;
use App\Entity\Utilisateur;
use App\Enum\RoleEnum;
use App\Enum\StatutEnum;
use App\Repository\ProfessionnelRepository;      // ← manquait
use App\Repository\UtilisateurRepository;        // ← manquait
use App\Service\SireneService;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;  // ← manquait
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
#[Route('/api/v1/professionnel')]
class ProfessionnelController extends AbstractController
{

    /**
     * Route de connexion pour les professionnels
     */
    #[Route('/login_check', name: 'pro_login', methods: ['POST'])]
    #[OA\Tag(name: 'Professionnel')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['email', 'mot_de_passe'],
            properties: [
                new OA\Property(property: 'email', type: 'string', example: 'lambert@example.net'),
                new OA\Property(property: 'mot_de_passe', type: 'string', example: 'Utilisateur1234.')
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
    #[OA\Response(response: 400, description: 'Identifiants invalides')]
    #[OA\Response(response: 403, description: 'Compte professionnel non valide ou inexistant')]
    public function loginCheckProfessionnelDoc(
        Request $request,
        UtilisateurRepository $utilisateurRepository,
        ProfessionnelRepository $professionnelRepository,
        UserPasswordHasherInterface $passwordHasher,
        JWTTokenManagerInterface $jwtManager,
    ): Response {
        $messages = [];
        $donnees = json_decode($request->getContent(), true);

        if (empty($donnees['email']) || empty($donnees['mot_de_passe'])) {
            if (empty($donnees['email'])) {
                $messages['email'] = "Le champ 'email' est requis.";
            }
            if (empty($donnees['mot_de_passe'])) {
                $messages['mot_de_passe'] = "Le champ 'mot de passe' est requis.";
            }
            return $this->json($messages, Response::HTTP_BAD_REQUEST);
        }

        $email = $donnees['email'];
        $motDePasse = $donnees['mot_de_passe'];
    
        if ($utilisateurRepository->emailExiste($email) === false) {
            return $this->json(
                ['email' => "Identifiants invalides. ".$email ,
                'info' => $email],
                Response::HTTP_BAD_REQUEST
            );
        }

        $utilisateur = $utilisateurRepository->findActifByEmail($email);
        if ($utilisateur === null) {
            return $this->json(
                ['email' => "Identifiants invalides.", 'info' => $email ],
                Response::HTTP_BAD_REQUEST
            );
        }

        if (!password_verify($motDePasse, $utilisateur->getMotDePasse())) {
            return $this->json(
                ['mot_de_passe' => "Identifiants invalides."],
                Response::HTTP_BAD_REQUEST
            );
        }

        $professionnel = $professionnelRepository->findOneBy(['utilisateur' => $utilisateur]);

        if ($professionnel === null) { 
            return $this->json(
                ['professionnel' => "Aucun compte professionnel associé à cet utilisateur."],
                Response::HTTP_FORBIDDEN
            );
        }

        if ($professionnel->getStatut() !== StatutEnum::VALIDE) {
            $messageStatut = match ($professionnel->getStatut()) {
                StatutEnum::EN_ATTENTE => "Votre compte professionnel est en attente de validation.",
                StatutEnum::REFUSE => "Votre compte professionnel a été refusé.",
                default => "Votre compte professionnel n'est pas actif.",
            };
            return $this->json(
                ['professionnel' => $messageStatut],
                Response::HTTP_FORBIDDEN
            );
        }

        $utilisateurRepository->updateDateDerniereConnexion($utilisateur);

        try {
            $token = $jwtManager->create($utilisateur, ['role' => $utilisateur->getRolePro()[0]]);
            return $this->json([
                'message'    => 'Connexion réussie',
                'token_data' => $token,
            ], Response::HTTP_OK);
        } catch (\Throwable $e) {
            return new JsonResponse(['error' => $e->getMessage()], Response::HTTP_UNAUTHORIZED);
        }
    }

    #[Route('/inscription', name: 'pro_inscription', methods: ['POST'])]
    #[OA\Tag(name: 'Professionnel')]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            required: ['lastname', 'firstname', 'email', 'password', 'siren', 'adress', 'rue', 'codePostal', 'city', 'country'],
            properties: [
                new OA\Property(property: 'lastname',    type: 'string',  example: 'Dupont'),
                new OA\Property(property: 'firstname',   type: 'string',  example: 'Jean'),
                new OA\Property(property: 'email',       type: 'string',  example: 'jean.dupont@email.com'),
                new OA\Property(property: 'password',    type: 'string',  example: 'MonMotDePasse123!'),
                new OA\Property(property: 'siren',       type: 'string',  example: '362521879'),
                new OA\Property(property: 'adress',      type: 'string',  example: '12'),
                new OA\Property(property: 'rue',         type: 'string',  example: 'Rue de la Paix'),
                new OA\Property(property: 'codePostal',  type: 'string',  example: '75001'),
                new OA\Property(property: 'city',        type: 'string',  example: 'Paris'),
                new OA\Property(property: 'country',     type: 'string',  example: 'France'),
            ]
        )
    )]
    #[OA\Response(
        response: 201,
        description: 'Inscription réussie, compte en attente de validation',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Inscription réussie. Votre compte est en attente de validation par un administrateur.')
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Champ manquant, email invalide ou SIREN mal formaté')]
    #[OA\Response(response: 409, description: 'Un compte avec cet email existe déjà')]
    #[OA\Response(response: 422, description: 'SIREN invalide ou introuvable auprès de l\'INSEE')]

    public function inscription(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
        SireneService $sireneService
    ): JsonResponse {

        $data = json_decode($request->getContent(), true);

        // ── 1. Champs requis ──────────────────────────────────────────────────
        $required = [
            'lastname', 'firstname', 'email', 'password',
            'siren', 'adress', 'rue', 'codePostal', 'city', 'country', 
        ];

        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->json(
                    ['message' => "Le champ « $field » est requis."],
                    Response::HTTP_BAD_REQUEST
                );
            }
        }

        
        // ── 2. Validation email ───────────────────────────────────────────────
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->json(
                ['message' => 'Adresse email invalide.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // ── 3. Validation mot de passe ────────────────────────────────────────
        if (strlen($data['password']) < 8) {
            return $this->json(
                ['message' => 'Le mot de passe doit contenir au moins 8 caractères.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // ── 4. Validation format SIREN (9 chiffres) ───────────────────────────
        $siren = trim((string) $data['siren']);
        if (!preg_match('/^\d{9}$/', $siren)) {
            return $this->json(
                ['message' => 'Le numéro SIREN doit contenir exactement 9 chiffres.'],
                Response::HTTP_BAD_REQUEST
            );
        }

        // ── 5. Vérification SIREN auprès de l'INSEE ───────────────────────────
        if (!$sireneService->verifySiren($siren)) {
            return $this->json(
                ['message' => 'Numéro SIREN invalide ou introuvable dans la base SIRENE de l\'INSEE. Votre inscription est invalide.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        // ── 6. Email unique ───────────────────────────────────────────────────
        $existingUser = $em->getRepository(Utilisateur::class)
            ->findOneBy(['email' => $data['email']]);

        if ($existingUser) {
            return $this->json(
                ['message' => 'Un compte avec cet email existe déjà.'],
                Response::HTTP_CONFLICT
            );
        }

        // ── 7. Création Utilisateur ───────────────────────────────────────────
        $utilisateur = new Utilisateur();
        $utilisateur->setNom($data['lastname']);
        $utilisateur->setPrenom($data['firstname']);
        $utilisateur->setEmail($data['email']);
        $utilisateur->setStatut(StatutEnum::EN_ATTENTE);
        $utilisateur->setDateCreation(new \DateTime());
        $utilisateur->setDateModification(new \DateTime());
        $utilisateur->setMotDePasse(
            $passwordHasher->hashPassword($utilisateur, $data['password'])
        );

        $em->persist($utilisateur);

        // ── 8. Création Adresse ───────────────────────────────────────────────
        $adresse = new Adresse();
        $adresse->setAdresse($data['adress']);          //  champ adresse (ex: 12)
        $adresse->setRue($data['rue']);                 //  champ rue (ex: rue de la Paix)
        $adresse->setCodePostal((int) $data['codePostal']);
        $adresse->setVille($data['city']);
        $adresse->setPays($data['country']);

        $em->persist($adresse);


        // ── 9. Création Professionnel ─────────────────────────────────────────
        $professionnel = new Professionnel();
        $professionnel->setSiren((int) $siren);
        $professionnel->setStatut(StatutEnum::EN_ATTENTE);
        $professionnel->setUtilisateurId($utilisateur);
        $professionnel->setAdresseId($adresse);

        $em->persist($professionnel);

        // ── 10. Flush ─────────────────────────────────────────────────────────
        $em->flush();

        return $this->json(
            ['message' => 'Inscription réussie. Votre compte est en attente de validation par un administrateur.'],
            Response::HTTP_CREATED
        );
    }
}