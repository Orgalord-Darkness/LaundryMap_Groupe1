<?php

namespace App\Entity;

use App\Repository\LienRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Enum\MediaEnum; 

#[ORM\Entity(repositoryClass: LienRepository::class)]
class Lien
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $url = null;

    #[ORM\Column(length: 255)]
    private ?string $texte_alternatif = null;

    #[ORM\Column(enumType: MediaEnum::class)]
    private ?MediaEnum $social_media = null;

    #[ORM\Column]
    private ?bool $is_public = null;

    #[ORM\ManyToOne(inversedBy: 'liens')]
    private ?Laverie $laverie = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): static
    {
        $this->id = $id;

        return $this;
    }

    public function getUrl(): ?string
    {
        return $this->url;
    }

    public function setUrl(string $url): static
    {
        $this->url = $url;

        return $this;
    }

    public function getTexteAlternatif(): ?string
    {
        return $this->texte_alternatif;
    }

    public function setTexteAlternatif(string $texte_alternatif): static
    {
        $this->texte_alternatif = $texte_alternatif;

        return $this;
    }

    public function getSocialMedia(): ?MediaEnum
    {
        return $this->social_media;
    }

    public function setSocialMedia(MediaEnum $social_media): static
    {
        $this->social_media = $social_media;

        return $this;
    }

    public function isPublic(): ?bool
    {
        return $this->is_public;
    }

    public function setIsPublic(bool $is_public): static
    {
        $this->is_public = $is_public;

        return $this;
    }

    public function getLaverieId(): ?Laverie
    {
        return $this->laverie;
    }

    public function setLaverieId(?Laverie $laverie): static
    {
        $this->laverie = $laverie;

        return $this;
    }

}
