<?php

namespace App\Repository;

use App\Entity\LaverieHistoriqueInteraction;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieHistoriqueInteraction>
 */
class LaverieHistoriqueInteractionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieHistoriqueInteraction::class);
    }

    //    /**
    //     * @return LaverieHistoriqueInteraction[] Returns an array of LaverieHistoriqueInteraction objects
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

    //    public function findOneBySomeField($value): ?LaverieHistoriqueInteraction
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
























    public function laverieValidation(Laverie $laverie, Administrateur $administrateur, StatutEnum $statut, string $action, string $motif): void 
    {
        $entityManager = $this->getEntityManager();

        $formatDate = new \DateTime('now');

        $laverieHistoriqueInteraction = new LaverieHistoriqueInteraction();
        $laverieHistoriqueInteraction->setLaverie($laverie);
        $laverieHistoriqueInteraction->setAdministrateur($administrateur);
        $laverieHistoriqueInteraction->setAction($action);
        $laverieHistoriqueInteraction->setMotifAction($motif);
        $laverieHistoriqueInteraction->setDate(new \DateTime());
        $laverieHistoriqueInteraction->setStatut($statut);
        $laverieHistoriqueInteraction->setDate($formatDate);

        $entityManager->persist($laverieHistoriqueInteraction);
        $entityManager->flush();
    }
}
