<?php

namespace App\EventListener;

use App\Entity\Utilisateur;
use App\Enum\RoleEnum;
use App\Enum\StatutEnum;
use App\Repository\ProfessionnelRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;

class JWTCreatedListener
{
    public function __construct(
        private ProfessionnelRepository $professionnelRepository
    ) {}

    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        $user = $event->getUser();
        $payload = $event->getData();

        if ($user instanceof Utilisateur) {
            $professionnel = $this->professionnelRepository
                ->findOneBy(['utilisateur' => $user]);

            if ($professionnel !== null && $professionnel->getStatut() === StatutEnum::VALIDE) {
                $payload['roles'] = [RoleEnum::PRO->value];
            }
        }

        $event->setData($payload);
    }
}