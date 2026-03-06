<?php

namespace App\Entity;

use App\Repository\LaverieHistoriqueInteractionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieHistoriqueInteractionRepository::class)]
class LaverieHistoriqueInteraction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Administrateur $administrateur = null;

    #[ORM\ManyToOne(inversedBy: 'laverieHistoriqueInteractions')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Laverie $laverie = null;

    #[ORM\Column(length: 50)]
    private ?string $action = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $motif_action = null;

    #[ORM\Column]
    private ?\DateTime $date = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAdministrateur(): ?Administrateur
    {
        return $this->administrateur;
    }

    public function setAdministrateur(?Administrateur $administrateur): static
    {
        $this->administrateur = $administrateur;

        return $this;
    }

    public function getLaverie(): ?Laverie
    {
        return $this->laverie;
    }

    public function setLaverie(?Laverie $laverie): static
    {
        $this->laverie = $laverie;

        return $this;
    }

    public function getAction(): ?string
    {
        return $this->action;
    }

    public function setAction(string $action): static
    {
        $this->action = $action;

        return $this;
    }

    public function getMotifAction(): ?string
    {
        return $this->motif_action;
    }

    public function setMotifAction(?string $motif_action): static
    {
        $this->motif_action = $motif_action;

        return $this;
    }

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;

        return $this;
    }
}
