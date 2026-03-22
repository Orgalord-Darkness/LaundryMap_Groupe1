<?php

namespace App\Controller;

use App\Entity\Adresse;
use App\Entity\Professionnel;
use App\Entity\Utilisateur;
use App\Enum\StatutEnum;
use App\Service\SireneService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/professionnel')]
class ProfessionnelController extends AbstractController
{
    #[Route('/inscription', name: 'pro_inscription', methods: ['POST'])]
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