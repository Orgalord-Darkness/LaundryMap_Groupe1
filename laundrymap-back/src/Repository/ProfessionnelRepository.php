<?php

namespace App\Repository;

use App\Entity\Professionnel;
use App\Enum\StatutEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Professionnel>
 */
class ProfessionnelRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Professionnel::class);
    }

    //    /**
    //     * @return Professionnel[] Returns an array of Professionnel objects
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

    //    public function findOneBySomeField($value): ?Professionnel
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    public function findAllForAdmin(int $offset = 0, int $limit = 10, StatutEnum $statut = StatutEnum::EN_ATTENTE): array
    {
        return $this->createQueryBuilder('p')
            ->select('PARTIAL p.{id, siren, statut, date_validation}')
            ->addSelect('PARTIAL u.{id, nom, prenom, email}')
            ->addSelect('PARTIAL a.{id, adresse, rue, code_postal, ville, pays}')
            ->leftJoin('p.utilisateur', 'u')
            ->leftJoin('p.adresse', 'a')
            ->where('p.statut = :statut')
            ->setParameter('statut', $statut->value)
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->orderBy('p.id', 'ASC')
            ->getQuery()
            ->getArrayResult();

    }

    public function findOneWithDetails(int $id): ?array
    {
        $result = $this->createQueryBuilder('p')
            ->select('PARTIAL p.{id, siren, statut, date_validation}')
            ->addSelect('PARTIAL u.{id, nom, prenom, email}')
            ->addSelect('PARTIAL a.{id, adresse, rue, code_postal, ville, pays}')
            ->leftJoin('p.utilisateur', 'u')
            ->leftJoin('p.adresse', 'a')
            ->where('p.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getArrayResult();

        return $result[0] ?? null;
    }


    public function setStatut(Professionnel $professionnel, StatutEnum $statut): void
    {
        $professionnel->setStatut($statut);
        $professionnel->setDateValidation(new \DateTime());

        $em = $this->getEntityManager();
        $em->persist($professionnel);
        $em->flush();
    }
}
