<?php

namespace App\Repository;

use App\Entity\Laverie;
use App\Entity\Professionnel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use App\Enum\LaverieStatutEnum;

/**
 * @extends ServiceEntityRepository<Laverie>
 */
class LaverieRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Laverie::class);
    }

    public function findAllWithDetails(int $offset = 0, int $limit = 10, LaverieStatutEnum $statut=LaverieStatutEnum::EN_ATTENTE): array
    {
        $queryBuilder = $this->createQueryBuilder('l')
        ->leftJoin('l.logo', 'logo')
        ->leftJoin('l.adresse', 'adresse')
        ->leftJoin('l.professionnel', 'pro')
        ->leftJoin('l.services', 'services')
        ->leftJoin('l.methodePaiements', 'paiements')
        ->leftJoin('l.favoris', 'favoris')
        ->leftJoin('l.laverieHistoriqueInteractions', 'interactions')
        ->addSelect([
            'logo', 'adresse', 'pro', 'services', 'paiements', 'favoris', 'interactions'
        ])
        ->where('TRIM(UPPER(l.statut)) = :statut')
        ->setParameter('statut',$statut->value)
        ->setFirstResult($offset)
        ->setMaxResults($limit);

        $query = $queryBuilder->getQuery();
        $laveries = $query->getArrayResult();
        return $laveries;
    }

    public function findAsk(
        int $offset = 0,
        int $limit = 10,
        LaverieStatutEnum $statut = LaverieStatutEnum::EN_ATTENTE
    ): array {
        return $this->createQueryBuilder('l')
            ->select('l')
            ->addSelect('PARTIAL logo.{id, emplacement}')
            ->addSelect('PARTIAL pro.{id}')
            ->addSelect('PARTIAL utilisateur.{id, prenom, nom}')
            ->leftJoin('l.logo', 'logo')
            ->leftJoin('l.professionnel', 'pro')
            ->leftJoin('pro.utilisateur', 'utilisateur')
            ->where('TRIM(UPPER(l.statut)) = :statut')
            ->setParameter('statut', $statut->value)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getArrayResult();
    }

    public function setStatut(Laverie $laverie, LaverieStatutEnum $statut): void
    {
        $laverie->setStatut($statut);
        $laverie->setDateModification(new \DateTime());

        $em = $this->getEntityManager();
        $em->persist($laverie);
        $em->flush();
    }

    public function findOneWithDetails(int $id): ?array
    {
        // ── Partie DQL : relations déclarées dans l'entité ────────────────────────
        $result = $this->createQueryBuilder('l')
            ->select('l')
            ->addSelect('PARTIAL logo.{id, emplacement, nom_original}')
            ->addSelect('PARTIAL adresse.{id, adresse, rue, code_postal, ville, pays, latitude, longitude}')
            ->addSelect('PARTIAL pro.{id, siren, statut}')
            ->addSelect('PARTIAL utilisateur.{id, prenom, nom, email}')
            ->addSelect('PARTIAL services.{id, nom}')
            ->addSelect('PARTIAL paiements.{id, nom}')
            ->addSelect('PARTIAL interactions.{id, action, motif_action, date}')
            ->leftJoin('l.logo',                          'logo')
            ->leftJoin('l.adresse',                       'adresse')
            ->leftJoin('l.professionnel',                 'pro')
            ->leftJoin('pro.utilisateur',                 'utilisateur')
            ->leftJoin('l.services',                      'services')
            ->leftJoin('l.methodePaiements',              'paiements')
            ->leftJoin('l.laverieHistoriqueInteractions', 'interactions')
            ->where('l.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getArrayResult();

        if (empty($result)) {
            return null;
        }

        $laverie = $result[0];

        // ── Horaires : SQL natif car OneToMany non déclaré dans Laverie.php ───────
        $conn = $this->getEntityManager()->getConnection();

        $fermetures = $conn->fetchAllAssociative(
            'SELECT id, jour, heure_debut, heure_fin
            FROM laverie_fermeture
            WHERE laverie_id = :id
            ORDER BY FIELD(jour, "lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"), heure_debut',
            ['id' => $id]
        );

        $laverie['laverieFermetures'] = $fermetures;

        // ── Galerie d'images : SQL natif car OneToMany non déclaré ───────────────
        $medias = $conn->fetchAllAssociative(
            'SELECT lm.id, lm.description, m.emplacement, m.nom_original
            FROM laverie_media lm
            INNER JOIN media m ON m.id = lm.media_id
            WHERE lm.laverie_id = :id',
            ['id' => $id]
        );

        $laverie['laverieMedias'] = $medias;

        // ── Équipements : SQL natif car OneToMany non déclaré ────────────────────
        $equipements = $conn->fetchAllAssociative(
            'SELECT id, nom, type, capacite, tarif, duree
            FROM laverie_equipement
            WHERE laverie_id = :id',
            ['id' => $id]
        );

        $laverie['equipements'] = $equipements;

        return $laverie;
    }

    // Pour le dashboard professionnel : Récupérer les laveries actives (validées ou en attente) d'un professionnel
    public function findActivesByProfessionnel(Professionnel $professionnel): array
    {
        return $this->createQueryBuilder('l')
            ->where('l.professionnel = :pro')
            ->andWhere('l.supprime_le IS NULL')   // exclure les laveries supprimées
            ->setParameter('pro', $professionnel)
            ->orderBy('l.date_ajout', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function deleteLaundry(Laverie $laverie): void
    {
        $laverie->setStatut(LaverieStatutEnum::SUPPRIME);
        $laverie->setSupprimeLe(new \DateTime());
        $laverie->setDateModification(new \DateTime());

        $em = $this->getEntityManager();
        $em->persist($laverie);
        $em->flush();
    }

    /**
     * Recherche les laveries validées dans un rayon donné autour d'un point GPS.
     *
     * La distance est calculée avec la formule haversine directement en SQL.
     * Seules les laveries avec statut VALIDE, non supprimées et avec des coordonnées
     * renseignées sont retournées. Les résultats sont triés par distance croissante.
     *
     * @param float $lat    Latitude du point de référence (position de l'utilisateur)
     * @param float $lng    Longitude du point de référence
     * @param int   $radius Rayon de recherche en mètres (défaut : 2000 m = 2 km)
     * @return array        Liste de laveries avec leur distance en mètres
     */
    public function findByLocation(float $lat, float $lng, int $radius = 2000): array
    {
        $conn = $this->getEntityManager()->getConnection();

        // La formule haversine calcule la distance en mètres entre 2 points GPS.
        // Sous-requête pour éviter le HAVING sur alias (incompatible strict SQL).
        // LEAST(1.0, ...) évite un acos(>1) sur des points identiques (flottant).
        $sql = '
            SELECT *
            FROM (
                SELECT
                    l.id,
                    l.nom_etablissement  AS nomEtablissement,
                    l.contact_email      AS contactEmail,
                    l.description,
                    a.adresse,
                    a.rue,
                    a.code_postal        AS codePostal,
                    a.ville,
                    a.pays,
                    a.latitude,
                    a.longitude,
                    ROUND(
                        6371000 * acos(LEAST(1.0,
                            cos(radians(:lat)) * cos(radians(a.latitude)) * cos(radians(a.longitude) - radians(:lng))
                            + sin(radians(:lat)) * sin(radians(a.latitude))
                        ))
                    , 1) AS distanceMetres
                FROM laverie l
                INNER JOIN adresse a ON l.adresse_id = a.id
                WHERE l.statut = :statut
                  AND l.supprime_le IS NULL
                  AND a.latitude IS NOT NULL
                  AND a.longitude IS NOT NULL
            ) AS sub
            WHERE sub.distanceMetres <= :radius
            ORDER BY sub.distanceMetres ASC
        ';

        return $conn->fetchAllAssociative($sql, [
            'lat'    => $lat,
            'lng'    => $lng,
            'radius' => $radius,
            'statut' => LaverieStatutEnum::VALIDE->value,
        ]);
    }

    /**
     * Retourne toutes les laveries validées avec leur adresse.
     * Utilisé comme fallback quand aucune coordonnée n'est disponible.
     *
     * @return array
     */
    public function findValidated(): array
    {
        return $this->createQueryBuilder('l')
            ->select('l')
            ->addSelect('PARTIAL adresse.{id, adresse, rue, code_postal, ville, pays, latitude, longitude}')
            ->leftJoin('l.adresse', 'adresse')
            ->where('l.statut = :statut')
            ->andWhere('l.supprime_le IS NULL')
            ->setParameter('statut', LaverieStatutEnum::VALIDE)
            ->orderBy('l.date_ajout', 'DESC')
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * Recherche les laveries validées dans un rayon donné, avec filtres optionnels.
     *
     * @param float $lat     Latitude du point de référence
     * @param float $lng     Longitude du point de référence
     * @param int   $radius  Rayon en mètres (défaut : 2000)
     * @param array $filters Filtres optionnels : services[], payments[], openAt (HH:MM)
     */
    public function findByLocationAndFilters(float $lat, float $lng, int $radius = 2000, array $filters = []): array
    {
        $conn = $this->getEntityManager()->getConnection();

        $params = [
            'lat'    => $lat,
            'lng'    => $lng,
            'radius' => $radius,
            'statut' => LaverieStatutEnum::VALIDE->value,
        ];
        $types  = [];
        $joins  = '';
        $wheres = '';

        if (!empty($filters['services'])) {
            $joins  .= ' LEFT JOIN laverie_service ls ON ls.laverie_id = l.id
                         LEFT JOIN service s ON s.id = ls.service_id';
            $wheres .= ' AND s.nom IN (:services)';
            $params['services'] = $filters['services'];
            $types['services']  = \Doctrine\DBAL\ArrayParameterType::STRING;
        }

        if (!empty($filters['payments'])) {
            $joins  .= ' LEFT JOIN laverie_paiement lp ON lp.laverie_id = l.id
                         LEFT JOIN methode_paiement mp ON mp.id = lp.methode_paiement_id';
            $wheres .= ' AND mp.nom IN (:payments)';
            $params['payments'] = $filters['payments'];
            $types['payments']  = \Doctrine\DBAL\ArrayParameterType::STRING;
        }

        if (!empty($filters['hourly_open']) || !empty($filters['hourly_end'])) {
            $joins .= ' LEFT JOIN laverie_fermeture lf ON lf.laverie_id = l.id';
            if (!empty($filters['hourly_open'])) {
                $wheres .= ' AND lf.heure_debut <= :hourly_open';
                $params['hourly_open'] = $filters['hourly_open'];
            }
            if (!empty($filters['hourly_end'])) {
                $wheres .= ' AND lf.heure_fin >= :hourly_end';
                $params['hourly_end'] = $filters['hourly_end'];
            }
        }

        $sql = "
            SELECT DISTINCT
                l.id,
                l.nom_etablissement  AS nomEtablissement,
                l.contact_email      AS contactEmail,
                l.description,
                a.adresse,
                a.rue,
                a.code_postal        AS codePostal,
                a.ville,
                a.pays,
                a.latitude,
                a.longitude,
                ROUND(
                    6371000 * acos(LEAST(1.0,
                        cos(radians(:lat)) * cos(radians(a.latitude)) * cos(radians(a.longitude) - radians(:lng))
                        + sin(radians(:lat)) * sin(radians(a.latitude))
                    ))
                , 1) AS distanceMetres
            FROM laverie l
            INNER JOIN adresse a ON l.adresse_id = a.id
            {$joins}
            WHERE l.statut = :statut
              AND l.supprime_le IS NULL
              AND a.latitude IS NOT NULL
              AND a.longitude IS NOT NULL
              {$wheres}
            HAVING distanceMetres <= :radius
            ORDER BY distanceMetres ASC
        ";

        return $conn->executeQuery($sql, $params, $types)->fetchAllAssociative();
    }

}
