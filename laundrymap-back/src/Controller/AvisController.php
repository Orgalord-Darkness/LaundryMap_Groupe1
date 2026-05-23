<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

use App\Repository\LaverieNoteRepository;
use App\Entity\LaverieNote;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api/v1/utilisateur', name: 'utilisateur_')]
class AvisController extends AbstractController
{
    // GET : liste tous les avis de l'utilisateur connecté
    #[Route('/review', name: 'review_list', methods: ['GET'])]
    public function list(LaverieNoteRepository $laverieNoteRepository): JsonResponse
    {
        /** @var \App\Entity\Utilisateur $utilisateurActuel */
        $utilisateurActuel = $this->getUser();

        $notes = $laverieNoteRepository->findBy(
            ['utilisateur' => $utilisateurActuel],
            ['note_le' => 'DESC']
        );

        $data = array_map(function (LaverieNote $note) {
            return [
                'id'             => $note->getId(),
                'note'           => $note->getNote(),
                'note_le'        => $note->getNoteLe()?->format('Y-m-d H:i:s'),
                'commentaire'    => $note->getCommentaire(),
                'commentaire_le' => $note->getCommentaireLe()?->format('Y-m-d H:i:s'),
                'laverie'        => [
                    'id'  => $note->getLaverie()?->getId(),
                    'nom' => $note->getLaverie()?->getNomEtablissement(),
                ],
            ];
        }, $notes);

        return $this->json($data);
    }

    // DELETE : supprime un avis appartenant à l'utilisateur connecté
    #[Route('/review/{id}', name: 'review_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        LaverieNoteRepository $laverieNoteRepository,
        EntityManagerInterface $em
    ): JsonResponse {
        /** @var \App\Entity\Utilisateur $utilisateurActuel */
        $utilisateurActuel = $this->getUser();

        $note = $laverieNoteRepository->findOneBy([
            'id'          => $id,
            'utilisateur' => $utilisateurActuel,  // sécurité : l'avis doit appartenir à l'utilisateur
        ]);

        if (!$note) {
            return $this->json(
                ['message' => 'Avis introuvable ou accès refusé.'],
                JsonResponse::HTTP_NOT_FOUND
            );
        }

        $em->remove($note);
        $em->flush();

        return $this->json(
            ['message' => 'Avis supprimé avec succès.'],
            JsonResponse::HTTP_OK
        );
    }
}