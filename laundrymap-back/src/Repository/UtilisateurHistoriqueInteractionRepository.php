<?php

namespace App\Repository;

use App\Entity\Utilisateur;
use App\Entity\UtilisateurHistoriqueInteraction;
use App\Enum\StatutEnum;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UtilisateurHistoriqueInteraction>
 */
class UtilisateurHistoriqueInteractionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UtilisateurHistoriqueInteraction::class);
    }

    //    /**
    //     * @return UtilisateurHistoriqueInteraction[] Returns an array of UtilisateurHistoriqueInteraction objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    public function findBlocagesByUtilisateur(Utilisateur $user): array
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.utilisateur = :user')
            ->andWhere('h.action = :action')
            ->setParameter('user', $user)
            ->setParameter('action', StatutEnum::BANNI)
            ->orderBy('h.date', 'DESC')
            ->getQuery()
            ->getResult();
    }

    // DQL ne supporte pas UNION : fusionner les blocages et les validations de
    // compte pro en un seul flux trié/paginé nécessite du SQL natif.
    private const SOUS_REQUETE_INTERACTIONS = "
        SELECT 'BLOCAGE' AS type_interaction, h.id, h.date, h.action, h.motif_action,
               h.utilisateur_id, u.nom AS utilisateur_nom, u.prenom AS utilisateur_prenom, u.email AS utilisateur_email,
               h.administrateur_id, adm.email AS administrateur_email,
               CASE h.action WHEN 'BANNI' THEN 'BLOCAGE' WHEN 'VALIDE' THEN 'LEVEE_BLOCAGE' ELSE h.action END AS action_label
        FROM utilisateur_historique_interaction h
        JOIN utilisateur u ON u.id = h.utilisateur_id
        JOIN administrateur adm ON adm.id = h.administrateur_id
        WHERE h.action IN ('banni', 'validé')

        UNION ALL

        SELECT 'COMPTE_PRO', h.id, h.date, h.action, h.motif_action,
               p.utilisateur_id, u.nom, u.prenom, u.email,
               h.administrateur_id, adm.email,
               CASE h.action WHEN 'VALIDE' THEN 'VALIDATION_PRO' WHEN 'REFUSE' THEN 'REFUS_PRO' ELSE h.action END
        FROM professionnel_historique_interaction h
        JOIN professionnel p ON p.id = h.professionnel_id
        JOIN utilisateur u ON u.id = p.utilisateur_id
        JOIN administrateur adm ON adm.id = h.administrateur_id
        WHERE h.action IN ('validé', 'refusé')
    ";

    public function getHistoriqueInteractions(
        int $offset = 0,
        int $limit = 10,
        ?string $action = null,
        ?\DateTimeInterface $dateDebut = null,
        ?\DateTimeInterface $dateFin = null,
        ?string $utilisateur = null,
        ?string $motif = null,
    ): array {
        [$where, $params] = $this->buildWhereInteractions($action, $dateDebut, $dateFin, $utilisateur, $motif);

        // LIMIT/OFFSET interpolés directement : MariaDB refuse ces clauses en paramètres
        // liés (toujours quotés en chaîne par le driver), $limit/$offset sont déjà des int.
        $sql = 'SELECT * FROM (' . self::SOUS_REQUETE_INTERACTIONS . ') combined' . $where
            . " ORDER BY date DESC LIMIT {$limit} OFFSET {$offset}";

        return $this->getEntityManager()->getConnection()->fetchAllAssociative($sql, $params);
    }

    public function getHistoriqueInteractionsCount(
        ?string $action = null,
        ?\DateTimeInterface $dateDebut = null,
        ?\DateTimeInterface $dateFin = null,
        ?string $utilisateur = null,
        ?string $motif = null,
    ): int {
        [$where, $params] = $this->buildWhereInteractions($action, $dateDebut, $dateFin, $utilisateur, $motif);

        $sql = 'SELECT COUNT(*) FROM (' . self::SOUS_REQUETE_INTERACTIONS . ') combined' . $where;

        return (int) $this->getEntityManager()->getConnection()->fetchOne($sql, $params);
    }

    private function buildWhereInteractions(
        ?string $action,
        ?\DateTimeInterface $dateDebut,
        ?\DateTimeInterface $dateFin,
        ?string $utilisateur,
        ?string $motif,
    ): array {
        $conditions = [];
        $params = [];

        if ($action !== null) {
            $conditions[] = 'action_label = :action';
            $params['action'] = $action;
        }
        if ($dateDebut !== null) {
            $conditions[] = 'date >= :dateDebut';
            $params['dateDebut'] = $dateDebut->format('Y-m-d H:i:s');
        }
        if ($dateFin !== null) {
            $conditions[] = 'date <= :dateFin';
            $params['dateFin'] = $dateFin->format('Y-m-d H:i:s');
        }
        if ($utilisateur !== null) {
            $conditions[] = '(utilisateur_nom LIKE :utilisateur OR utilisateur_prenom LIKE :utilisateur OR utilisateur_email LIKE :utilisateur)';
            $params['utilisateur'] = '%' . $utilisateur . '%';
        }
        if ($motif !== null) {
            $conditions[] = 'motif_action LIKE :motif';
            $params['motif'] = '%' . $motif . '%';
        }

        if (empty($conditions)) {
            return ['', $params];
        }

        return [' WHERE ' . implode(' AND ', $conditions), $params];
    }
}
