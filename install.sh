#!/bin/bash

echo "Installation des dépendances Symfony..."
cd laundrymap-back
docker compose exec php composer install
echo "Installation Symfony terminée."

echo "Installation des dépendances React..."
cd laundrymap-front
docker compose exec laundrymap-front npm install
echo "Installation React terminée."