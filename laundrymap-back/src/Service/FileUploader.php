<?php

namespace App\Service;

use App\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileUploader
{
    public function __construct(
        private readonly string $uploadDir,
        private readonly EntityManagerInterface $em,
    ) {}

    /**
     * Enregistre un fichier uploadé sur le disque et persiste une entité Media.
     * Retourne null si le fichier est invalide.
     */
    public function upload(UploadedFile $file): ?Media
    {
        if (!$file->isValid()) {
            return null;
        }

        $originalName = $file->getClientOriginalName();
        $mimeType     = $file->getMimeType() ?? 'application/octet-stream';
        $size         = $file->getSize();
        $newFilename  = uniqid('media_', true) . '.' . $file->guessExtension();

        $file->move($this->uploadDir, $newFilename);

        $media = new Media();
        $media->setEmplacement($this->uploadDir . '/' . $newFilename);
        $media->setNomOriginal($originalName);
        $media->setPoids((int) $size);
        $media->setMimeType($mimeType);

        $this->em->persist($media);

        return $media;
    }
}