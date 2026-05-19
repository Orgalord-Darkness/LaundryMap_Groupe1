<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class GeolocationService
{
    public function __construct(
        private HttpClientInterface $httpClient,
    ) {}

    private function geocodeViaPhoton(string $query): ?array
    {
        try {
            $response = $this->httpClient->request('GET', 'https://photon.komoot.io/api/', [
                'query' => [
                    'q'     => $query,
                    'limit' => 1,
                    'lang'  => 'fr',
                ],
                'headers' => [
                    'User-Agent' => 'LaundryMap/1.0 (heddy.mameri@gmail.com)',
                ],
                'timeout' => 8,
            ]);

            if ($response->getStatusCode() !== 200) {
                return null;
            }

            $data = $response->toArray(false);

            if (empty($data['features'])) {
                return null;
            }

            $coordinates = $data['features'][0]['geometry']['coordinates'];

            return [
                'lat' => (float) $coordinates[1],
                'lng' => (float) $coordinates[0],
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function geoCodeNorminatim(string $adresse, string $codePostal, string $ville, string $pays = 'France'): ?array
    {
        try {
            $reponse = $this->httpClient->request('GET', 'https://nominatim.openstreetmap.org/search', [
                'query' => [
                    'street'     => $adresse,
                    'postalcode' => $codePostal,
                    'city'       => $ville,
                    'country'    => $pays,
                    'format'     => 'json',
                    'limit'      => 1,
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

            return [
                'lat' => (float) $data[0]['lat'],
                'lng' => (float) $data[0]['lon'],
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function geoCodeNominatimTexteLibre(string $query): ?array
    {
        try {
            $reponse = $this->httpClient->request('GET', 'https://nominatim.openstreetmap.org/search', [
                'query' => [
                    'q'      => $query,
                    'format' => 'json',
                    'limit'  => 1,
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

            return [
                'lat' => (float) $data[0]['lat'],
                'lng' => (float) $data[0]['lon'],
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function geocodeAdresseStructuree(
        string $adresse,
        string $codePostal,
        string $ville,
        string $pays = 'France'
    ): ?array {
        // Photon sans pays — le pays dans la query perturbe parfois la recherche
        $query = trim("$adresse $codePostal $ville");

        $coords = $this->geocodeViaPhoton($query);
        if ($coords !== null) {
            return $coords;
        }

        $coords = $this->geoCodeNorminatim($adresse, $codePostal, $ville, $pays);
        if ($coords !== null) {
            return $coords;
        }

        return $this->geoCodeNominatimTexteLibre($query);
    }

    public function geocodeAdresse(string $query): ?array
    {
        $coords = $this->geocodeViaPhoton($query);
        if ($coords !== null) {
            return $coords;
        }

        return $this->geoCodeNominatimTexteLibre($query);
    }
}
