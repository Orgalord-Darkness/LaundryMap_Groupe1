<?php

namespace App\Entity;

use App\Repository\LaverieFermetureExceptionnelleRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Laverie;

#[ORM\Entity(repositoryClass: LaverieFermetureExceptionnelleRepository::class)]
class LaverieFermetureExceptionnelle
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

    #[ORM\Column]
    private ?\DateTime $date_debut = null;

    #[ORM\Column]
    private ?\DateTime $date_fin = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $raison = null;

    #[ORM\Column]
    private ?\DateTime $date_ajout = null;

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

    public function getDateDebut(): ?\DateTime
    {
        return $this->date_debut;
    }

    public function setDateDebut(\DateTime $date_debut): static
    {
        $this->date_debut = $date_debut;

        return $this;
    }

    public function getDateFin(): ?\DateTime
    {
        return $this->date_fin;
    }

    public function setDateFin(\DateTime $date_fin): static
    {
        $this->date_fin = $date_fin;

        return $this;
    }

    public function getRaison(): ?string
    {
        return $this->raison;
    }

    public function setRaison(?string $raison): static
    {
        $this->raison = $raison;

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
}
