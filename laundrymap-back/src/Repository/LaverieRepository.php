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

//    /**
//     * @return Laverie[] Returns an array of Laverie objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('l')
//            ->andWhere('l.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('l.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Laverie
//    {
//        return $this->createQueryBuilder('l')
//            ->andWhere('l.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }

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
            ORDER BY FIELD(jour, "lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche")',
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

    public function deleteLaundry(Laverie $laverie) 
    {
        $laverie->setStatut(LaverieStatutEnum::SUPPRIME); 
        $laverie->setSupprimeLe(new \DateTime()); 
        $laverie->setDateModification(new \DateTime()); 

        $em = $this->getEntityManager(); 
        $em->persist($laverie); 
        $em->flush(); 
    }





}
