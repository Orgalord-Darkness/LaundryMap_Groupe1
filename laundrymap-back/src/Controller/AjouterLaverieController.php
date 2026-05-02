<?php

// src/Controller/AjouterLaverieController.php

namespace App\Controller;

use App\Entity\Adresse;
use App\Entity\Laverie;
use App\Entity\LaverieFermeture;
use App\Entity\LaverieEquipement;
use App\Entity\LaverieMedia;
use App\Enum\EquipementEnum;
use App\Enum\GeoStatutEnum;
use App\Enum\JourEnum;
use App\Enum\LaverieStatutEnum;
use App\Repository\MethodePaiementRepository;
use App\Repository\ProfessionnelRepository;
use App\Repository\ServiceRepository;
use App\Service\FileUploader;
use App\Service\GeolocationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;


#[Route('/api/v1/professionnel', name: 'api_pro_')]
class AjouterLaverieController extends AbstractController
{
    
    // Correspondance valeurs front (addMachineModal) avec EquipementEnum (back)
    
    private const EQUIPEMENT_MAP = [
        'machine_a_laver' => EquipementEnum::MACHINE_A_LAVER,
        'seche_linge'     => EquipementEnum::SECHE_LINGE,
        'autre'           => EquipementEnum::AUTRE,
    ];

    public function __construct(
        private readonly EntityManagerInterface    $em,
        private readonly ProfessionnelRepository   $professionnelRepository,
        private readonly ServiceRepository         $serviceRepository,
        private readonly MethodePaiementRepository $methodePaiementRepository,
        private readonly FileUploader              $fileUploader,
    ) {}

    
    // POST pour /api/v1/professionnel/addLaundry
    
