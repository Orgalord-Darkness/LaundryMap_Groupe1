<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class SireneService
{
    public function __construct(private HttpClientInterface $httpClient) {}

    public function verifySiren(string $siren): bool
    {
        try {
            $response = $this->httpClient->request('GET',
                'https://recherche-entreprises.api.gouv.fr/search',
                [
                    'query' => [
                        'q'        => $siren,
                        'page'     => 1,
                        'per_page' => 25,  // On élargit pour ne pas rater le bon résultat
                    ],
                    'timeout' => 5,
                ]
            );

            if ($response->getStatusCode() !== 200) {
                return false;
            }

            $data = $response->toArray();

            if (empty($data['results'])) {
                return false;
            }

            // On parcourt tous les résultats pour trouver le SIREN exact
            foreach ($data['results'] as $result) {
                if (isset($result['siren']) && $result['siren'] === $siren) {
                    return true;
                }
            }

            return false;

        } catch (\Throwable) {
            return false;
        }
    }

    public function lookupSiren(string $siren): ?array
    {
        try {
            $response = $this->httpClient->request('GET',
                'https://recherche-entreprises.api.gouv.fr/search',
                [
                    'query'   => ['q' => $siren, 'page' => 1, 'per_page' => 25],
                    'timeout' => 5,
                ]
            );

            if ($response->getStatusCode() !== 200) {
                return null;
            }

            $data = $response->toArray();

            foreach ($data['results'] ?? [] as $result) {
                if (($result['siren'] ?? '') !== $siren) {
                    continue;
                }

                $siege = $result['siege'] ?? [];
                return [
                    'nom_complet' => $result['nom_complet'] ?? '',
                    'numero_voie' => $siege['numero_voie'] ?? '',
                    'voie'        => trim(($siege['type_voie'] ?? '') . ' ' . ($siege['libelle_voie'] ?? '')),
                    'code_postal' => $siege['code_postal'] ?? '',
                    'commune'     => $siege['libelle_commune'] ?? '',
                ];
            }

            return null;

        } catch (\Throwable) {
            return null;
        }
    }
}