<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use App\Entity\Utilisateur;

class EmailVerificationService
{
    public function __construct(
        private MailerInterface $mailer,
        private UrlGeneratorInterface $urlGenerator,
        private JWTTokenManagerInterface $jwtManager
    ) {}


    private function generateVerificationToken(Utilisateur $user): string
    {
        $payload = [
            'user_id' => $user->getId(),
            'purpose' => 'email_validation',
            'exp' => time() + 900 // 15 minutes
        ];

        return $this->jwtManager->createFromPayload($user, $payload);
    }

    public function sendVerificationEmail(Utilisateur $user): void
    {
        // Génération du token JWT
        $token = $this->generateVerificationToken($user);

        // Construction de l'URL de validation
        $url = $this->urlGenerator->generate(
            'app_valider_email',
            ['token' => $token],
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        // Email
        $email = (new Email())
            ->from('no-reply@laundrymap.com')
            ->to($user->getEmail())
            ->subject('Vérifiez votre adresse email')
            ->html("
                <p>Bonjour {$user->getPrenom()},</p>
                <p>Merci pour votre inscription. Cliquez sur le lien ci-dessous pour valider votre compte :</p>
                <p><a href='$url'>Valider mon compte</a></p>
                <p>Ce lien expire dans 15 minutes.</p>
            ");

        $this->mailer->send($email);
    }
}
