<?php 

namespace App\Controller; 

use App\Entity\Laverie;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/laverie')]
class LaverieController extends AbstractController 
{
    #[Route('/edit/{id}', name: 'laverie_edit', methods: ['PUT'])]
    #[OA\Tag(name: 'Laverie')]
    #[OA\Parameter(
        name: 'id',
        in: 'path',
        description: 'ID de la laverie à modifier',
        required: true,
        schema: new OA\Schema(type: 'integer')
    )]
    #[OA\RequestBody(
        description: 'Données de la laverie à modifier',
        required: true,
        content: new OA\JsonContent(
            type: 'object',
            properties: [
                new OA\Property(
                    property: 'name',
                    type: 'string',
                    description: 'Nom de la laverie'
                ),
                new OA\Property(
                    property: 'description',
                    type: 'string',
                    description: 'Description de la laverie'
                ),
                new OA\Property(    
                    property: 'latitude',
                    type: 'number',
                    format: 'float',
                    description: 'Latitude de la laverie'
                ),
                new OA\Property(
                    property: 'longitude',  
                    type: 'number',
                    format: 'float',
                    description: 'Longitude de la laverie'
                ),
                new OA\Property(
                    property: 'address',
                    type: 'string',
                    description: 'Adresse de la laverie'
                )
            ]
        )    
    )] 
    public function edit(
        int $id,
        Request $request,
        EntityManagerInterface $em
    ): JsonResponse {   

        $laverie = $em->getRepository(Laverie::class)->find($id);

        if (!$laverie) {
            return $this->json(
                ['message' => 'Laverie non trouvée.'],
                Response::HTTP_NOT_FOUND
            );
        }

        $data = json_decode($request->getContent(), true);

        $modifiableFields = ['name', 'description', 'latitude', 'longitude', 'address'];

        foreach ($modifiableFields as $field) {
            if (isset($data[$field])) {
                $setter = 'set' . ucfirst($field);
                if (method_exists($laverie, $setter)) {
                    $laverie->$setter($data[$field]);
                }
            }
        }

        $em->persist($laverie);
        $em->flush();

        return $this->json(
            ['message' => 'Laverie mise à jour avec succès.'],
            Response::HTTP_OK
        );
    }
}