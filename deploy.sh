#!/bin/bash
cd /var/www/laundrymap

# Récupérer les dernières modifications
git pull origin prod

# Symfony
cd laundrymap-back
composer install --no-dev --optimize-autoloader
php bin/console doctrine:migrations:migrate --no-interaction
php bin/console cache:clear --env=prod

# React
cd ../laundrymap-front
npm install
npm run build

echo "Déploiement terminé !"