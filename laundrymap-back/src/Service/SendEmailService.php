<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;

class SendEmailService
{
    public function __construct(
        private MailerInterface $mailer,
        private Environment $twig
    ) {}

    public function sendSignalementNotification(string $to, string $commentaire, string $motif): void
    {
        $html = $this->twig->render('emails/signalementCommentaire.html.twig', [
            'commentaire' => $commentaire,
            'motif'       => $motif,
        ]);

        $email = (new Email())
            ->from('no-reply@laundrymap.com')
            ->to($to)
            ->subject('Votre commentaire a été signalé')
            ->html($html);

        $this->mailer->send($email);
    }

    public function sendBannissementNotification(string $to, string $reason, ?\DateTime $expiresAt): void
    {
        $html = $this->twig->render('emails/bannissement.html.twig', [
            'reason'     => $reason,
            'expires_at' => $expiresAt,
        ]);

        $email = (new Email())
            ->from('no-reply@laundrymap.com')
            ->to($to)
            ->subject('Votre compte LaundryMap a été suspendu')
            ->html($html);

        $this->mailer->send($email);
    }

    public function sendReponseAvisNotification(string $to, string $prenom, string $nomLaverie, string $reponse): void
    {
        $html = $this->twig->render('emails/reponseAvis.html.twig', [
            'prenom'      => $prenom,
            'nom_laverie' => $nomLaverie,
            'reponse'     => $reponse,
        ]);

        $email = (new Email())
            ->from('no-reply@laundrymap.com')
            ->to($to)
            ->subject('Le gérant de ' . $nomLaverie . ' a répondu à votre avis')
            ->html($html);

        $this->mailer->send($email);
    }

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
