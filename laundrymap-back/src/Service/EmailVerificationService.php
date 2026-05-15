<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use App\Entity\Utilisateur;
use Twig\Environment;

class EmailVerificationService
{
    public function __construct(
        private MailerInterface $mailer,
        private UrlGeneratorInterface $urlGenerator,
        private JWTTokenManagerInterface $jwtManager,
        private Environment $twig
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

    public function generatePasswordResetToken(Utilisateur $user): string
    {
        $payload = [
            'user_id' => $user->getId(),
            'purpose' => 'password_reset',
            'exp'     => time() + 900, // 15 minutes
        ];

        return $this->jwtManager->createFromPayload($user, $payload);
    }

    public function sendPasswordResetEmail(Utilisateur $user, string $token): void
    {
        $frontendUrl = rtrim($_ENV['CORS_ALLOW_ORIGIN'], '/');
        $resetUrl    = $frontendUrl . '/user/mot-de-passe/reinitialisation/' . $token;

        $html = $this->twig->render('emails/resetPasswordEmail.html.twig', [
            'prenom'             => $user->getPrenom(),
            'url_reinitialisation' => $resetUrl,
        ]);

        $email = (new Email())
            ->from('no-reply@laundrymap.com')
            ->to($user->getEmail())
            ->subject('Réinitialisation de votre mot de passe - LaundryMap')
            ->html($html);

        $this->mailer->send($email);
    }

    public function sendVerificationEmail(Utilisateur $user): void
    {
        $token = $this->generateVerificationToken($user);

        $url = $this->urlGenerator->generate(
            'app_valider_email',
            ['token' => $token],
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        $html = $this->twig->render('emails/validationEmail.html.twig', [
            'prenom' => $user->getPrenom(),
            'url_validation' => $url
        ]);

        $email = (new Email())
            ->from('no-reply@laundrymap.com')
            ->to($user->getEmail())
            ->subject('Vérifiez votre adresse email')
            ->html($html);

        $this->mailer->send($email);
    }
}
