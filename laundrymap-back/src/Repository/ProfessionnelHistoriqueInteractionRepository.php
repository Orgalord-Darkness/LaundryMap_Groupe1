<?php

namespace App\Repository;

use App\Entity\ProfessionnelHistoriqueInteraction;
use App\Entity\Professionnel;
use App\Entity\Administrateur;
use App\Enum\StatutEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ProfessionnelHistoriqueInteraction>
 */
class ProfessionnelHistoriqueInteractionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ProfessionnelHistoriqueInteraction::class);
    }

//    /**
//     * @return ProfessionnelHistoriqueInteraction[] Returns an array of ProfessionnelHistoriqueInteraction objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('p.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?ProfessionnelHistoriqueInteraction
//    {
//        return $this->createQueryBuilder('p')
//            ->andWhere('p.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }

    public function professionnelValidation(
        Professionnel $professionnel,
        Administrateur $administrateur,
        StatutEnum $action,
        string $motif
    ): ProfessionnelHistoriqueInteraction {
        $entityManager = $this->getEntityManager();

        $interaction = new ProfessionnelHistoriqueInteraction();
        $interaction->setProfessionnel($professionnel);
        $interaction->setAdministrateur($administrateur);
        $interaction->setAction($action);
        $interaction->setMotifAction($motif);
        $interaction->setDate(new \DateTime('now'));

        $entityManager->persist($interaction);
        $entityManager->flush();

        return $interaction;
    }
}
