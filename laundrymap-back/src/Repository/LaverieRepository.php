<?php

namespace App\Repository;

use App\Entity\Laverie;
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

    /**
     * Récupère une laverie avec toutes ses relations utiles pour l'édition et la validation.
     * Retourne null si non trouvée.
     */
    public function findOneWithDetails(int $id): ?array
    {
        $result = $this->createQueryBuilder('l')
            ->select('l')
            ->addSelect('PARTIAL logo.{id, emplacement}')
            ->addSelect('PARTIAL adresse.{id, adresse, rue, code_postal, ville, pays, latitude, longitude}')
            ->addSelect('PARTIAL pro.{id, siren, statut}')
            ->addSelect('PARTIAL utilisateur.{id, prenom, nom, email}')
            ->addSelect('PARTIAL services.{id, nom}')
            ->addSelect('PARTIAL paiements.{id, nom}')
            ->addSelect('PARTIAL interactions.{id, action, motif_action, date}')
            ->leftJoin('l.logo', 'logo')
            ->leftJoin('l.adresse', 'adresse')
            ->leftJoin('l.professionnel', 'pro')
            ->leftJoin('pro.utilisateur', 'utilisateur')
            ->leftJoin('l.services', 'services')
            ->leftJoin('l.methodePaiements', 'paiements')
            ->leftJoin('l.laverieHistoriqueInteractions', 'interactions')
            ->where('l.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getArrayResult();

        return $result[0] ?? null;
    }


}
