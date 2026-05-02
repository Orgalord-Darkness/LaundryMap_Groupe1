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
}