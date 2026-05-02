<?php

namespace App\Entity;

use App\Enum\RoleEnum;
use App\Enum\StatutEnum;
use App\Repository\ProfessionnelRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProfessionnelRepository::class)]
class Professionnel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $siren = null;

    #[ORM\Column(enumType: StatutEnum::class)]
    private ?StatutEnum $statut = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $date_validation = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Adresse $adresse = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getSiren(): ?int
    {
        return $this->siren;
    }

    public function setSiren(int $siren): static
    {
        $this->siren = $siren;

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

    public function getDateValidation(): ?\DateTime
    {
        return $this->date_validation;
    }

    public function setDateValidation(?\DateTime $date_validation): static
    {
        $this->date_validation = $date_validation;

        return $this;
    }

    public function getUtilisateurId(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateurId(?Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;

        return $this;
    }

    public function getAdresseId(): ?Adresse
    {
        return $this->adresse;
    }

    public function setAdresseId(?Adresse $adresse): static
    {
        $this->adresse = $adresse;

        return $this;
    }

    public static function getRole(): array {
       return [RoleEnum::PRO->value];
    }
}
