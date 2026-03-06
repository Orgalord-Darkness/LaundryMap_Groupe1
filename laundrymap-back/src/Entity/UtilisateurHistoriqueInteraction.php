<?php

namespace App\Entity;

use App\Enum\StatutEnum;
use App\Repository\UtilisateurHistoriqueInteractionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UtilisateurHistoriqueInteractionRepository::class)]
class UtilisateurHistoriqueInteraction
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Administrateur $administrateur = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\Column(enumType: StatutEnum::class)]
    private ?StatutEnum $action = null;

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

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(?Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;

        return $this;
    }

    public function getAction(): ?StatutEnum
    {
        return $this->action;
    }

    public function setAction(StatutEnum $action): static
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
