<?php 

namespace App\Controller; 

use App\Entity\Utilisateur;
use App\Entity\Administrateur;
use App\Entity\Laverie;
use App\Entity\Service;
use App\Entity\MethodePaiement;
use App\Enum\ActionEnum;
use App\Enum\LaverieStatutEnum;
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
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\Cache\TagAwareCacheInterface;


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
            return $laverieRepository->findAllWithDetails($offset, $limit, $statut);
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
                // Champs adresse
                new OA\Property(property: 'adresse', type: 'string', example: '12 rue de la Paix'),
                new OA\Property(property: 'rue', type: 'string', example: 'rue de la Paix'),
                new OA\Property(property: 'code_postal', type: 'integer', example: 75001),
                new OA\Property(property: 'ville', type: 'string', example: 'Paris'),
                new OA\Property(property: 'pays', type: 'string', example: 'France'),
                new OA\Property(property: 'latitude', type: 'number', format: 'float', example: 48.8566),
                new OA\Property(property: 'longitude', type: 'number', format: 'float', example: 2.3522),
                // Relations ManyToMany
                new OA\Property(
                    property: 'services',
                    type: 'array',
                    items: new OA\Items(type: 'integer'),
                    description: 'Liste des IDs de services',
                    example: [1, 2, 3]
                ),
                new OA\Property(
                    property: 'methodes_paiement',
                    type: 'array',
                    items: new OA\Items(type: 'integer'),
                    description: 'Liste des IDs de méthodes de paiement',
                    example: [1, 2]
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

        // --- Champs directs de la laverie ---
        if (isset($donnees['nom_etablissement'])) {
            $laverie->setNomEtablissement(htmlspecialchars($donnees['nom_etablissement']));
        }
        if (isset($donnees['description'])) {
            $laverie->setDescription(htmlspecialchars($donnees['description']));
        }
        if (isset($donnees['contact_email'])) {
            if (!filter_var($donnees['contact_email'], FILTER_VALIDATE_EMAIL)) {
                return $this->json(['message' => 'Email de contact invalide.'], Response::HTTP_BAD_REQUEST);
            }
            $laverie->setContactEmail($donnees['contact_email']);
        }

        // --- Champs de l'entité Adresse liée ---
        $adresse = $laverie->getAdresse();

        foreach (['adresse', 'rue', 'ville', 'pays'] as $champ) {
            if (isset($donnees[$champ])) {
                $setter = 'set' . ucfirst($champ);
                $adresse->$setter(htmlspecialchars($donnees[$champ]));
            }
        }
        if (isset($donnees['code_postal'])) {
            $adresse->setCodePostal((int) $donnees['code_postal']);
        }
        if (isset($donnees['latitude'])) {
            $adresse->setLatitude((float) $donnees['latitude']);
        }
        if (isset($donnees['longitude'])) {
            $adresse->setLongitude((float) $donnees['longitude']);
        }

        // --- Relation ManyToMany : Services ---
        if (isset($donnees['services']) && is_array($donnees['services'])) {
            // On retire tous les services actuels
            foreach ($laverie->getServices() as $service) {
                $laverie->removeService($service);
            }
            // On ajoute les nouveaux
            foreach ($donnees['services'] as $serviceId) {
                $service = $em->getRepository(Service::class)->find((int) $serviceId);
                if (!$service) {
                    return $this->json(
                        ['message' => sprintf('Service avec l\'ID %d non trouvé.', $serviceId)],
                        Response::HTTP_BAD_REQUEST
                    );
                }
                $laverie->addService($service);
            }
        }

        if (isset($donnees['methodes_paiement']) && is_array($donnees['methodes_paiement'])) {

            foreach ($laverie->getMethodePaiements() as $methode) {
                $laverie->removeMethodePaiement($methode);
            }
            foreach ($donnees['methodes_paiement'] as $methodeId) {
                $methode = $em->getRepository(MethodePaiement::class)->find((int) $methodeId);
                if (!$methode) {
                    return $this->json(
                        ['message' => sprintf('Méthode de paiement avec l\'ID %d non trouvée.', $methodeId)],
                        Response::HTTP_BAD_REQUEST
                    );
                }
                $laverie->addMethodePaiement($methode);
            }
        }

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
                'services' => $laverie->getServices()->map(fn(Service $s) => [
                    'id' => $s->getId(),
                    'nom' => $s->getNom(),
                ])->toArray(),
                'methodes_paiement' => $laverie->getMethodePaiements()->map(fn(MethodePaiement $m) => [
                    'id' => $m->getId(),
                    'nom' => $m->getNom(),
                ])->toArray(),
            ]
        ], Response::HTTP_OK);
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
        int $id,
    ): JsonResponse 
    {
        $utilisateur = $this->getUser();
        
        $administrateur = $administrateurRepository->findOneByEmail($utilisateur->getEmail());
        if (!$administrateur instanceof Administrateur || $administrateur === null) {
            return $this->json(['message' => 'Accès refusé. Seuls les administrateurs peuvent valider ou refuser une laverie.'], Response::HTTP_FORBIDDEN);
        }

        $laverie = $laverieRepository->find($id);

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

        switch($actionEnum) {
            case ActionEnum::VALIDE:
                $statutEnum = LaverieStatutEnum::VALIDE;
                break;
            case ActionEnum::REFUSE:
                $statutEnum = LaverieStatutEnum::REFUSE;
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

        $laverieRepository->setStatut($laverie, $statutEnum);
        $cachePool->invalidateTags(['laverieCache']);

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
}