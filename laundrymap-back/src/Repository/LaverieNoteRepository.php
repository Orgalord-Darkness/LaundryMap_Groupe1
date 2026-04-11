<?php

namespace App\Repository;

use App\Entity\Laverie;
use App\Entity\LaverieNote;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieNote>
 */
class LaverieNoteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieNote::class);
    }

//    /**
//     * @return LaverieNote[] Returns an array of LaverieNote objects
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

//    public function findOneBySomeField($value): ?LaverieNote
//    {
//        return $this->createQueryBuilder('l')
//            ->andWhere('l.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }



    // Pour le dashboard professionnel : moyenne des notes + nombre d'avis (notes avec commentaire)
    public function findAverageRatingByLaverie(Laverie $laverie): ?float
    {
        $result = $this->createQueryBuilder('ln')
            ->select('AVG(ln.note) as moyenne')
            ->where('ln.laverie = :laverie')
            ->setParameter('laverie', $laverie)
            ->getQuery()
            ->getSingleScalarResult();

        return $result ? round((float) $result, 1) : null;
    }

    public function countAvisByLaverie(Laverie $laverie): int
    {
        return (int) $this->createQueryBuilder('ln')
            ->select('COUNT(ln.id)')
            ->where('ln.laverie = :laverie')
            // uniquement les notes avec commentaire = un "avis"
            ->andWhere('ln.commentaire IS NOT NULL')
            ->setParameter('laverie', $laverie)
            ->getQuery()
            ->getSingleScalarResult();
    }



}
