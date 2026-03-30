<?php 

namespace App\Controller; 


use App\Entity\Laverie;
use App\Entity\Service;
use App\Entity\MethodePaiement;
use Doctrine\ORM\EntityManagerInterface;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Cache\TagAwareCacheInterface;
use App\Repository\LaverieHistoriqueInteractionRepository;


#[Route('/api/v1/laverie')]
class LaverieController extends AbstractController 
{
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


    #[Route('/historique', name: 'app_historique_laverie', methods: ['GET'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Security(name: 'Bearer')] 
    #[OA\Response(
        response: 200,
        description: 'Historique récupéré avec succès',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(
                type: 'object',
                properties: [
                    new OA\Property(property: 'id', type: 'integer', example: 12),
                    new OA\Property(property: 'type_interaction', type: 'string', example: 'connexion'),
                    new OA\Property(property: 'timestamp', type: 'string', format: 'date-time', example: '2024-03-15T14:23:00Z'),
                    new OA\Property(property: 'laverie_nom', type: 'string', example: 'Laverie du Centre'),
                    new OA\Property(property: 'motif_interaction', type: 'string', example: 'Consultation du tableau de bord'),
                    new OA\Property(property: 'action', type: 'string', example: 'lecture'),
                    new OA\Property(property: 'administateur_id', type: 'integer', example: 3),
                ]
            )
        )
    )]
    public function historique(
        LaverieHistoriqueInteractionRepository $laverieHistoriqueInteractionRepository,
        TagAwareCacheInterface $cachePool
    ) {
        $laveries = $laverieHistoriqueInteractionRepository->getHistorique();

        return $this->json($laveries, Response::HTTP_OK);       
    }
}