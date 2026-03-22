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
                    'query' => ['q' => $siren, 'page' => 1, 'per_page' => 1],
                    'timeout' => 5,
                ]
            );

            if ($response->getStatusCode() !== 200) {
                return false;
            }

            $data = $response->toArray();

            return !empty($data['results'])
                && isset($data['results'][0]['siren'])
                && $data['results'][0]['siren'] === $siren;

        } catch (\Throwable) {
            return false;
        }
    }
}