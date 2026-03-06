<?php

namespace App\Entity;

use App\Repository\AdministrateurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AdministrateurRepository::class)]
class Administrateur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $mot_de_passe = null;

    public function __construct()
    {
        $this->professionnelHistoriqueInteractions = new ArrayCollection();
        $this->utilisateurHistoriqueInteractions = new ArrayCollection();
        $this->laverieHistoriqueInteractions = new ArrayCollection();
    }

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

    public function getMotDePasse(): ?string
    {
        return $this->mot_de_passe;
    }

    public function setMotDePasse(string $mot_de_passe): static
    {
        $this->mot_de_passe = $mot_de_passe;

        return $this;
    }
    
    /**
     * @return Collection<int, UtilisateurHistoriqueInteraction>
     */
    public function getUtilisateurHistoriqueInteractions(): Collection
    {
        return $this->utilisateurHistoriqueInteractions;
    }

    public function addUtilisateurHistoriqueInteraction(UtilisateurHistoriqueInteraction $utilisateurHistoriqueInteraction): static
    {
        if (!$this->utilisateurHistoriqueInteractions->contains($utilisateurHistoriqueInteraction)) {
            $this->utilisateurHistoriqueInteractions->add($utilisateurHistoriqueInteraction);
            $utilisateurHistoriqueInteraction->addAdministrateurId($this);
        }

        return $this;
    }

    public function removeUtilisateurHistoriqueInteraction(UtilisateurHistoriqueInteraction $utilisateurHistoriqueInteraction): static
    {
        if ($this->utilisateurHistoriqueInteractions->removeElement($utilisateurHistoriqueInteraction)) {
            $utilisateurHistoriqueInteraction->removeAdministrateurId($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, LaverieHistoriqueInteraction>
     */
    public function getLaverieHistoriqueInteractions(): Collection
    {
        return $this->laverieHistoriqueInteractions;
    }

    public function addLaverieHistoriqueInteraction(LaverieHistoriqueInteraction $laverieHistoriqueInteraction): static
    {
        if (!$this->laverieHistoriqueInteractions->contains($laverieHistoriqueInteraction)) {
            $this->laverieHistoriqueInteractions->add($laverieHistoriqueInteraction);
            $laverieHistoriqueInteraction->addAdministrateurId($this);
        }

        return $this;
    }

    public function removeLaverieHistoriqueInteraction(LaverieHistoriqueInteraction $laverieHistoriqueInteraction): static
    {
        if ($this->laverieHistoriqueInteractions->removeElement($laverieHistoriqueInteraction)) {
            $laverieHistoriqueInteraction->removeAdministrateurId($this);
        }

        return $this;
    }
}
