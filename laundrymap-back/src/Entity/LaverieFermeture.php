<?php

namespace App\Entity;

use App\Enum\JourEnum;
use App\Repository\LaverieFermetureRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieFermetureRepository::class)]
class LaverieFermeture
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    // #[ORM\Column]
    // private ?int $laverie_id = null;
    #[ORM\ManyToOne(targetEntity: Laverie::class)]
    #[ORM\JoinColumn(name: 'laverie_id', referencedColumnName: 'id', nullable: false)]
    private ?Laverie $laverie = null;


    #[ORM\Column(enumType: JourEnum::class)]
    private ?JourEnum $jour = null;

    #[ORM\Column]
    private ?\DateTime $date_ajout = null;

    #[ORM\Column]
    private ?\DateTime $date_modification = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTime $heure_debut = null;

    #[ORM\Column(type: Types::TIME_MUTABLE)]
    private ?\DateTime $heure_fin = null;

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

    public function getJour(): ?JourEnum
    {
        return $this->jour;
    }

    public function setJour(JourEnum $jour): static
    {
        $this->jour = $jour;

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

    public function getHeureDebut(): ?\DateTime
    {
        return $this->heure_debut;
    }

    public function setHeureDebut(\DateTime $heure_debut): static
    {
        $this->heure_debut = $heure_debut;

        return $this;
    }

    public function getHeureFin(): ?\DateTime
    {
        return $this->heure_fin;
    }

    public function setHeureFin(\DateTime $heure_fin): static
    {
        $this->heure_fin = $heure_fin;

        return $this;
    }
}
