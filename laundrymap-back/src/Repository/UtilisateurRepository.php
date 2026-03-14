<?php

namespace App\Repository;

use App\Entity\Utilisateur;
use App\Enum\StatutEnum; 
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Utilisateur>
 */
class UtilisateurRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Utilisateur::class);
    }

    public function inscription(Utilisateur $utilisateur): void 
    {
        $requete = $this->getEntityManager(); 
        $requete->persist($utilisateur); 
        $requete->flush(); 

    }

    //    /**
    //     * @return Utilisateur[] Returns an array of Utilisateur objects
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

    //    public function findOneBySomeField($value): ?Utilisateur
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    /**
     * Trouve un utilisateur par son email
     */
    public function findOneByEmail(string $email): ?Utilisateur
    {
        $queryBuilder = $this->createQueryBuilder('u');
        $queryBuilder->andWhere('u.email = :email')
            ->setParameter('email', $email); 
        return $queryBuilder->getQuery()->getOneOrNullResult();
    }

    /**
     * Vérifie si un email est déjà utilisé
     */
    public function emailExiste(string $email): bool
    {
        return $this->findOneByEmail($email) !== null;
    }

    /**
     * Trouve un utilisateur par son OAuth ID
     */
    public function findOneByOauthId(string $oauthId): ?Utilisateur
    {
        return $this->findOneBy(['oauth_id' => $oauthId]);
    }

    /**
     * Trouve tous les utilisateurs actifs
     */
    public function findAllActifs(): array
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.statut = :statut')
            ->setParameter('statut', StatutEnum::VALIDE)
            ->orderBy('u.date_creation', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Trouve un utilisateur actif par son email (utile pour la connexion)
     */
    public function findActifByEmail(string $email): ?Utilisateur
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.email = :email')
            ->andWhere('u.statut = :statut')
            ->setParameter('email', $email)
            ->setParameter('statut', StatutEnum::VALIDE)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Met à jour la date de dernière connexion
     */
    public function updateDateDerniereConnexion(Utilisateur $utilisateur): void
    {
        $utilisateur->setDateDerniereConnexion(new \DateTime());
        $utilisateur->setDateModification(new \DateTime());
        $this->getEntityManager()->flush();
    }

    /**
     * Pagination des utilisateurs
     */
    public function findPaginated(int $page = 1, int $limit = 10): array
    {
        $offset = ($page - 1) * $limit;

        $utilisateurs = $this->createQueryBuilder('u')
            ->orderBy('u.date_creation', 'DESC')
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();

        $total = $this->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->getQuery()
            ->getSingleScalarResult();

        return [
            'data'       => $utilisateurs,
            'total'      => $total,
            'page'       => $page,
            'limit'      => $limit,
            'totalPages' => ceil($total / $limit),
        ];
    }

    public function updateUser(Utilisateur $utilisateur): void
    {
        $queryBuilder = $this->getEntityManager()->createQueryBuilder();
        $queryBuilder->update(Utilisateur::class, 'u')
            ->set('u.nom', ':nom')
            ->set('u.prenom', ':prenom')
            ->set('u.mot_de_passe', ':motDePasse')
            ->where('u.id = :id')
            ->setParameter('id', $utilisateur->getId())
            ->setParameter('nom', $utilisateur->getNom())
            ->setParameter('prenom', $utilisateur->getPrenom())
            ->setParameter('motDePasse', $utilisateur->getMotdePasse())
            ->getQuery()
            ->execute();
        $this->getEntityManager()->flush();
    }   
}
