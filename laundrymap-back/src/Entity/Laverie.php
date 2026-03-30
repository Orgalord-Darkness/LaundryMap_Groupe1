<?php

namespace App\Entity;

use App\Enum\LaverieStatutEnum;
use App\Repository\LaverieRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LaverieRepository::class)]
class Laverie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(enumType: LaverieStatutEnum::class)]
    private ?LaverieStatutEnum $statut = null;

    #[ORM\Column(nullable: true)]
    private ?int $wi_line_reference = null;

    #[ORM\Column(length: 255)]
    private ?string $nom_etablissement = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $contact_email = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private ?\DateTime $date_ajout = null;

    #[ORM\Column]
    private ?\DateTime $date_modification = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $supprime_le = null;

    #[ORM\OneToMany(targetEntity: LaverieHistoriqueInteraction::class, mappedBy: 'laverie')]
    private Collection $laverieHistoriqueInteractions;

    #[ORM\ManyToOne(targetEntity: Media::class)]
    #[ORM\JoinColumn(name: 'logo_id', referencedColumnName: 'id', nullable: true)]
    private ?Media $logo = null;

    #[ORM\ManyToOne(targetEntity: Adresse::class)]
    #[ORM\JoinColumn(name: 'adresse_id', referencedColumnName: 'id', nullable: false)]
    private ?Adresse $adresse = null;

    #[ORM\ManyToOne(targetEntity: Professionnel::class)]
    #[ORM\JoinColumn(name: 'professionnel_id', referencedColumnName: 'id', nullable: false)]
    private ?Professionnel $professionnel = null;

    /**
     * @var Collection<int, Service>
     */
    #[ORM\ManyToMany(targetEntity: Service::class)]
    private Collection $services;

    /**
     * @var Collection<int, MethodePaiement>
     */
    #[ORM\ManyToMany(targetEntity: MethodePaiement::class)]
    #[ORM\JoinTable(name: 'laverie_paiement')]
    private Collection $methodePaiements;

    /**
     * @var Collection<int, Utilisateur>
     */
    #[ORM\ManyToMany(targetEntity: Utilisateur::class)]
    #[ORM\JoinTable(name: 'laverie_favori')]
    private Collection $favoris;


    public function __construct()
    {
        $this->laverieHistoriqueInteractions = new ArrayCollection();
        $this->services = new ArrayCollection();
        $this->favoris = new ArrayCollection();
        $this->methodePaiements = new ArrayCollection();
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


    public function getStatut(): ?LaverieStatutEnum
    {
        return $this->statut;
    }

    public function setStatut(LaverieStatutEnum $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getWiLineReference(): ?int
    {
        return $this->wi_line_reference;
    }

    public function setWiLineReference(?int $wi_line_reference): static
    {
        $this->wi_line_reference = $wi_line_reference;

        return $this;
    }


    public function getNomEtablissement(): ?string
    {
        return $this->nom_etablissement;
    }

    public function setNomEtablissement(string $nom_etablissement): static
    {
        $this->nom_etablissement = $nom_etablissement;

        return $this;
    }

    public function getContactEmail(): ?string
    {
        return $this->contact_email;
    }

    public function setContactEmail(?string $contact_email): static
    {
        $this->contact_email = $contact_email;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

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

    public function getSupprimeLe(): ?\DateTime
    {
        return $this->supprime_le;
    }

    public function setSupprimeLe(?\DateTime $supprime_le): static
    {
        $this->supprime_le = $supprime_le;

        return $this;
    }

    public function getProfessionnel(): ?Professionnel
    {
        return $this->professionnel;
    }

    public function setProfessionnel(?Professionnel $professionnel): static
    {
        $this->professionnel = $professionnel;
        return $this;
    }

    public function getAdresse(): ?Adresse
    {
        return $this->adresse;
    }

    public function setAdresse(?Adresse $adresse): static
    {
        $this->adresse = $adresse;
        return $this;
    }

    /**
     * @return Collection<int, LaverieService>
     */
    public function getLaverieServices(): Collection
    {
        return $this->laverieServices;
    }

    public function addLaverieService(LaverieService $laverieService): static
    {
        if (!$this->laverieServices->contains($laverieService)) {
            $this->laverieServices->add($laverieService);
            $laverieService->addLaverieId($this);
        }

        return $this;
    }

    public function removeLaverieService(LaverieService $laverieService): static
    {
        if ($this->laverieServices->removeElement($laverieService)) {
            $laverieService->removeLaverieId($this);
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

    public function addLaverieHistoriqueInteraction(LaverieHistoriqueInteraction $interaction): static
    {
        if (!$this->laverieHistoriqueInteractions->contains($interaction)) {
            $this->laverieHistoriqueInteractions->add($interaction);
            $interaction->setLaverie($this);
        }
        return $this;
    }

    public function removeLaverieHistoriqueInteraction(LaverieHistoriqueInteraction $interaction): static
    {
        $this->laverieHistoriqueInteractions->removeElement($interaction);
        return $this;
    }

    /**
     * @return Collection<int, Utilisateur>
     */
    public function getFavoris(): Collection
    {
        return $this->favoris;
    }

    public function addFavori(Utilisateur $utilisateur): static
    {
        if (!$this->favoris->contains($utilisateur)) {
            $this->favoris->add($utilisateur);
        }
        return $this;
    }

    public function removeFavori(Utilisateur $utilisateur): static
    {
        $this->favoris->removeElement($utilisateur);
        return $this;
    }

    public function getLogo(): ?Media
    {
        return $this->logo;
    }

    public function setLogo(?Media $logo): static
    {
        $this->logo = $logo;
        return $this;
    }

    /**
     * @return Collection<int, Service>
     */
    public function getServices(): Collection
    {
        return $this->services;
    }

    public function addService(Service $service): static
    {
        if (!$this->services->contains($service)) {
            $this->services->add($service);
        }

        return $this;
    }

    public function removeService(Service $service): static
    {
        $this->services->removeElement($service);

        return $this;
    }

    /**
     * @return Collection<int, MethodePaiement>
     */
    public function getMethodePaiements(): Collection
    {
        return $this->methodePaiements;
    }

    public function addMethodePaiement(MethodePaiement $methodePaiement): static
    {
        if (!$this->methodePaiements->contains($methodePaiement)) {
            $this->methodePaiements->add($methodePaiement);
        }

        return $this;
    }

    public function removeMethodePaiement(MethodePaiement $methodePaiement): static
    {
        $this->methodePaiements->removeElement($methodePaiement);

        return $this;
    }



}
