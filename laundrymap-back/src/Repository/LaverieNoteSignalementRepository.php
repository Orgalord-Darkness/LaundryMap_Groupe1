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

    public function findOneSignalementByUserId(Utilisateur $utilisateur, LaverieNoteSignalement $laverieNoteSignalement): ?LaverieNoteSignalement
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

    public function getSignalements(): array {
        return $this->createQueryBuilder('lns')
            ->select(
                'lns.id',
                'lns.motif',
                'lns.commentaire',
                'lns.date',
                'ln.id AS laverie_note_id',
                'ln.commentaire AS laverie_note_commentaire',
                'ln.note',
                'u.prenom AS auteur_prenom',
                'u.nom AS auteur_nom',
                'l.nom_etablissement AS laverie_nom'
            )
            ->join('lns.laverie_note', 'ln')
            ->join('ln.utilisateur', 'u')
            ->join('ln.laverie', 'l')
            ->getQuery()
            ->getArrayResult();
    }

    public function getSignalementById(int $id): array {
        return $this->createQueryBuilder('lns')
            ->select(
                'lns.id',
                'lns.motif',
                'lns.commentaire',
                'lns.date',
                'ln.id AS laverie_note_id',
                'ln.commentaire AS laverie_note_commentaire',
                'ln.note'
            )
            ->join('lns.laverie_note', 'ln')
            ->where('lns.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getArrayResult();
    }

    public function deleteSignalements(LaverieNoteSignalement $laverieNoteSignalement): void {
        $this->getEntityManager()->remove($laverieNoteSignalement);
        $this->getEntityManager()->flush();
    }

    /**
     * TODO(human) — Implémente cette méthode.
     *
     * Retourne toutes les lignes (signalement, note, auteur) pour les commentaires signalés.
     * Chaque ligne représente UN signalement sur UNE note d'UN auteur.
     * Le controller se chargera d'agréger ces lignes par utilisateur.
     *
     * Indices :
     * - Modèle : regarde getSignalements() juste au-dessus — mêmes jointures de base
     * - Jointures nécessaires :
     *     ->join('lns.laverie_note', 'ln')   ← le commentaire
     *     ->join('ln.utilisateur', 'u')      ← l'AUTEUR du commentaire (pas le reporter !)
     * - SELECT à construire : user_id, nom, prenom, email, statut, note_id, note_commentaire
     *   Plus besoin de groupBy ici — on retourne toutes les lignes brutes
     * - Trier par u.id pour faciliter l'agrégation PHP côté controller
     */
    public function getUtilisateursSignales(): array
    {
        // TODO(human) : construire le QueryBuilder ici
        return $this->createQueryBuilder('lns')
        ->select(
            'u.id AS user_id', 
            'u.nom',
            'u.prenom',
            'u.email',
            'u.statut',
            'ln.id AS note_id',
            'ln.commentaire AS note_commentaire'
        )
        ->join('lns.laverie_note', 'ln')
        ->join('ln.utilisateur', 'u')
        ->orderBy('u.id', 'ASC')
        ->getQuery()
        ->getArrayResult();
    }
}
