#!/bin/bash
set -e

echo "=== Génération des clés JWT ===" 
docker compose exec php php bin/console lexik:jwt:generate-keypair --overwrite

echo "=== Installation des dépendances ==="
docker compose exec php composer install

echo "=== Migrations et fixtures ==="
docker compose exec php php bin/console doctrine:migrations:migrate --no-interaction
docker compose exec php php bin/console doctrine:fixtures:load --no-interaction

echo "=== Installation des dépendances React ==="
docker compose exec laundrymap-front npm install 

echo "Installation terminée." 
