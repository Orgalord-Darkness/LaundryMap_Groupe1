<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class CheckUserStatutListener
{
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event)
    {
        $user = $event->getUser();

        if ($user->getStatut() !== StatutCompte::VALIDE) {
            throw new AuthenticationException("Votre compte n'est pas encore validé.");
        }
    }
}
