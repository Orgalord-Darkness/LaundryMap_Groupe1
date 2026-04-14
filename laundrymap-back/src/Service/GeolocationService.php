<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Service de géocodage : convertit une adresse textuelle (ville, code postal, rue...)
 * en coordonnées GPS (latitude / longitude) via l'API gratuite du gouvernement français.
 *
 * API utilisée : https://api-adresse.data.gouv.fr
 * - Gratuite, sans clé API
 * - Gère les accents, les fautes de frappe, les abréviations
 * - Couvre uniquement les adresses françaises
 */
class GeolocationService
{
    public function __construct(
        private HttpClientInterface $httpClient,
    ) {}

    /**
     * Convertit une adresse textuelle en coordonnées GPS.
     *
     * @param string $query L'adresse à géocoder (ex: "12 rue de Bretagne Paris", "Survilliers 95470")
     * @return array|null ['lat' => float, 'lng' => float] ou null si l'adresse est introuvable
     */
    public function geocodeAdresse(string $query): ?array
    {
        try {
            $response = $this->httpClient->request('GET', 'https://api-adresse.data.gouv.fr/search/', [
                'query' => [
                    'q'     => $query,
                    'limit' => 1,
                ],
                'timeout' => 5,
            ]);

            if ($response->getStatusCode() !== 200) {
                return null;
            }

            $data = $response->toArray(false);

            // L'API retourne une liste de "features" (résultats)
            // Si la liste est vide, l'adresse n'a pas été trouvée
            if (empty($data['features'])) {
                return null;
            }

            // Les coordonnées sont dans features[0].geometry.coordinates
            // Attention : l'ordre GeoJSON est [longitude, latitude]
            $coordinates = $data['features'][0]['geometry']['coordinates'];

            return [
                'lat' => (float) $coordinates[1],
                'lng' => (float) $coordinates[0],
            ];

        } catch (\Throwable $e) {
            // En cas d'erreur réseau ou de réponse inattendue, on retourne null
            // Le controller se chargera d'afficher un message d'erreur approprié
            return null;
        }
    }
}
