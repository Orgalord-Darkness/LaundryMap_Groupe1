<?php

namespace App\Entity;

use App\Enum\EquipementEnum;
use App\Repository\LaverieEquipementRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Laverie;

#[ORM\Entity(repositoryClass: LaverieEquipementRepository::class)]
class LaverieEquipement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // #[ORM\Column]
    // private ?int $laverie_id = null;
    #[ORM\ManyToOne(targetEntity: Laverie::class)]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false, onDelete:'CASCADE')]
    private ?Laverie $laverie = null;

    #[ORM\Column(nullable: true)]
    private ?int $equipement_reference = null;

    #[ORM\Column(length: 255)]
    private ?string $nom = null;

    #[ORM\Column(enumType: EquipementEnum::class)]
    private ?EquipementEnum $type = null;

    #[ORM\Column(nullable: true)]
    private ?int $capacite = null;

    #[ORM\Column(nullable: true)]
    private ?float $tarif = null;

    #[ORM\Column(nullable: true)]
    private ?int $duree = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    // public function getLaverieId(): ?int
    // {
    //     return $this->laverie_id;
    // }

    // public function setLaverieId(int $laverie_id): static
    // {
    //     $this->laverie_id = $laverie_id;

    //     return $this;
    // }
    public function getLaverie(): ?Laverie
    {
        return $this->laverie;
    }

    public function setLaverie(Laverie $laverie): static
    {
        $this->laverie = $laverie;
        return $this;
    }

    public function getEquipementReference(): ?int
    {
        return $this->equipement_reference;
    }

    public function setEquipementReference(?int $equipement_reference): static
    {
        $this->equipement_reference = $equipement_reference;

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

    public function getType(): ?EquipementEnum
    {
        return $this->type;
    }

    public function setType(EquipementEnum $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getCapacite(): ?int
    {
        return $this->capacite;
    }

    public function setCapacite(?int $capacite): static
    {
        $this->capacite = $capacite;

        return $this;
    }

    public function getTarif(): ?float
    {
        return $this->tarif;
    }

    public function setTarif(?float $tarif): static
    {
        $this->tarif = $tarif;

        return $this;
    }

    public function getDuree(): ?int
    {
        return $this->duree;
    }

    public function setDuree(?int $duree): static
    {
        $this->duree = $duree;

        return $this;
    }
}
