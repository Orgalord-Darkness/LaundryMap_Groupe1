<?php

namespace App\Entity;

use App\Enum\RoleEnum;
use App\Enum\StatutEnum;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\UtilisateurRepository;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Serializer\Annotation\Groups;  

#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
class Utilisateur implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['getUtilisateur'])] 
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getUtilisateur'])] 
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getUtilisateur', 'editUtilisateur', 'createUtilisateur'])]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getUtilisateur', 'editUtilisateur', 'createUtilisateur'])]
    private ?string $prenom = null;

    #[ORM\Column(length: 255)]
    #[Groups(['getUtilisateur', 'editUtilisateur', 'createUtilisateur'])]
    private ?string $mot_de_passe = null;

    #[ORM\Column(enumType: StatutEnum::class)]
    private ?StatutEnum $statut = null;

    #[ORM\Column]
    private ?\DateTime $date_creation = null;

    #[ORM\Column]
    private ?\DateTime $date_modification = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $oauth_id = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $date_derniere_connexion = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;

        return $this;
    }

    public function getMotDePasse(): ?string
    {
        return $this->mot_de_passe;
    }

    public function setMotDePasse(string $mot_de_passe): static
    {
        $this->mot_de_passe = $mot_de_passe;

        return $this;
    }

    public function getStatut(): ?StatutEnum
    {
        return $this->statut;
    }

    public function setStatut(StatutEnum $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getDateCreation(): ?\DateTime
    {
        return $this->date_creation;
    }

    public function setDateCreation(\DateTime $date_creation): static
    {
        $this->date_creation = $date_creation;

        return $this;
    }

    public function getDateModification(): ?\DateTime
    {
        return $this->date_modification;
    }

    public function setDateModification(\DateTime $date_modification): static
    {
        $this->date_modification = $date_modification;

        return $this;
    }

    public function getOauthId(): ?string
    {
        return $this->oauth_id;
    }

    public function setOauthId(?string $oauth_id): static
    {
        $this->oauth_id = $oauth_id;

        return $this;
    }

    public function getDateDerniereConnexion(): ?\DateTime
    {
        return $this->date_derniere_connexion;
    }

    public function setDateDerniereConnexion(?\DateTime $date_derniere_connexion): static
    {
        $this->date_derniere_connexion = $date_derniere_connexion;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    public function getPassword(): string
    {
        return $this->mot_de_passe;
    }

    public function eraseCredentials(): void
    {
        // rien à faire pour l'instant
    }

    public function getRole(): array
    {
        return [RoleEnum::USER->value];
    }
}
