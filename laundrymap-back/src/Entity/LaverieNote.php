<?php

namespace App\Entity;

use App\Repository\LaverieNoteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Laverie;

#[ORM\Entity(repositoryClass: LaverieNoteRepository::class)]
class LaverieNote
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

    // #[ORM\Column]
    // private ?int $utilisateur_id = null;
    #[ORM\ManyToOne(targetEntity: Utilisateur::class)]
    #[ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id', nullable: false)]
    private ?Utilisateur $utilisateur = null;

    #[ORM\Column(type: Types::SMALLINT)]
    private ?int $note = null;

    #[ORM\Column]
    private ?\DateTime $note_le = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $commentaire = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $commentaire_le = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $reponse = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $repond_le = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $commentaire_supprime_motif = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $commentaire_supprime_le = null;

    public function __construct()
    {
        $this->signalements = new ArrayCollection();
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

    // public function getUtilisateurId(): ?int
    // {
    //     return $this->utilisateur_id;
    // }

    // public function setUtilisateurId(int $utilisateur_id): static
    // {
    //     $this->utilisateur_id = $utilisateur_id;

    //     return $this;
    // }
    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function setUtilisateur(Utilisateur $utilisateur): static
    {
        $this->utilisateur = $utilisateur;
        return $this;
    }

    public function getNote(): ?int
    {
        return $this->note;
    }

    public function setNote(int $note): static
    {
        $this->note = $note;

        return $this;
    }

    public function getNoteLe(): ?\DateTime
    {
        return $this->note_le;
    }

    public function setNoteLe(\DateTime $note_le): static
    {
        $this->note_le = $note_le;

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

    public function getCommentaireLe(): ?\DateTime
    {
        return $this->commentaire_le;
    }

    public function setCommentaireLe(?\DateTime $commentaire_le): static
    {
        $this->commentaire_le = $commentaire_le;

        return $this;
    }

    public function getReponse(): ?string
    {
        return $this->reponse;
    }

    public function setReponse(?string $reponse): static
    {
        $this->reponse = $reponse;

        return $this;
    }

    public function getRepondLe(): ?\DateTime
    {
        return $this->repond_le;
    }

    public function setRepondLe(?\DateTime $repond_le): static
    {
        $this->repond_le = $repond_le;

        return $this;
    }

    public function getCommentaireSupprimeMotif(): ?string
    {
        return $this->commentaire_supprime_motif;
    }

    public function setCommentaireSupprimeMotif(?string $commentaire_supprime_motif): static
    {
        $this->commentaire_supprime_motif = $commentaire_supprime_motif;

        return $this;
    }

    public function getCommentaireSupprimeLe(): ?\DateTime
    {
        return $this->commentaire_supprime_le;
    }

    public function setCommentaireSupprimeLe(?\DateTime $commentaire_supprime_le): static
    {
        $this->commentaire_supprime_le = $commentaire_supprime_le;

        return $this;
    }

}
