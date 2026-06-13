<?php

namespace App\Repository;

use App\Entity\LaverieHistoriqueInteraction;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\Laverie;
use App\Entity\Administrateur;
use App\Enum\LaverieStatutEnum;
use App\Enum\ActionEnum;
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

    public function laverieValidation(Laverie $laverie, Administrateur $administrateur, ActionEnum $action,  string $motif) 
    {

        $entityManager = $this->getEntityManager();

        $formatDate = new \DateTime('now');

        $laverieHistoriqueInteraction = new LaverieHistoriqueInteraction();
        $laverieHistoriqueInteraction->setLaverie($laverie);
        $laverieHistoriqueInteraction->setAdministrateur($administrateur);
        $laverieHistoriqueInteraction->setAction($action);
        $laverieHistoriqueInteraction->setMotifAction($motif);
        $laverieHistoriqueInteraction->setDate($formatDate);

        $entityManager->persist($laverieHistoriqueInteraction);
        $entityManager->flush();

        return $laverieHistoriqueInteraction;
    }



    public function getHistorique(
        int $offset = 0,
        int $limit = 10,
        ?string $action = null,
        ?\DateTimeInterface $dateDebut = null,
        ?\DateTimeInterface $dateFin = null,
        ?string $laverie = null,
        ?string $motif = null,
    ): ?array {
        $qb = $this->createQueryBuilder('h') //h.laverie est une relation ManyToOne Doctrine ne permet pas h.laverie_id IDENTITY(h.laverie) récupère l'ID de la relation
            ->select(
                'h.id',
                'h.date',
                'h.action',
                'h.motif_action',
                'IDENTITY(h.laverie) AS laverie_id',
                'l.nom_etablissement AS laverie_nom',
                'u.nom AS proprietaire_nom',
                'u.prenom AS proprietaire_prenom',
                'm.nom_original AS logo_nom',
                'IDENTITY(h.administrateur) AS administrateur_id',
                'adm.email AS administrateur_email'
            )
            ->join('h.laverie', 'l')
            ->join('l.professionnel', 'p')
            ->join('p.utilisateur', 'u')
            ->leftJoin('l.logo', 'm')
            ->join('h.administrateur', 'adm')
            ->orderBy('h.date', 'DESC');

        if ($action !== null) {
            $qb->andWhere('h.action = :action')->setParameter('action', $action);
        }
        if ($dateDebut !== null) {
            $qb->andWhere('h.date >= :dateDebut')->setParameter('dateDebut', $dateDebut);
        }
        if ($dateFin !== null) {
            $qb->andWhere('h.date <= :dateFin')->setParameter('dateFin', $dateFin);
        }
        if ($laverie !== null) {
            $qb->andWhere('l.nom_etablissement LIKE :laverie')->setParameter('laverie', '%' . $laverie . '%');
        }
        if ($motif !== null) {
            $qb->andWhere('h.motif_action LIKE :motif')->setParameter('motif', '%' . $motif . '%');
        }

        $qb->setFirstResult($offset)->setMaxResults($limit);

        return $qb->getQuery()->getArrayResult();
    }

    public function getHistoriqueCount(
        ?string $action = null,
        ?\DateTimeInterface $dateDebut = null,
        ?\DateTimeInterface $dateFin = null,
        ?string $laverie = null,
        ?string $motif = null,
    ): ?int {
        $qb = $this->createQueryBuilder('h')
            ->select('COUNT(h.id)')
            ->join('h.laverie', 'l');

        if ($action !== null) {
            $qb->andWhere('h.action = :action')->setParameter('action', $action);
        }
        if ($dateDebut !== null) {
            $qb->andWhere('h.date >= :dateDebut')->setParameter('dateDebut', $dateDebut);
        }
        if ($dateFin !== null) {
            $qb->andWhere('h.date <= :dateFin')->setParameter('dateFin', $dateFin);
        }
        if ($laverie !== null) {
            $qb->andWhere('l.nom_etablissement LIKE :laverie')->setParameter('laverie', '%' . $laverie . '%');
        }
        if ($motif !== null) {
            $qb->andWhere('h.motif_action LIKE :motif')->setParameter('motif', '%' . $motif . '%');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }


}