    #[Route('/addLaundry', name: 'add_laundry', methods: ['POST'])]
    public function addLaundry(Request $request, GeolocationService $geolocationService): JsonResponse
    {
        // ── Récupération du Professionnel lié au User connecté ─────────────
        $user           = $this->getUser();
        $professionnel  = $this->professionnelRepository->findOneBy(['utilisateur' => $user]);

        if (!$professionnel) {
            return $this->json(
                ['message' => 'Aucun profil professionnel trouvé pour cet utilisateur.'],
                Response::HTTP_FORBIDDEN
            );
        }


        // ─ form-data ─────
        $name       = trim((string) $request->request->get('name',       ''));
        $adress     = trim((string) $request->request->get('adress',     ''));
        $codePostal = trim((string) $request->request->get('codePostal', ''));
        $city       = trim((string) $request->request->get('city',       ''));
        $country    = trim((string) $request->request->get('country',    ''));

        $errors = []; 
        $isGood = true; 

        $coords = $geolocationService->geocodeAdresseStructuree($adress, $codePostal, $city, $country);
        if ($coords !== null && isset($coords['lat'], $coords['lng']) && $coords['lat'] !== null && $coords['lng'] !== null) {
            $latRaw = $coords['lat'];
            $lngRaw = $coords['lng'];
        } else {
            $errors['geolocation'] = 'Impossible de géolocaliser l\'adresse fournie. Veuillez vérifier les informations saisies.';
            $isGood = false; 
        }
        $description  = trim((string) $request->request->get('description',   ''));
        $wilineCode   = trim((string) $request->request->get('wilineCode',    ''));
        $contactEmail = trim((string) $request->request->get('contact_email', ''));


        // ──Validation des champs obligatoires ────────────────

        if(!isset($latRaw)) {
            $latRaw = null;
        }
        if(!isset($lngRaw)) {
            $lngRaw = null;
        }

        if ($name       === '') { $errors['name']       = 'Le nom de la laverie est requis.'; }
        if ($adress     === '') { $errors['adress']     = "L'adresse est requise."; }
        if ($codePostal === '') { $errors['codePostal'] = 'Le code postal est requis.'; }
        if ($city       === '') { $errors['city']       = 'La ville est requise.'; }
        if ($country    === '') { $errors['country']    = 'Le pays est requis.'; }
        if ($latRaw === null || $latRaw === '') { $errors['latitude']  = 'Adresse incorrecte.'; }
        if ($lngRaw === null || $lngRaw === '') { $errors['longitude'] = 'Adresse incorrecte.'; }

        if (!empty($errors)) {
            return $this->json(['message' => 'Données invalides.', 'errors' => $errors], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($latRaw === null || $latRaw === '') {
            $latitude = null;
            $isGood = false; 
        } else {
            $latitude = (float) $latRaw;
        }

        if ($lngRaw === null || $lngRaw === '') {
            $longitude = null;
            $isGood = false;
        } else {
            $longitude = (float) $lngRaw;
        }

        $rue = preg_replace('/^\s*\d+\s*/', '', explode(',', $adress)[0]);

        // ── Décodage des champs JSON ────
        $equipmentValues  = json_decode((string) $request->request->get('equipment',      '[]'), true) ?? [];
        $paymentValues    = json_decode((string) $request->request->get('paymentMethods', '[]'), true) ?? [];
        $weekScheduleData = json_decode((string) $request->request->get('weekSchedule',   '{}'), true) ?? [];
        $machinesData     = json_decode((string) $request->request->get('machines',       '[]'), true) ?? [];

        // ── Création de l'Adresse ────────────────────────────────
        $adresse = new Adresse();
        $adresse->setAdresse($adress);
        $adresse->setRue($rue);
        $adresse->setCodePostal((int) $codePostal);
        $adresse->setVille($city);
        $adresse->setPays($country);
        $adresse->setLatitude($latitude);
        $adresse->setLongitude($longitude);
        $adresse->setStatutGeolocalisation(GeoStatutEnum::EN_ATTENTE); 

        $this->em->persist($adresse);

        // ─ Création de la Laverie ─────────────────────
        if($isGood) {
            $laverie = new Laverie();
            $laverie->setNomEtablissement($name);
            $laverie->setDescription($description !== '' ? $description : null);
            $laverie->setContactEmail($contactEmail !== '' ? $contactEmail : null);
            $laverie->setStatut(LaverieStatutEnum::EN_ATTENTE);
            $laverie->setAdresse($adresse);
            $laverie->setProfessionnel($professionnel);
            $laverie->setDateAjout(new \DateTime());
            $laverie->setDateModification(new \DateTime());

            if ($wilineCode !== '') {
                $laverie->setWiLineReference($wilineCode);
            }

            $this->em->persist($laverie);
        } else {
            return $this->json(
                ['message' => 'Données invalides.', 'errors' => $errors],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }



        // ── Logo ----
        $logoFile = $request->files->get('logo');
        if ($logoFile !== null) {
            $logoMedia = $this->fileUploader->upload($logoFile);
            if ($logoMedia !== null) {
                $laverie->setLogo($logoMedia);
            }
        }



        // ── Images de la galerie ────
        /** @var array<\Symfony\Component\HttpFoundation\File\UploadedFile> $imageFiles */
        $imageFiles = $request->files->get('images', []);
        foreach ($imageFiles as $imageFile) {
            $media = $this->fileUploader->upload($imageFile);
            if ($media === null) {
                continue;
            }

            $laverieMedia = new LaverieMedia();
            $laverieMedia->setLaverie($laverie);
            $laverieMedia->setMedia($media);

            $this->em->persist($laverieMedia);
        }



        // ── Ajout Machines / LaverieEquipement ───────────────────────────────────
        // $machinesData = [
        //   { "name": "Machine n°1", "capacity": 7, "duration": 30, "price": 3.5, "available": true, "type": "machine_a_laver" }
        // ]
        foreach ($machinesData as $machineData) {
            if (empty($machineData['name'])) {
                continue;
            }

            $typeValue = $machineData['type'] ?? 'autre';
            $enumType  = self::EQUIPEMENT_MAP[$typeValue] ?? EquipementEnum::AUTRE;

            $equipement = new LaverieEquipement();
            $equipement->setLaverie($laverie);
            $equipement->setNom($machineData['name']);
            $equipement->setType($enumType);
            $equipement->setCapacite(isset($machineData['capacity']) ? (int) $machineData['capacity'] : null);
            $equipement->setDuree(isset($machineData['duration'])   ? (int) $machineData['duration']   : null);
            $equipement->setTarif(isset($machineData['price'])      ? (float) $machineData['price']    : null);

            $this->em->persist($equipement);
        }



        // ── Services (équipements disponibles : Wi-Fi, table…) ───
       
        foreach ($equipmentValues as $equipmentNom) {
            $service = $this->serviceRepository->findOneBy(['nom' => $equipmentNom]);
            if ($service !== null) {
                $laverie->addService($service);
            }
        }

        // ── Méthodes de paiement ──────────────────────────────────────────
        foreach ($paymentValues as $paymentNom) {
            $methodePaiement = $this->methodePaiementRepository->findOneBy(['nom' => $paymentNom]);
            if ($methodePaiement !== null) {
                $laverie->addMethodePaiement($methodePaiement);
            }
        }

        // ── Horaires (LaverieFermeture) ───────────────────────────────────
        foreach ($weekScheduleData as $jourKey => $periods) {
            $jourEnum = JourEnum::tryFrom($jourKey);
            if ($jourEnum === null) {
                continue; 
            }

            foreach (['morning' => 'matin', 'afternoon' => 'après-midi'] as $periodKey => $_label) {
                $period = $periods[$periodKey] ?? null;

                if (
                    !is_array($period)
                    || empty($period['start'])
                    || empty($period['end'])
                ) {
                    continue; 
                }

                $heureDebut = \DateTime::createFromFormat('H:i', $period['start']);
                $heureFin   = \DateTime::createFromFormat('H:i', $period['end']);

                if ($heureDebut === false || $heureFin === false) {
                    continue; 
                }

                $fermeture = new LaverieFermeture();
                $fermeture->setLaverie($laverie);
                $fermeture->setJour($jourEnum);
                $fermeture->setHeureDebut($heureDebut);
                $fermeture->setHeureFin($heureFin);
                $fermeture->setDateAjout(new \DateTime());
                $fermeture->setDateModification(new \DateTime());

                $this->em->persist($fermeture);
            }
        }



        // ── Flush ────────
        try {
            $this->em->flush();
        } catch (\Exception $e) {
            return $this->json(
                ['message' => 'Erreur lors de la sauvegarde : ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        return $this->json(
            ['message' => 'Laverie ajoutée avec succès.', 'id' => $laverie->getId()],
            Response::HTTP_CREATED
        );
    }
}