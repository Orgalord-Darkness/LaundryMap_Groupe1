<?php 

namespace App\Controller; 

use App\Entity\Utilisateur;
use App\Entity\Administrateur;
use App\Entity\Laverie;
use App\Entity\Service;
use App\Entity\MethodePaiement;
use App\Entity\Media; 
use App\Entity\LaverieMedia;
use App\Entity\LaverieEquipement;  
use App\Entity\LaverieFermeture; 
use App\Enum\EquipementEnum; 
use App\Enum\ActionEnum;
use App\Enum\LaverieStatutEnum;
use App\Enum\JourEnum; 
use App\Repository\UtilisateurRepository;
use App\Repository\AdresseRepository;
use App\Repository\ServiceRepository;
use App\Repository\AdministrateurRepository;
use App\Repository\MethodePaiementRepository;
use App\Service\LaverieService;
use App\Service\AdresseService;
use App\Service\UtilisateurService;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\LaverieRepository;
use App\Repository\LaverieHistoriqueInteractionRepository;
use App\Service\GeolocationService;
use App\Service\WiLineService;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use App\Service\SendEmailService;


#[Route('/api/v1/laverie')]
class LaverieController extends AbstractController 
{
    #[Route('/list', name: 'laverie_list', methods: ['GET'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Parameter(
        name: 'page',
        in: 'query',
        description: 'Numéro de page pour la pagination (par défaut: 1)',
        required: false,
        schema: new OA\Schema(type: 'integer', default: 1)
    )]
    #[OA\Parameter(
        name: 'limit',
        in: 'query',
        description: 'Nombre d\'éléments par page pour la pagination (par défaut: 10, max: 100)',
        required: false,
        schema: new OA\Schema(type: 'integer', default: 10)
    )]
    #[OA\Parameter(
        name: 'statut',
        in: 'query',
        description: 'Statut des laveries à filtrer',
        required: false,
        schema: new OA\Schema(type: LaverieStatutEnum::class, default: LaverieStatutEnum::EN_ATTENTE)
    )]
    public function laveries (
        Request $request,
        LaverieRepository $laverieRepository,   
        EntityManagerInterface $em,
        TagAwareCacheInterface $cachePool,
    ): JsonResponse 
    {
        $donnees = json_decode($request->getContent(), true);
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = max(1, min(100, (int) $request->query->get('limit', 10)));
        $offset = ($page - 1) * $limit;
        $statut = LaverieStatutEnum::tryFrom($request->query->get('statut')) ?? LaverieStatutEnum::EN_ATTENTE;

        $cacheKey = sprintf(
            'laveries_page_%d_limit_%d_statut_%s',
            $page,
            $limit,
            $statut->value
        );
        $laveries = $cachePool->get($cacheKey, function(ItemInterface $item) use ($laverieRepository, $offset, $limit, $statut) {
            $item->tag('laverieCache');
            $item->expiresAfter(300); // 5 min
            return $laverieRepository->findAsk($offset, $limit, $statut);
        });

        return $this->json([
            'data' => $laveries
        ], Response::HTTP_OK);
    }

    /**
     * Route de modification d'une laverie. Seul le professionnel propriétaire de la laverie ou un administrateur peut accéder à cette route.
     */
    #[Route('/edit/{id}', name: 'laverie_edit', methods: ['PUT'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Security(name: 'Bearer')]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'ID de la laverie à modifier',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            properties: [

                new OA\Property(property: 'nom_etablissement', type: 'string', example: 'Ma Laverie'),
                new OA\Property(property: 'description', type: 'string', example: 'Une laverie moderne et bien équipée'),
                new OA\Property(property: 'contact_email', type: 'string', example: 'contact@malaverie.fr'),

                // Adresse
                new OA\Property(property: 'adresse', type: 'string', example: '12 rue de la Paix'),
                new OA\Property(property: 'rue', type: 'string', example: 'Rue de la Paix'),
                new OA\Property(property: 'code_postal', type: 'integer', example: 75001),
                new OA\Property(property: 'ville', type: 'string', example: 'Paris'),
                new OA\Property(property: 'pays', type: 'string', example: 'France'),
                new OA\Property(property: 'latitude', type: 'number', format: 'float', example: 48.8566),
                new OA\Property(property: 'longitude', type: 'number', format: 'float', example: 2.3522),

                // Services
                new OA\Property(
                    property: 'services',
                    type: 'array',
                    items: new OA\Items(type: 'integer'),
                    example: [1, 2, 3]
                ),

                // Méthodes de paiement
                new OA\Property(
                    property: 'methodes_paiement',
                    type: 'array',
                    items: new OA\Items(type: 'integer'),
                    example: [1, 2]
                ),

                // Logo base64
                new OA\Property(
                    property: 'logo',
                    type: 'string',
                    nullable: true,
                    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
                ),

                // Images multiples
                new OA\Property(
                    property: 'images',
                    type: 'array',
                    items: new OA\Items(type: 'string'),
                    example: [
                        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...',
                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
                    ]
                ),

                // Équipements
                new OA\Property(
                    property: 'equipements',
                    type: 'array',
                    items: new OA\Items(type: 'integer'),
                    example: [4, 7, 9]
                ),

                // Week schedule (objet complexe)
                new OA\Property(
                    property: 'weekSchedule',
                    type: 'object',
                    example: '{
                        "monday": {
                            "morning": { "start": "08:00", "end": "12:00" },
                            "afternoon": { "start": "14:00", "end": "18:00" }
                        }
                    }'
                ),

            ]
        )
    )]

    #[OA\Response(
        response: 200,
        description: 'Laverie mise à jour avec succès',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'message', type: 'string', example: 'Laverie mise à jour avec succès'),
                new OA\Property(
                    property: 'laverie',
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 1),
                        new OA\Property(property: 'nom_etablissement', type: 'string', example: 'Ma Laverie'),
                        new OA\Property(property: 'description', type: 'string', example: 'Une laverie moderne'),
                        new OA\Property(property: 'contact_email', type: 'string', example: 'contact@malaverie.fr'),
                        new OA\Property(property: 'statut', type: 'string', example: 'actif'),
                    ]
                ),
            ]
        )
    )]
    #[OA\Response(response: 400, description: 'Données invalides')]
    #[OA\Response(response: 401, description: 'Non authentifié')]
    #[OA\Response(response: 403, description: 'Accès refusé')]
    #[OA\Response(response: 404, description: 'Laverie non trouvée')]
    public function edit(
        int $id,
        Request $request,
        EntityManagerInterface $em,
        TagAwareCacheInterface $cachePool,
        GeolocationService $geolocationService, 
    ): JsonResponse {
        $utilisateur = $this->getUser();

        if (!$utilisateur) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $laverie = $em->getRepository(Laverie::class)->find($id);

        if (!$laverie) {
            return $this->json(['message' => 'Laverie non trouvée.'], Response::HTTP_NOT_FOUND);
        }

        $donnees = json_decode($request->getContent(), true);

        if (!is_array($donnees)) {
            return $this->json(['message' => 'Corps de la requête invalide ou vide'], Response::HTTP_BAD_REQUEST);
        }

        // ─────────────────────────────────────────────
        // 1. Champs simples
        // ─────────────────────────────────────────────
        if (isset($donnees['nom_etablissement'])) {
            $laverie->setNomEtablissement(htmlspecialchars($donnees['nom_etablissement']));
        }
        if (isset($donnees['description'])) {
            $laverie->setDescription(htmlspecialchars($donnees['description']));
        }
        if (isset($donnees['contact_email'])) {
            if (empty($donnees['contact_email'])) {
                $laverie->setContactEmail(null);
            } else
            if (!filter_var($donnees['contact_email'], FILTER_VALIDATE_EMAIL)) {
                return $this->json(['message' => 'Email de contact invalide.'], Response::HTTP_BAD_REQUEST);
            }
            $laverie->setContactEmail($donnees['contact_email']);
        }
        if (array_key_exists('wi_line_reference', $donnees)) {
            $laverie->setWiLineReference($donnees['wi_line_reference'] ?: null);
        }

        // ─────────────────────────────────────────────
        // 2. Adresse
        // ─────────────────────────────────────────────
        $adresse = $laverie->getAdresse();

        foreach (['ville', 'pays'] as $champ) {
            if (isset($donnees[$champ])) {
                $setter = 'set' . ucfirst($champ);
                $adresse->$setter(htmlspecialchars($donnees[$champ]));
            }
        }

        if (isset($donnees['code_postal'])) {
            $adresse->setCodePostal((int)$donnees['code_postal']);
        }
        
        if (isset($donnees['adresse'])) {
            $adresse->setAdresse(htmlspecialchars($donnees['adresse']));
            $rue = preg_replace('/^\s*\d+\s*/', '', explode(',', $donnees['adresse'])[0]);
            $adresse->setRue($rue);
        }

        $addressChanged = isset($donnees['adresse']) || isset($donnees['code_postal']) || isset($donnees['ville'])   || isset($donnees['pays']);

        if ($addressChanged) {
            $fullAdresse = implode(' ', array_filter([
                $adresse->getAdresse(),
                (string) $adresse->getCodePostal(),   
                $adresse->getVille(),
            ]));
            $coords = $geolocationService->geocodeAdresse("$fullAdresse");

            if ($coords !== null && isset($coords['lat'], $coords['lng'])) {
                $adresse->setLatitude($coords['lat']);
                $adresse->setLongitude($coords['lng']);
            } else {
                return $this->json(
                    ['message' => 'Données invalides.', 'errors' => ['geolocation' => 'Impossible de géolocaliser l\'adresse fournie.']],
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }
        }

        // ─────────────────────────────────────────────
        // 3. Services (ManyToMany)
        // ─────────────────────────────────────────────
        if (isset($donnees['services']) && is_array($donnees['services'])) {
            foreach ($laverie->getServices() as $service) {
                $laverie->removeService($service);
            }

            foreach ($donnees['services'] as $serviceId) {
                $service = $em->getRepository(Service::class)->find((int)$serviceId);
                if (!$service) {
                    return $this->json(['message' => "Service ID $serviceId introuvable"], Response::HTTP_BAD_REQUEST);
                }
                $laverie->addService($service);
            }
        }

        // ─────────────────────────────────────────────
        // 4. Méthodes de paiement (ManyToMany)
        // ─────────────────────────────────────────────
        if (isset($donnees['methodes_paiement']) && is_array($donnees['methodes_paiement'])) {
            foreach ($laverie->getMethodePaiements() as $m) {
                $laverie->removeMethodePaiement($m);
            }

            foreach ($donnees['methodes_paiement'] as $methodeId) {
                $methode = $em->getRepository(MethodePaiement::class)->find((int)$methodeId);
                if (!$methode) {
                    return $this->json(['message' => "Méthode ID $methodeId introuvable"], Response::HTTP_BAD_REQUEST);
                }
                $laverie->addMethodePaiement($methode);
            }
        }

        // ─────────────────────────────────────────────
        // 5. Gestion du LOGO (Unique)
        // ─────────────────────────────────────────────
        if (isset($donnees['logo']) && str_starts_with($donnees['logo'], 'data:image')) {
            $oldLogo = $laverie->getLogo();
            if ($oldLogo) {
                $laverie->setLogo(null);
                $em->remove($oldLogo);
            }
            $mediaLogo = $this->saveBase64Image($donnees['logo'], 'logo_', $em);
            $em->persist($mediaLogo);
            $laverie->setLogo($mediaLogo);
        }

        // ─────────────────────────────────────────────
        // 6. Gestion des IMAGES MULTIPLES (Galerie)
        // ─────────────────────────────────────────────
        if (isset($donnees['images']) && is_array($donnees['images'])) {
            // ✅ CORRECTION : On récupère via le repository car la relation inverse n'est pas dans Laverie.php
            $laverieMediaRepo = $em->getRepository(LaverieMedia::class);
            $oldRelations = $laverieMediaRepo->findBy(['laverie' => $laverie]);

            foreach ($oldRelations as $relation) {
                $media = $relation->getMedia();
                $em->remove($relation);
                if ($media) $em->remove($media);
            }
            $em->flush(); 

            foreach ($donnees['images'] as $imgBase64) {
                if (str_contains($imgBase64, 'data:image')) {
                    $media = $this->saveBase64Image($imgBase64, 'galerie_', $em);
                    $em->persist($media);
                    
                    $laverieMedia = new LaverieMedia();
                    $laverieMedia->setLaverie($laverie);
                    $laverieMedia->setMedia($media);
                    $em->persist($laverieMedia);
                }
            }
        }

        // ─────────────────────────────────────────────
        // 7. Gestion des MACHINES (LaverieEquipement)
        // ─────────────────────────────────────────────
        if (isset($donnees['equipements']) && is_array($donnees['equipements'])) {
            // ✅ CORRECTION : Utilisation du repository pour nettoyer
            $eqRepo = $em->getRepository(LaverieEquipement::class);
            $oldEqs = $eqRepo->findBy(['laverie' => $laverie]);
            foreach ($oldEqs as $eq) {
                $em->remove($eq);
            }

            foreach ($donnees['equipements'] as $eqData) {
                $equipement = new LaverieEquipement();
                $equipement->setLaverie($laverie);
                $equipement->setNom($eqData['nom']);
                $equipement->setCapacite(isset($eqData['capacite']) ? (int)$eqData['capacite'] : null);
                $equipement->setTarif(isset($eqData['tarif']) ? (float)$eqData['tarif'] : null);
                $equipement->setDuree(isset($eqData['duree']) ? (int)$eqData['duree'] : null);

                $typeStr = $eqData['type'] ?? 'machine_a_laver';
                $typeEnum = EquipementEnum::tryFrom($typeStr) ?? EquipementEnum::MACHINE_A_LAVER;
                $equipement->setType($typeEnum);
                
                $em->persist($equipement);
            }
        }

        // ─────────────────────────────────────────────
        // 8. Gestion des HORAIRES (LaverieFermeture)
        // ─────────────────────────────────────────────
        if (isset($donnees['weekSchedule']) && is_array($donnees['weekSchedule'])) {
            // ✅ CORRECTION : Utilisation du repository pour nettoyer
            $fermetureRepo = $em->getRepository(LaverieFermeture::class);
            $oldFermetures = $fermetureRepo->findBy(['laverie' => $laverie]);
            foreach ($oldFermetures as $f) {
                $em->remove($f);
            }
            
            foreach ($donnees['weekSchedule'] as $dayEn => $slots) {
                $dayFr = $this->mapDayEnToFr($dayEn);
                $jourEnum = JourEnum::tryFrom($dayFr);
                if (!$jourEnum) continue;

                foreach (['morning', 'afternoon'] as $period) {
                    if (!empty($slots[$period]['start']) && !empty($slots[$period]['end'])) {
                        $fermeture = new LaverieFermeture();
                        $fermeture->setLaverie($laverie);
                        $fermeture->setJour($jourEnum);
                        $fermeture->setHeureDebut(new \DateTime($slots[$period]['start']));
                        $fermeture->setHeureFin(new \DateTime($slots[$period]['end']));
                        $fermeture->setDateAjout(new \DateTime()); // Requis par ton entité
                        $fermeture->setDateModification(new \DateTime());
                        $em->persist($fermeture);
                    }
                }
            }
        }
        // ─────────────────────────────────────────────
        // 9. Sauvegarde
        // ─────────────────────────────────────────────
        $laverie->setDateModification(new \DateTime());
        $em->flush();

        $cachePool->invalidateTags(['laverieCache']);

        return $this->json([
            'message' => 'Laverie mise à jour avec succès',
            'laverie' => [
                'id' => $laverie->getId(),
                'nom_etablissement' => $laverie->getNomEtablissement(),
                'description' => $laverie->getDescription(),
                'contact_email' => $laverie->getContactEmail(),
                'statut' => $laverie->getStatut(),
            ]
        ], Response::HTTP_OK);
    }

    // --- MÉTHODES UTILITAIRES À METTRE À LA FIN DE LA CLASSE ---

    private function saveBase64Image(string $base64, string $prefix, EntityManagerInterface $em): Media
    {
        if (preg_match('/^data:(.*?);base64,(.*)$/', $base64, $matches)) {
            $mimeType = $matches[1];
            $base64Data = $matches[2];
            $binaryData = base64_decode($base64Data);
            $extension = explode('/', $mimeType)[1] ?? 'png';
            $filename = uniqid($prefix) . '.' . $extension;

            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/laveries/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            file_put_contents($uploadDir . $filename, $binaryData);

            $media = new Media();
            $media->setEmplacement('/uploads/laveries/' . $filename);
            $media->setNomOriginal($filename);
            $media->setMimeType($mimeType);
            $media->setPoids(strlen($binaryData));
            
            return $media;
        }
        throw new \Exception("Format d'image invalide");
    }

    private function mapDayEnToFr(string $dayEn): string
    {
        $map = [
            'monday' => 'lundi', 'tuesday' => 'mardi', 'wednesday' => 'mercredi',
            'thursday' => 'jeudi', 'friday' => 'vendredi', 'saturday' => 'samedi', 'sunday' => 'dimanche'
        ];
        return $map[strtolower($dayEn)] ?? $dayEn;
    }

    #[Route('/admin/valider/{id}', name: 'laverie_valider', methods: ['POST'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Security(name: 'Bearer')]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'ID de la laverie à valider',
        required: true,
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(
            type: "object",
            properties: [
                new OA\Property(property: "action", type: "string", enum: ["VALIDE", "REFUSE"]),
                new OA\Property(property: "motif", type: "string")
            ]
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Laverie validée avec succès'
    )]
    public function valider(
        LaverieHistoriqueInteractionRepository $laverieHistoriqueInteractionRepository,
        LaverieRepository $laverieRepository,
        AdministrateurRepository $administrateurRepository,
        TagAwareCacheInterface $cachePool,
        Request $request,
        SendEmailService $sendEmailService, 
        int $id,
    ): JsonResponse 
    {
        $utilisateur = $this->getUser();
        
        $administrateur = $administrateurRepository->findOneByEmail($utilisateur->getEmail());
        if (!$administrateur instanceof Administrateur || $administrateur === null) {
            return $this->json(['message' => 'Accès refusé. Seuls les administrateurs peuvent valider ou refuser une laverie.'], Response::HTTP_FORBIDDEN);
        }

        $laverie = $laverieRepository->find($id);

        $professionnel = $laverieRepository->findProfessionnalByLaverieId($id);
        $emailPro = $professionnel['email'] ?? null;

        if (!$laverie || !$laverie instanceof Laverie) {
            return $this->json(['message' => 'Laverie non trouvée.'], Response::HTTP_NOT_FOUND);
        }

        $donnees = json_decode($request->getContent(), true);

        if (!is_array($donnees)) {
            return $this->json([
                'message' => 'Requête invalide : JSON manquant ou incorrect.',
                'raw' => $request->getContent()
            ], 400);
        }

        if (!isset($donnees['action'])) {
            return $this->json([
                'message' => 'Le champ "action" est obligatoire.',
                'donnees' => $donnees
            ], 400);
        }
        $actionEnum = ActionEnum::tryFrom($donnees['action']);
        if (!$actionEnum) {
            return $this->json([
                'message' => 'Valeur d\'action invalide. Les valeurs possibles sont : VALIDE ou REFUSE.',
                'donnees' => $donnees
            ], 400);
        }   
        $statutEnum = LaverieStatutEnum::EN_ATTENTE;
        $statutString = null; 

        switch($actionEnum) {
            case ActionEnum::VALIDE:
                $statutEnum = LaverieStatutEnum::VALIDE;
                $statutString = 'validée';
                break;
            case ActionEnum::REFUSE:
                $statutEnum = LaverieStatutEnum::REFUSE;
                $statutString = 'refusée';
                break;
            case ActionEnum::EN_ATTENTE:        
                $statutEnum = LaverieStatutEnum::EN_ATTENTE;    
        }
        $motif = htmlspecialchars($donnees['motif'] ?? 'La laverie a été validée par un administrateur.');

        $laverieHistoriqueInteractionRepository->laverieValidation(
            $laverie,
            $administrateur, 
            $actionEnum, 
            $motif,
        );

        //return $this->json(['message' => "Laverie $statutString avec succès. Historique mis à jour."], Response::HTTP_OK);

        $laverieRepository->setStatut($laverie, $statutEnum);
        $cachePool->invalidateTags(['laverieCache']);

        $sendEmail = $sendEmailService->sendEmail($emailPro, 'updateStatutLaundry.html.twig', 'Mise à jour du statut de votre laverie', $statutString, $laverie->getNomEtablissement(), $motif ?? null);

        return $this->json(['message' => 'Laverie validée avec succès.'], Response::HTTP_OK);
    }

    #[Route('/historique', name: 'app_historique_laverie', methods: ['GET'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Security(name: 'Bearer')]
    #[OA\Parameter(
        name: 'page',
        in: 'query',
        required: false,
        schema: new OA\Schema(type: 'integer', example: 1)
    )]
    #[OA\Response(
        response: 200,
        description: 'Historique récupéré avec succès',
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(property: 'data', type: 'array',
                    items: new OA\Items(type: 'object', properties: [
                        new OA\Property(property: 'id', type: 'integer', example: 12),
                        new OA\Property(property: 'type_interaction', type: 'string', example: 'connexion'),
                        new OA\Property(property: 'timestamp', type: 'string', format: 'date-time', example: '2024-03-15T14:23:00Z'),
                        new OA\Property(property: 'laverie_nom', type: 'string', example: 'Laverie du Centre'),
                        new OA\Property(property: 'motif_interaction', type: 'string', example: 'Consultation du tableau de bord'),
                        new OA\Property(property: 'action', type: 'string', example: 'lecture'),
                        new OA\Property(property: 'administateur_id', type: 'integer', example: 3),

                    ])
                ),
                new OA\Property(property: 'page', type: 'integer'),
                new OA\Property(property: 'limit', type: 'integer'),
                new OA\Property(property: 'total', type: 'integer'),
                new OA\Property(property: 'total_pages', type: 'integer'),
            ]
        )
    )]
    public function historique(
        Request $request,
        LaverieHistoriqueInteractionRepository $laverieHistoriqueInteractionRepository,
        TagAwareCacheInterface $cachePool
    ) {
        
        $page   = max(1, (int) $request->query->get('page', 1));
        $offset = ($page - 1) * $limit; 
        $limit = 10;
        
        $total = $laverieHistoriqueInteractionRepository->getHistoriqueCount();
        $enregistrements = $laverieHistoriqueInteractionRepository->getHistorique($offset, $limit);

        return $this->json([
            'total' => $total, 
            'offset' => $offset,
            'limit' => $limit, 
            'enregistrements' => $enregistrements,
            'total_pages' => (int) ceil($total / $limit),
        ], RESPONSE::HTTP_OK); 

    }

    #[Route('/wiline-data', name: 'laverie_wiline_data', methods: ['GET'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Security(name: 'Bearer')]
    #[OA\Parameter(
        name: 'serial',
        in: 'query',
        description: 'Numéro de série de la centrale Wi-Line',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(response: 200, description: 'Données de la centrale Wi-Line')]
    #[OA\Response(response: 400, description: 'Paramètre serial manquant')]
    #[OA\Response(response: 401, description: 'Non authentifié')]
    #[OA\Response(response: 502, description: 'Erreur de communication avec l\'API Wi-Line')]
    public function wilineData(Request $request, WiLineService $wiLineService): JsonResponse
    {
        $utilisateur = $this->getUser();
        if (!$utilisateur) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $serial = trim($request->query->get('serial', ''));
        if (!$serial) {
            return $this->json(['message' => 'Le paramètre serial est requis.'], Response::HTTP_BAD_REQUEST);
        }

        $data = $wiLineService->getCentraleData($serial);
        if (isset($data['error'])) {
            return $this->json(['message' => $data['error']], Response::HTTP_BAD_GATEWAY);
        }

        return $this->json($data, Response::HTTP_OK);
    }

    #[Route('/{id}', name: 'laverie_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Security(name: 'Bearer')]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'ID de la laverie',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\Response(
        response: 200,
        description: 'Détails de la laverie',
        content: new OA\JsonContent(type: 'object')
    )]
    #[OA\Response(response: 401, description: 'Non authentifié')]
    #[OA\Response(response: 404, description: 'Laverie non trouvée')]
    public function show(
        int $id,
        LaverieRepository $laverieRepository,
    ): JsonResponse {
        $utilisateur = $this->getUser();

        if (!$utilisateur) {
            return $this->json(['message' => 'Non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        $laverie = $laverieRepository->findOneWithDetails($id);

        if (!$laverie) {
            return $this->json(['message' => 'Laverie non trouvée.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($laverie, Response::HTTP_OK);
    }

    #[Route('/services', name: 'services_list', methods: ['GET'])]
    public function listServices(ServiceRepository $serviceRepository): JsonResponse
    {
        return $this->json(
            $serviceRepository->findAll(),
            Response::HTTP_OK
        );
    }

    #[Route('/paiements', name: 'paiements_list', methods: ['GET'])]
    public function listPaiements(MethodePaiementRepository $paiementRepository): JsonResponse
    {
        return $this->json(
            $paiementRepository->findAll(),
            Response::HTTP_OK
        );
    }

    #[Route('/suppression/{id}', name: 'delete_laverie', methods:['DELETE'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'ID de la laverie',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    public function deleteLaundry(
        LaverieRepository $laverieRepository,
        int $id,
    ) 
    {
        $laverie = $laverieRepository->find($id); 

        if(!$laverie) {
            return $this->json(['message' => 'laverie introuvable'], Response::HTTP_NOT_FOUND); 
        }

        $laverieRepository->deleteLaundry($laverie);
        return $this->json(['message' => 'Laverie supprimée']);
    }

    /**
     * Recherche de laveries par position GPS ou par adresse textuelle.
     *
     * L'utilisateur peut fournir :
     * - lat + lng : coordonnées GPS directes (ex: envoyées par le navigateur)
     * - query     : adresse textuelle (ville, code postal, rue...) → géocodage automatique
     *
     * Si lat+lng sont fournis, query est ignoré.
     * Seules les laveries validées par un administrateur sont retournées.
     * Les résultats sont triés par distance croissante.
     */
    #[Route('/search', name: 'laverie_search', methods: ['GET'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Parameter(
        name: 'lat',
        in: 'query',
        description: 'Latitude GPS de l\'utilisateur (ex: 49.0415). Prioritaire sur "query".',
        required: false,
        schema: new OA\Schema(type: 'number', format: 'float', example: 49.0415)
    )]
    #[OA\Parameter(
        name: 'lng',
        in: 'query',
        description: 'Longitude GPS de l\'utilisateur (ex: 2.5283). Prioritaire sur "query".',
        required: false,
        schema: new OA\Schema(type: 'number', format: 'float', example: 2.5283)
    )]
    #[OA\Parameter(
        name: 'radius',
        in: 'query',
        description: 'Rayon de recherche en mètres (défaut : 2000 m = 2 km).',
        required: false,
        schema: new OA\Schema(type: 'integer', default: 5000, example: 5000)
    )]
    #[OA\Parameter(
        name: 'query',
        in: 'query',
        description: 'Adresse, ville ou code postal (ex: "Survilliers", "60500 Chantilly"). Ignoré si lat+lng sont fournis.',
        required: false,
        schema: new OA\Schema(type: 'string', example: 'Survilliers 95470')
    )]
    #[OA\Response(
        response: 200,
        description: 'Liste des laveries trouvées dans le périmètre, triées par distance croissante.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'id',               type: 'integer', example: 1),
                    new OA\Property(property: 'nomEtablissement', type: 'string',  example: 'Laverie du Bourg'),
                    new OA\Property(property: 'contactEmail',     type: 'string',  example: 'contact@laverie.fr'),
                    new OA\Property(property: 'description',      type: 'string',  example: 'Laverie moderne et accessible.'),
                    new OA\Property(
                        property: 'adresse',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'adresse',    type: 'string',  example: '5'),
                            new OA\Property(property: 'rue',        type: 'string',  example: 'Rue de la Mairie'),
                            new OA\Property(property: 'codePostal', type: 'integer', example: 95470),
                            new OA\Property(property: 'ville',      type: 'string',  example: 'Survilliers'),
                            new OA\Property(property: 'pays',       type: 'string',  example: 'France'),
                            new OA\Property(property: 'latitude',   type: 'number',  format: 'float', example: 49.0415),
                            new OA\Property(property: 'longitude',  type: 'number',  format: 'float', example: 2.5283),
                        ]
                    ),
                    new OA\Property(property: 'distanceMetres', type: 'number', format: 'float', example: 350.5),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 400,
        description: 'Paramètres invalides ou géocodage impossible.',
        content: new OA\JsonContent(
            type: 'object',
            properties: [new OA\Property(property: 'message', type: 'string')]
        )
    )]
    #[OA\Response(
        response: 404,
        description: 'Aucune laverie trouvée dans ce périmètre.',
        content: new OA\JsonContent(
            type: 'object',
            properties: [new OA\Property(property: 'message', type: 'string')]
        )
    )]
    public function search(
        Request $request,
        LaverieRepository $laverieRepository,
        GeolocationService $geolocationService,
    ): JsonResponse {
        // Lecture des paramètres de la requête
        $latParam    = $request->query->get('lat');
        $lngParam    = $request->query->get('lng');
        $radiusParam = $request->query->get('radius', 5000);
        $query       = $request->query->get('query');

        // Validation du rayon : entier positif, max 50 km
        $radius = (int) $radiusParam;
        if ($radius <= 0) {
            $radius = 30000;
        }
        if ($radius > 50000) {
            return $this->json(['message' => 'Le rayon ne peut pas dépasser 50 000 mètres (50 km).'], Response::HTTP_BAD_REQUEST);
        }

        // Cas 1 : coordonnées GPS fournies directement (prioritaires sur query)
        if ($latParam !== null && $lngParam !== null) {
            $lat = (float) $latParam;
            $lng = (float) $lngParam;

            // Validation des plages de coordonnées GPS
            if ($lat < -90 || $lat > 90) {
                return $this->json(['message' => 'La latitude doit être comprise entre -90 et 90.'], Response::HTTP_BAD_REQUEST);
            }
            if ($lng < -180 || $lng > 180) {
                return $this->json(['message' => 'La longitude doit être comprise entre -180 et 180.'], Response::HTTP_BAD_REQUEST);
            }
        }
        // Cas 2 : adresse textuelle → géocodage
        elseif ($query !== null) {
            $query = trim($query);

            if ($query === '' || strlen($query) > 255) {
                return $this->json(['message' => 'Le paramètre "query" doit contenir entre 1 et 255 caractères.'], Response::HTTP_BAD_REQUEST);
            }

            $coords = $geolocationService->geocodeAdresse($query);

            if ($coords === null) {
                return $this->json(['message' => 'Adresse introuvable. Vérifiez votre saisie et réessayez.'], Response::HTTP_BAD_REQUEST);
            }

            $lat = $coords['lat'];
            $lng = $coords['lng'];
        }
        // Cas 3 : aucun paramètre fourni
        else {
            return $this->json(['message' => 'Veuillez fournir une position GPS (lat + lng) ou une adresse (query).'], Response::HTTP_BAD_REQUEST);
        }

        // Recherche des laveries dans le rayon
        $laveries = $laverieRepository->findByLocation($lat, $lng, $radius);

        if (empty($laveries)) {
            return $this->json(['message' => 'Aucune laverie trouvée dans ce périmètre. Essayez d\'augmenter le rayon de recherche.'], Response::HTTP_NOT_FOUND);
        }

        // Formatage de la réponse en camelCase
        $result = array_map(function (array $laverie) {
            return [
                'id'               => $laverie['id'],
                'nomEtablissement' => $laverie['nomEtablissement'],
                'contactEmail'     => $laverie['contactEmail'],
                'description'      => $laverie['description'],
                'adresse'          => [
                    'adresse'    => $laverie['adresse'],
                    'rue'        => $laverie['rue'],
                    'codePostal' => (int) $laverie['codePostal'],
                    'ville'      => $laverie['ville'],
                    'pays'       => $laverie['pays'],
                    'latitude'   => (float) $laverie['latitude'],
                    'longitude'  => (float) $laverie['longitude'],
                ],
                'distanceMetres'   => (float) $laverie['distanceMetres'],
            ];
        }, $laveries);

        return $this->json($result, Response::HTTP_OK);
    }

    #[Route('/filter-search', name: 'laverie_filtrer_search', methods: ['GET'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Parameter(
        name: 'lat',
        in: 'query',
        description: 'Latitude GPS de l\'utilisateur (ex: 49.0415). Prioritaire sur "query".',
        required: false,
        schema: new OA\Schema(type: 'number', format: 'float', example: 49.0415)
    )]
    #[OA\Parameter(
        name: 'lng',
        in: 'query',
        description: 'Longitude GPS de l\'utilisateur (ex: 2.5283). Prioritaire sur "query".',
        required: false,
        schema: new OA\Schema(type: 'number', format: 'float', example: 2.5283)
    )]
    #[OA\Parameter(
        name: 'radius',
        in: 'query',
        description: 'Rayon de recherche en mètres (défaut : 2000 m = 2 km).',
        required: false,
        schema: new OA\Schema(type: 'integer', default: 2000, example: 5000)
    )]
    #[OA\Parameter(
        name: 'query',
        in: 'query',
        description: 'Adresse, ville ou code postal (ex: "Survilliers", "60500 Chantilly"). Ignoré si lat+lng sont fournis.',
        required: false,
        schema: new OA\Schema(type: 'string', example: 'Survilliers 95470')
    )]
    #[OA\Parameter(
        name: 'hourly_open',
        in: 'query',
        description: 'Heure d\'ouverture souhaitée (ex: "08:00"). La laverie doit ouvrir à cette heure ou avant.',
        required: false,
        schema: new OA\Schema(type: 'string', format: 'time', example: '08:00')
    )]
    #[OA\Parameter(
        name: 'hourly_end',
        in: 'query',
        description: 'Heure de fermeture souhaitée (ex: "19:00"). La laverie doit fermer à cette heure ou après.',
        required: false,
        schema: new OA\Schema(type: 'string', format: 'time', example: '19:00')
    )]
    #[OA\Parameter(
        name: 'services[]',
        in: 'query',
        description: 'Services souhaités (wifi, parking, banc). Peut être répété.',
        required: false,
        schema: new OA\Schema(type: 'array', items: new OA\Items(type: 'string'), example: ['wifi', 'parking'])
    )]
    #[OA\Parameter(
        name: 'payments[]',
        in: 'query',
        description: 'Moyens de paiement souhaités (carte, especes, carte_fidelite). Peut être répété.',
        required: false,
        schema: new OA\Schema(type: 'array', items: new OA\Items(type: 'string'), example: ['carte'])
    )]
    #[OA\Response(
        response: 200,
        description: 'Liste des laveries trouvées dans le périmètre, triées par distance croissante.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'id',               type: 'integer', example: 1),
                    new OA\Property(property: 'nomEtablissement', type: 'string',  example: 'Laverie du Bourg'),
                    new OA\Property(property: 'contactEmail',     type: 'string',  example: 'contact@laverie.fr'),
                    new OA\Property(property: 'description',      type: 'string',  example: 'Laverie moderne et accessible.'),
                    new OA\Property(
                        property: 'adresse',
                        type: 'object',
                        properties: [
                            new OA\Property(property: 'adresse',    type: 'string',  example: '5'),
                            new OA\Property(property: 'rue',        type: 'string',  example: 'Rue de la Mairie'),
                            new OA\Property(property: 'codePostal', type: 'integer', example: 95470),
                            new OA\Property(property: 'ville',      type: 'string',  example: 'Survilliers'),
                            new OA\Property(property: 'pays',       type: 'string',  example: 'France'),
                            new OA\Property(property: 'latitude',   type: 'number',  format: 'float', example: 49.0415),
                            new OA\Property(property: 'longitude',  type: 'number',  format: 'float', example: 2.5283),
                        ]
                    ),
                    new OA\Property(property: 'distanceMetres', type: 'number', format: 'float', example: 350.5),
                ]
            )
        )
    )]
    #[OA\Response(
        response: 400,
        description: 'Paramètres invalides ou géocodage impossible.',
        content: new OA\JsonContent(
            type: 'object',
            properties: [new OA\Property(property: 'message', type: 'string')]
        )
    )]
    #[OA\Response(
        response: 404,
        description: 'Aucune laverie trouvée dans ce périmètre.',
        content: new OA\JsonContent(
            type: 'object',
            properties: [new OA\Property(property: 'message', type: 'string')]
        )
    )]
    public function filters(
        Request $request,
        LaverieRepository $laverieRepository,
        GeolocationService $geolocationService,
    ): JsonResponse {
        // Lecture des paramètres de la requête
        $latParam    = $request->query->get('lat');
        $lngParam    = $request->query->get('lng');
        $radiusParam = $request->query->get('radius', 2000);
        $query       = $request->query->get('query');

        // Validation du rayon : entier positif, max 50 km
        $radius = (int) $radiusParam;
        if ($radius <= 0) {
            $radius = 2000;
        }
        if ($radius > 50000) {
            return $this->json(['message' => 'Le rayon ne peut pas dépasser 50 000 mètres (50 km).'], Response::HTTP_BAD_REQUEST);
        }

        // Cas 1 : coordonnées GPS fournies directement (prioritaires sur query)
        if ($latParam !== null && $lngParam !== null) {
            $lat = (float) $latParam;
            $lng = (float) $lngParam;

            // Validation des plages de coordonnées GPS
            if ($lat < -90 || $lat > 90) {
                return $this->json(['message' => 'La latitude doit être comprise entre -90 et 90.'], Response::HTTP_BAD_REQUEST);
            }
            if ($lng < -180 || $lng > 180) {
                return $this->json(['message' => 'La longitude doit être comprise entre -180 et 180.'], Response::HTTP_BAD_REQUEST);
            }
        }
        // Cas 2 : adresse textuelle → géocodage
        elseif ($query !== null) {
            $query = trim($query);

            if ($query === '' || strlen($query) > 255) {
                return $this->json(['message' => 'Le paramètre "query" doit contenir entre 1 et 255 caractères.'], Response::HTTP_BAD_REQUEST);
            }

            $coords = $geolocationService->geocodeAdresse($query);

            if ($coords === null) {
                return $this->json(['message' => 'Adresse introuvable. Vérifiez votre saisie et réessayez.'], Response::HTTP_BAD_REQUEST);
            }

            $lat = $coords['lat'];
            $lng = $coords['lng'];
        }
        // Cas 3 : aucun paramètre fourni
        else {
            return $this->json(['message' => 'Veuillez fournir une position GPS (lat + lng) ou une adresse (query).'], Response::HTTP_BAD_REQUEST);
        }

        // Lecture des filtres optionnels
        $services   = $request->query->all('services');     // ex: ["wifi", "parking"]
        $payments   = $request->query->all('payments');     // ex: ["carte", "especes"]
        $hourlyOpen = $request->query->get('hourly_open'); // ex: "08:00"
        $hourlyEnd  = $request->query->get('hourly_end');  // ex: "19:00"

        $filters = [
            'services'    => $services,
            'payments'    => $payments,
            'hourly_open' => $hourlyOpen,
            'hourly_end'  => $hourlyEnd,
        ];

        $hasFilters = !empty($services) || !empty($payments) || $hourlyOpen !== null || $hourlyEnd !== null;

        // Recherche avec ou sans filtres
        $laveries = $hasFilters
            ? $laverieRepository->findByLocationAndFilters($lat, $lng, $radius, $filters)
            : $laverieRepository->findByLocation($lat, $lng, $radius);

        if (empty($laveries)) {
            return $this->json(['message' => 'Aucune laverie trouvée. Essayez de modifier vos filtres ou d\'augmenter le rayon.'], Response::HTTP_NOT_FOUND);
        }

        // Formatage de la réponse en camelCase
        $result = array_map(function (array $laverie) {
            return [
                'id'               => $laverie['id'],
                'nomEtablissement' => $laverie['nomEtablissement'],
                'contactEmail'     => $laverie['contactEmail'],
                'description'      => $laverie['description'],
                'adresse'          => [
                    'adresse'    => $laverie['adresse'],
                    'rue'        => $laverie['rue'],
                    'codePostal' => (int) $laverie['codePostal'],
                    'ville'      => $laverie['ville'],
                    'pays'       => $laverie['pays'],
                    'latitude'   => (float) $laverie['latitude'],
                    'longitude'  => (float) $laverie['longitude'],
                ],
                'distanceMetres'   => (float) $laverie['distanceMetres'],
            ];
        }, $laveries);

        return $this->json($result, Response::HTTP_OK);
    }
}