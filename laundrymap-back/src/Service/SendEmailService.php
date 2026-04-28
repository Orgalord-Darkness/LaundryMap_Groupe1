<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use App\Entity\Utilisateur;
use Twig\Environment;

class SendEmailService
{
    public function __construct(
        private MailerInterface $mailer,
        private UrlGeneratorInterface $urlGenerator,
        private JWTTokenManagerInterface $jwtManager,
        private Environment $twig
    ) {}

    public function sendEmail(string $email, string $template, string $subject, string $statut, string $laundryName, string $reason = null): void
    {

        $html = $this->twig->render('emails/'.$template, [
            'statut' => $statut,
            'name' => $laundryName,
            'reason' => $reason,
        ]);

        $email = (new Email())
            ->from('no-reply@laundrymap.com')
            ->to($email)
            ->subject($subject)
            ->html($html);

        $this->mailer->send($email);
    }
}
