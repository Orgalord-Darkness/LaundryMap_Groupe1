<?php

namespace App\Service;

use App\Entity\Media;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileUploader
{
    public function __construct(
        private readonly string $frontendPublicDir,
        private readonly EntityManagerInterface $em,
    ) {}

    /**
     * Enregistre un fichier uploadé dans laundrymap-front/public/fichiers/{subfolder}/.
     * Stocke un chemin relatif (/fichiers/{subfolder}/filename) dans Media.emplacement.
     * Retourne null si le fichier est invalide.
     */
    public function upload(UploadedFile $file, string $subfolder = 'images'): ?Media
    {
        if (!$file->isValid()) {
            return null;
        }

        $uploadDir = $this->frontendPublicDir . '/fichiers/' . $subfolder;

        $originalName = $file->getClientOriginalName();
        $mimeType     = $file->getMimeType() ?? 'application/octet-stream';
        $size         = $file->getSize();
        $newFilename  = uniqid('media_', true) . '.' . $file->guessExtension();

        $file->move($uploadDir, $newFilename);

        $media = new Media();
        $media->setEmplacement('/fichiers/' . $subfolder . '/' . $newFilename);
        $media->setNomOriginal($originalName);
        $media->setPoids((int) $size);
        $media->setMimeType($mimeType);

        $this->em->persist($media);

        return $media;
    }
}
