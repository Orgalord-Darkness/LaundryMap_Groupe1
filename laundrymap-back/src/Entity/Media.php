<?php

namespace App\Entity;

use App\Repository\MediaRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MediaRepository::class)]
class Media
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $emplacement = null;

    #[ORM\Column(length: 255)]
    private ?string $nom_original = null;

    #[ORM\Column]
    private ?int $poids = null;

    #[ORM\Column(length: 255)]
    private ?string $mime_type = null;

    public function __construct()
    {
        $this->laverieMedia = new ArrayCollection();
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

    public function getEmplacement(): ?string
    {
        return $this->emplacement;
    }

    public function setEmplacement(string $emplacement): static
    {
        $this->emplacement = $emplacement;

        return $this;
    }

    public function getNomOriginal(): ?string
    {
        return $this->nom_original;
    }

    public function setNomOriginal(string $nom_original): static
    {
        $this->nom_original = $nom_original;

        return $this;
    }

    public function getPoids(): ?int
    {
        return $this->poids;
    }

    public function setPoids(int $poids): static
    {
        $this->poids = $poids;

        return $this;
    }

    public function getMimeType(): ?string
    {
        return $this->mime_type;
    }

    public function setMimeType(string $mime_type): static
    {
        $this->mime_type = $mime_type;

        return $this;
    }

    /**
     * @return Collection<int, LaverieMedia>
     */
    public function getLaverieMedia(): Collection
    {
        return $this->laverieMedia;
    }

    public function addLaverieMedium(LaverieMedia $laverieMedium): static
    {
        if (!$this->laverieMedia->contains($laverieMedium)) {
            $this->laverieMedia->add($laverieMedium);
            $laverieMedium->addMediaId($this);
        }

        return $this;
    }

    public function removeLaverieMedium(LaverieMedia $laverieMedium): static
    {
        if ($this->laverieMedia->removeElement($laverieMedium)) {
            $laverieMedium->removeMediaId($this);
        }

        return $this;
    }
}
