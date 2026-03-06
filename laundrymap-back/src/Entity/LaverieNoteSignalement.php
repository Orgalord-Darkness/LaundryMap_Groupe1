<?php

namespace App\Entity;

use App\Enum\MotifEnum;
use App\Repository\LaverieNoteSignalementRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieNoteSignalementRepository::class)]
class LaverieNoteSignalement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?LaverieNote $laverie_note = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\Column]
    private ?\DateTime $date = null;

    #[ORM\Column(enumType: MotifEnum::class)]
    private ?MotifEnum $motif = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $commentaire = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLaverieNote(): ?LaverieNote
    {
        return $this->laverie_note;
    }

    public function setLaverieNote(?LaverieNote $laverie_note): static
    {
        $this->laverie_note = $laverie_note;

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

    public function getDate(): ?\DateTime
    {
        return $this->date;
    }

    public function setDate(\DateTime $date): static
    {
        $this->date = $date;

        return $this;
    }

    public function getMotif(): ?MotifEnum
    {
        return $this->motif;
    }

    public function setMotif(MotifEnum $motif): static
    {
        $this->motif = $motif;

        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(?string $commentaire): static
    {
        $this->commentaire = $commentaire;

        return $this;
    }
}
