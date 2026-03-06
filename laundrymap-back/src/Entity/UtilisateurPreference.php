<?php

namespace App\Entity;

use App\Enum\ThemeEnum;
use App\Repository\UtilisateurPreferenceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UtilisateurPreferenceRepository::class)]
class UtilisateurPreference
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(enumType: ThemeEnum::class)]
    private ?ThemeEnum $theme = null;

    #[ORM\Column]
    private ?bool $notifications = null;

    #[ORM\ManyToOne(targetEntity: Langue::class)]
    #[ORM\JoinColumn(name: 'langue_id', referencedColumnName: 'id', nullable: false)]
    private ?Langue $langue_id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Utilisateur $utilisateur = null;

    public function __construct()
    {
        $this->utilisateur_id = new ArrayCollection();
        $this->langue_id = new ArrayCollection();
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

    public function getTheme(): ?ThemeEnum
    {
        return $this->theme;
    }

    public function setTheme(ThemeEnum $theme): static
    {
        $this->theme = $theme;

        return $this;
    }

    public function isNotifications(): ?bool
    {
        return $this->notifications;
    }

    public function setNotifications(bool $notifications): static
    {
        $this->notifications = $notifications;

        return $this;
    }

    public function getLangueId(): ?Langue
    {
        return $this->langue_id;
    }

    public function setLangueId(?Langue $langue_id): static
    {
        $this->langue_id = $langue_id;

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

}
