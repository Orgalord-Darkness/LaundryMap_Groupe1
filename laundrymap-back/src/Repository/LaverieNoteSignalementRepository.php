<?php

namespace App\Repository;

use App\Entity\LaverieNote;
use App\Entity\LaverieNoteSignalement;
use App\Entity\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LaverieNoteSignalement>
 */
class LaverieNoteSignalementRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LaverieNoteSignalement::class);
    }

    //    /**
    //     * @return LaverieNoteSignalement[] Returns an array of LaverieNoteSignalement objects
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

    //    public function findOneBySomeField($value): ?LaverieNoteSignalement
    //    {
    //        return $this->createQueryBuilder('l')
    //            ->andWhere('l.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    public function save(LaverieNoteSignalement $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findIneSignalementByUserId(Utilisateur $utilisateur, LaverieNoteSignalement $laverieNoteSignalement): ?LaverieNoteSignalement
    {
        return $this->createQueryBuilder('l')
            ->andWhere('l.utilisateur = :utilisateur')
            ->andWhere('l.laverie_note = :laverieNoteSignalement')
            ->setParameter('utilisateur', $utilisateur)
            ->setParameter('laverieNoteSignalement', $laverieNoteSignalement)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }

    public function countByNote(LaverieNote $note): int
    {
        return (int) $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->andWhere('l.laverie_note = :note')
            ->setParameter('note', $note)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }

    public function countByUtilisateurSince(Utilisateur $utilisateur, \DateTimeInterface $since): int
    {
        return (int) $this->createQueryBuilder('l')
            ->select('COUNT(l.id)')
            ->andWhere('l.utilisateur = :utilisateur')
            ->andWhere('l.date >= :since')
            ->setParameter('utilisateur', $utilisateur)
            ->setParameter('since', $since)
            ->getQuery()
            ->getSingleScalarResult()
        ;
    }
}
