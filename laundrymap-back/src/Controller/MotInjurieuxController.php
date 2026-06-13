<?php

namespace App\Controller;

use App\Entity\MotInjurieux;
use App\Repository\MotInjurieuxRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;


#[Route('/api/v1/admin/mots-interdits', name: 'api_mots_interdits_')]
class MotInjurieuxController extends AbstractController
{
    // GET /api/v1/admin/mots-interdits
    // Retourne la liste de tous les mots interdits
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(MotInjurieuxRepository $repo): JsonResponse
    {
        $mots = $repo->findAll();

        $data = array_map(fn(MotInjurieux $mot) => [
            'id'    => $mot->getId(),
            'label' => $mot->getLabel(),
        ], $mots);

        return $this->json($data);
    }

    // POST /api/v1/admin/mots-interdits
    // Ajoute un nouveau mot interdit
    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, MotInjurieuxRepository $repo): JsonResponse
    {
        $body = json_decode($request->getContent(), true);

        // Vérification : le champ "label" doit être présent et non vide
        if (empty($body['label'])) {
            return $this->json(['error' => 'Le champ "label" est obligatoire.'], 400);
        }

        $label = trim(mb_strtolower($body['label']));

        // Vérification que le mot n'existe pas déjà
        $existant = $repo->findOneBy(['label' => $label]);
        if ($existant) {
            return $this->json(['error' => 'Ce mot existe déjà dans la liste.'], 409);
        }

        $mot = new MotInjurieux();
        $mot->setLabel($label);

        $em->persist($mot);
        $em->flush();

        return $this->json([
            'id'    => $mot->getId(),
            'label' => $mot->getLabel(),
        ], 201);
    }

    // DELETE /api/v1/admin/mots-interdits/{id}
    // Supprime un mot interdit par son id
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id, MotInjurieuxRepository $repo, EntityManagerInterface $em): JsonResponse
    {
        $mot = $repo->find($id);

        if (!$mot) {
            return $this->json(['error' => 'Mot introuvable.'], 404);
        }

        $em->remove($mot);
        $em->flush();

        return $this->json(['message' => 'Mot supprimé avec succès.']);
    }
}