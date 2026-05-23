<?php

namespace App\Repository;

use App\Entity\MethodePaiement;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MethodePaiement>
 */
class MethodePaiementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MethodePaiement::class);
    }

    //    /**
    //     * @return MethodePaiement[] Returns an array of MethodePaiement objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('m.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?MethodePaiement
    //    {
    //        return $this->createQueryBuilder('m')
    //            ->andWhere('m.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    public function findPaiementsByLaverieIds(array $ids): array {
        if (empty($ids)) {
            return [];
        }

        $conn = $this->getEntityManager()->getConnection();
        $placeholders = implode(',', array_fill(0, count($ids), '?'));  
        $sql = "SELECT lp.laverie_id, mp.nom 
            FROM laverie_paiement lp 
            JOIN methode_paiement mp ON mp.id = lp.methode_paiement_id
            WHERE lp.laverie_id IN ($placeholders)
            ORDER BY mp.nom"; 
        
        $query = $conn->fetchAllAssociative($sql, array_values($ids));
        $grouped = []; 
        foreach ($query as $row) {
            $grouped[(int) $row['laverie_id']][] = $row['nom']; 
        }
        return $grouped;
    }
}
