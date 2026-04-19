<?php 

namespace App\Repository; 

 use App\Entity\Laverie;
 use App\Entity\Utilisateur;
 use Doctrine\ORM\EntityManagerInterface;

 class FavoriRepository {

    public function __construct(private EntityManagerInterface $em) {}

    public function findByUser(Utilisateur $user, int $offset = 0, int $limit = 10): array
    {
        return $this->em->createQueryBuilder()
            ->select('l', 'a')
            ->from(Laverie::class, 'l')
            ->join('l.adresse', 'a')
            ->join('l.favoris', 'u')
            ->where('u.id = :userId')
            ->andWhere('l.supprime_le IS NULL')
            ->setParameter('userId', $user->getId())
            ->setFirstResult($offset)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countByUser(Utilisateur $user): int
    {
        return (int) $this->em->createQueryBuilder()
            ->select('COUNT(l.id)')
            ->from(Laverie::class, 'l')
            ->join('l.favoris', 'u')
            ->where('u.id = :userId')
            ->andWhere('l.supprime_le IS NULL')
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getSingleScalarResult();
    }


    public function removeFavori(Utilisateur $user, Laverie $laverie): void
    {
        $laverie->removeFavori($user);
        $this->em->flush();
    }

 }