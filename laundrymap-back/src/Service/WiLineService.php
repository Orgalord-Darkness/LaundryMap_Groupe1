<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class WiLineService
{
    public function __construct(
        private HttpClientInterface $httpClient,
        private string $username,
        private string $apiKey,
    ) {}

    /**
     * Récupère les données d'une centrale Wi-Line à partir de son numéro de série.
     * Retourne le tableau de données, ou un tableau ['error' => '...'] en cas d'échec.
     */
    public function getCentraleData(string $serial): array
    {
        if (!$this->username || !$this->apiKey) {
            return ['error' => 'Les variables WILINE_USERNAME et WILINE_API_KEY ne sont pas configurées sur le serveur.'];
        }

        try {
            // Étape 1 : authentification pour obtenir un token JWT Wi-Line
            // L'API Wi-Line attend du application/x-www-form-urlencoded (pas du JSON)
            $authResponse = $this->httpClient->request('POST', 'https://api.wi-line.fr/auth', [
                'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
                'body'    => http_build_query(['user' => $this->username, 'api_key' => $this->apiKey]),
                'timeout' => 10,
            ]);

            $authStatus = $authResponse->getStatusCode();
            if ($authStatus !== 200) {
                return ['error' => "Échec de l'authentification Wi-Line (HTTP {$authStatus}). Vérifiez les credentials WILINE_USERNAME / WILINE_API_KEY."];
            }

            $authBody = $authResponse->toArray(false); // false = ne pas lever d'exception sur erreur
            // Wi-Line retourne HTTP 200 même si les credentials sont mauvais, avec status=false
            if (empty($authBody['status'])) {
                return ['error' => 'Identifiants Wi-Line incorrects (WILINE_USERNAME / WILINE_API_KEY). Vérifiez vos credentials.'];
            }

            $token = $authBody['token'] ?? null;
            if (!$token) {
                return ['error' => "L'API Wi-Line n'a pas retourné de token d'authentification."];
            }

            // Étape 2 : récupération des données de la centrale par son serial
            $dataResponse = $this->httpClient->request(
                'GET',
                "https://api.wi-line.fr/laundry_map/centrales/{$serial}",
                [
                    'headers' => ['Authorization' => "Bearer {$token}"],
                    'timeout' => 10,
                ]
            );

            $dataStatus = $dataResponse->getStatusCode();
            if ($dataStatus === 404) {
                return ['error' => "Aucune centrale trouvée pour le serial « {$serial} ». Vérifiez le code saisi."];
            }
            if ($dataStatus !== 200) {
                return ['error' => "Erreur de l'API Wi-Line lors de la récupération des données (HTTP {$dataStatus})."];
            }

            return $dataResponse->toArray();

        } catch (\Throwable $e) {
            return ['error' => 'Impossible de contacter l\'API Wi-Line : ' . $e->getMessage()];
        }
    }
}
