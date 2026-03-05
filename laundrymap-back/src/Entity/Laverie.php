<?php

namespace App\Entity;

use App\Enum\LaverieStatutEnum;
use App\Repository\LaverieRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieRepository::class)]
class Laverie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $professionnel_id = null;

    #[ORM\Column(enumType: LaverieStatutEnum::class)]
    private ?LaverieStatutEnum $statut = null;

    #[ORM\Column(nullable: true)]
    private ?int $wi_line_reference = null;

    #[ORM\Column]
    private ?int $adresse_id = null;

    #[ORM\Column]
    private ?int $logo_id = null;

    #[ORM\Column(length: 255)]
    private ?string $nom_etablissement = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $contact_email = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private ?\DateTime $date_ajout = null;

    #[ORM\Column]
    private ?\DateTime $date_modification = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $supprime_le = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getProfessionnelId(): ?int
    {
        return $this->professionnel_id;
    }

    public function setProfessionnelId(int $professionnel_id): static
    {
        $this->professionnel_id = $professionnel_id;

        return $this;
    }

    public function getStatut(): ?LaverieStatutEnum
    {
        return $this->statut;
    }

    public function setStatut(LaverieStatutEnum $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getWiLineReference(): ?int
    {
        return $this->wi_line_reference;
    }

    public function setWiLineReference(?int $wi_line_reference): static
    {
        $this->wi_line_reference = $wi_line_reference;

        return $this;
    }

    public function getAdresseId(): ?int
    {
        return $this->adresse_id;
    }

    public function setAdresseId(int $adresse_id): static
    {
        $this->adresse_id = $adresse_id;

        return $this;
    }

    public function getLogoId(): ?int
    {
        return $this->logo_id;
    }

    public function setLogoId(int $logo_id): static
    {
        $this->logo_id = $logo_id;

        return $this;
    }

    public function getNomEtablissement(): ?string
    {
        return $this->nom_etablissement;
    }

    public function setNomEtablissement(string $nom_etablissement): static
    {
        $this->nom_etablissement = $nom_etablissement;

        return $this;
    }

    public function getContactEmail(): ?string
    {
        return $this->contact_email;
    }

    public function setContactEmail(?string $contact_email): static
    {
        $this->contact_email = $contact_email;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getDateAjout(): ?\DateTime
    {
        return $this->date_ajout;
    }

    public function setDateAjout(\DateTime $date_ajout): static
    {
        $this->date_ajout = $date_ajout;

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

    public function getSupprimeLe(): ?\DateTime
    {
        return $this->supprime_le;
    }

    public function setSupprimeLe(?\DateTime $supprime_le): static
    {
        $this->supprime_le = $supprime_le;

        return $this;
    }
}
