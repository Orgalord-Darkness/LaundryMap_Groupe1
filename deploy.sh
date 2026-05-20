#!/bin/bash
set -e  # stoppe le script à la première erreur

cd /data/LaundryMap_Groupe1

# Charger les variables de smoke tests si le fichier existe (jamais commité)
source ./deploy-secrets.sh 2>/dev/null || true

# ── Récupérer les dernières modifications ─────────────────────────────────────
git pull origin prod

# ── Symfony (backend) ─────────────────────────────────────────────────────────
cd laundrymap-back

composer install --no-dev --optimize-autoloader

# Générer les clés JWT si absentes (exclues du git par .gitignore)
if [ ! -f config/jwt/private.pem ]; then
    echo "→ Génération des clés JWT..."
    php bin/console lexik:jwt:generate-keypair --no-interaction
fi

php bin/console doctrine:migrations:migrate --no-interaction
APP_ENV=prod php bin/console cache:clear
APP_ENV=prod php bin/console cache:warmup

# ── Vérifications statiques ───────────────────────────────────────────────────

echo "→ Vérification syntaxique PHP..."
SYNTAX_ERRORS=$(find src -name "*.php" -exec php -l {} \; 2>&1 | grep -v "No syntax errors" || true)
if [ -n "$SYNTAX_ERRORS" ]; then
    echo "✗ Erreurs de syntaxe PHP détectées :"
    echo "$SYNTAX_ERRORS"
    exit 1
fi
echo "✓ Syntaxe PHP OK"

echo "→ Validation schéma base de données..."
APP_ENV=prod php bin/console doctrine:schema:validate --skip-mapping \
    && echo "✓ Schéma DB synchronisé" \
    || echo "⚠ Schéma DB non synchronisé (vérifier les migrations)"

# ── Smoke tests réseau ────────────────────────────────────────────────────────
# Variables à définir sur le serveur : SMOKE_TEST_ADMIN_EMAIL, SMOKE_TEST_ADMIN_PASSWORD
# SMOKE_TEST_LAVERIE_ID, SMOKE_TEST_LAVERIE_ADRESSE, SMOKE_TEST_LAVERIE_CP, SMOKE_TEST_LAVERIE_VILLE

sleep 2  # laisser PHP-FPM redémarrer

BASE_URL="https://groupe-1.lycee-stvincent.net"

# Smoke test 1 : login admin (valide les clés JWT + connexion DB)
echo "→ Smoke test login admin..."
HTTP_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "${BASE_URL}/api/v1/admin/login_check" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${SMOKE_TEST_ADMIN_EMAIL}\",\"password\":\"${SMOKE_TEST_ADMIN_PASSWORD}\"}")

if [ "$HTTP_LOGIN" = "500" ] || [ "$HTTP_LOGIN" = "000" ]; then
    echo "✗ ERREUR login admin — HTTP $HTTP_LOGIN (JWT cassé ou DB inaccessible)"
    exit 1
fi
echo "✓ Login admin actif (HTTP $HTTP_LOGIN)"

# Smoke test 2 : recherche laverie (valide l'API publique)
echo "→ Smoke test recherche laverie..."
HTTP_SEARCH=$(curl -s -o /dev/null -w "%{http_code}" \
  "${BASE_URL}/api/v1/laverie/search?query=Paris&radius=1000")

if [ "$HTTP_SEARCH" = "200" ]; then
    echo "✓ Recherche laverie OK (200)"
else
    echo "✗ ERREUR recherche laverie — HTTP $HTTP_SEARCH"
    exit 1
fi

# Smoke test 3 : dirty-check adresse (valide le fix du PUT sans modification)
echo "→ Smoke test dirty-check adresse..."
if [ -z "${SMOKE_TEST_ADMIN_EMAIL}" ] || [ -z "${SMOKE_TEST_LAVERIE_ID}" ]; then
    echo "⚠ Variables SMOKE_TEST_* non définies — smoke test adresse ignoré"
else
    TOKEN=$(curl -s \
      -X POST "${BASE_URL}/api/v1/admin/login_check" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${SMOKE_TEST_ADMIN_EMAIL}\",\"password\":\"${SMOKE_TEST_ADMIN_PASSWORD}\"}" \
      | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

    if [ -z "$TOKEN" ]; then
        echo "⚠ Token JWT non obtenu — smoke test adresse ignoré"
    else
        HTTP_EDIT=$(curl -s -o /tmp/smoke_edit.json -w "%{http_code}" \
          -X PUT "${BASE_URL}/api/v1/laverie/edit/${SMOKE_TEST_LAVERIE_ID}" \
          -H "Authorization: Bearer $TOKEN" \
          -F "adresse=${SMOKE_TEST_LAVERIE_ADRESSE}" \
          -F "code_postal=${SMOKE_TEST_LAVERIE_CP}" \
          -F "ville=${SMOKE_TEST_LAVERIE_VILLE}" \
          -F "pays=France")

        if [ "$HTTP_EDIT" = "200" ]; then
            echo "✓ Dirty-check adresse OK — PUT sans modification retourne 200"
        else
            echo "✗ ERREUR dirty-check adresse — HTTP $HTTP_EDIT"
            cat /tmp/smoke_edit.json
            exit 1
        fi
    fi
fi

# ── React (frontend) ──────────────────────────────────────────────────────────
cd ../laundrymap-front
npm install
npm run build

echo ""
echo "✓ Déploiement terminé avec succès !"
