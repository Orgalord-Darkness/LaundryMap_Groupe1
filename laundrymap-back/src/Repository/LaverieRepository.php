<?php

namespace App\Repository;

use App\Entity\Laverie;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

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

    public function findAllWithDetails($offset = 0, $limit = 10, $statut = 'EN_ATTENTE'): array
    {
        $qb = $this->createQueryBuilder('l')
            ->select('l', 'p', 'u', 'm')
            ->where('l.statut = :statut')
            ->setParameter('statut', $statut)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ;
        return $qb->getQuery()->getArrayResult();
    }
}
