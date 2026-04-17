<?php 

namespace App\Repository; 

 use App\Entity\Laverie;
 use App\Entity\Utilisateur;
 use Doctrine\ORM\EntityManagerInterface;

 class FavoriRepository {

     public function __construct(private EntityManagerInterface $em) {}

     public function findByUser(Utilisateur $user): array
     {
        return $this->em->createQueryBuilder()
            ->select('l', 'a')
            ->from(Laverie::class, 'l')
            ->join('l.adresse', 'a')
            ->join('l.favoris', 'u')
            ->where('u.id = :userId')
            ->andWhere('l.supprime_le IS NULL')
            ->setParameter('userId', $user->getId())
            ->getQuery()
            ->getResult();
    }

     public function removeFavori(Utilisateur $user, Laverie $laverie): void
     {
         $laverie->removeFavori($user);
         $this->em->flush();
     }

 }