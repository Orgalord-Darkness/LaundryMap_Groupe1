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

    private function geoCodeNorminatim(string $adresse, string $codePostal, string $ville, string $pays = 'France'): ?array 
    {
        try {
            $reponse = $this->httpClient->request('GET', 'https://nominatim.openstreetmap.org/search', [
                'query' => [
                    'street' => $adresse,
                    'postalcode' => $codePostal,
                    'city' => $ville,
                    'country' => $pays,
                    'format' => 'json', 
                    'limit' => 1,
                ],
                'headers' => [
                    'User-Agent' => 'LaundryMap/1.0 (heddy.mameri@gmail.com)', 
                ], 
                'timeout' => 8,
            ]);

            if ($reponse->getStatusCode() !== 200) {
                return null;
            }

            $data = $reponse->toArray(false); 

            if (empty($data)) {
                return null;
            }

            // Nominatim retourne une liste de résultats, on prend le premier
            return [
                'lat' => (float) $data[0]['lat'],
                'lng' => (float) $data[0]['lon'],
            ];
        } catch(\Throwable $e) {
            return null;
        }
    }

    public function geocodeAdresseStructuree(
        string $adresse, 
        string $codePostal, 
        string $ville, 
        string $pays = 'France'
    ): ?array {
        try {
            $reponse = $this->httpClient->request('GET', 'https://api-adresse.data.gouv.fr/search/', [
                'query' => [
                    'q' => $adresse,
                    'postcode' => $codePostal,
                    'limit' => 1, 
                ],
                'timeout' => 8,
            ]);

            if ($reponse->getStatusCode() === 400) {
                return $this->geocodeAdresse("$adresse $codePostal $ville $pays");
            }

            if ($reponse->getStatusCode() !== 200) {
                return null;
            }

            $data = $reponse->toArray(false);

            if (empty($data['features'])) {
                return null;
            }

            $feature = $data['features'][0];    
            $score = $feature['properties']['score'] ?? 0;
            $type = $feature['properties']['type'] ?? '';

            if ($type === 'housenumber' && $score >= 0.55) {
                $coordinates = $feature['geometry']['coordinates'];
                return [
                    'lat' => (float) $coordinates[1],
                    'lng' => (float) $coordinates[0],
                ];
            }
        } catch (\Throwable $e) {
            return null;
        }

        return $this->geoCodeNorminatim($adresse, $codePostal, $ville, $pays);
    }

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

            // Après avoir vérifié que features n'est pas vide :
            $feature = $data['features'][0];

            // Rejeter les correspondances trop approximatives ()
            $score = $feature['properties']['score'] ?? 0;
            if ($score < 0.6) {
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
