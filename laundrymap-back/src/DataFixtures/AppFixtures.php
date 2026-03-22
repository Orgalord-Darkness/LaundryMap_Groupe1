<?php

// src/DataFixtures/AppFixtures.php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

use App\Entity\Utilisateur;
use App\Entity\Administrateur;
use App\Entity\Professionnel;
use App\Entity\Adresse;
use App\Entity\Langue;
use App\Entity\Laverie;
use App\Entity\LaverieEquipement;
use App\Entity\LaverieFermeture;
use App\Entity\LaverieFermetureExceptionnelle;
use App\Entity\LaverieHistoriqueInteraction;
use App\Entity\LaverieMedia;
use App\Entity\LaverieNote;
use App\Entity\LaverieNoteSignalement;
use App\Entity\Media;
use App\Entity\MethodePaiement;
use App\Entity\MotInjurieux;
use App\Entity\ProfessionnelHistoriqueInteraction;
use App\Entity\Service;
use App\Entity\UtilisateurHistoriqueInteraction;
use App\Entity\UtilisateurPreference;

use App\Enum\EquipementEnum;
use App\Enum\GeoStatutEnum;
use App\Enum\JourEnum;
use App\Enum\LaverieStatutEnum;
use App\Enum\StatutEnum;
use App\Enum\ThemeEnum;


class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $hasher
    ) {}

    public function load(ObjectManager $manager): void
    {

         
        // Données pour les utilisateurs (mdp de base = user123)
         
        $usersData = [
            [
                'email'                   => 'luce@example.net',
                'nom'                     => 'Luce',
                'prenom'                  => 'Édith',
                'mot_de_passe'            => 'user123',
                'statut'                  => StatutEnum::VALIDE,
                'date_creation'           => new \DateTime('2026-01-01 20:39:20'),
                'date_modification'       => new \DateTime('2026-03-02 06:57:11'),
                'oauth_id'                => '18738c57-9312-4e97-adbb-a0c59ff338cd',
                'date_derniere_connexion' => new \DateTime('2026-03-03 05:23:02'),
            ],
            [
                'email'                   => 'roussel@example.net',
                'nom'                     => 'Roussel',
                'prenom'                  => 'Olivier',
                'mot_de_passe'            => 'user123',
                'statut'                  => StatutEnum::VALIDE,
                'date_creation'           => new \DateTime('2026-01-18 05:38:06'),
                'date_modification'       => new \DateTime('2026-03-02 00:42:12'),
                'oauth_id'                => 'e88d8c2a-3bc2-4cf8-83e0-52d90dfbacdf',
                'date_derniere_connexion' => new \DateTime('2026-03-02 09:47:26'),
            ],
            [
                'email'                   => 'buisson@example.net',
                'nom'                     => 'Buisson',
                'prenom'                  => 'Léon',
                'mot_de_passe'            => 'user123',
                'statut'                  => StatutEnum::EN_ATTENTE,
                'date_creation'           => new \DateTime('2026-03-01 05:57:31'),
                'date_modification'       => new \DateTime('2026-03-03 04:22:25'),
                'oauth_id'                => '1feaf813-001a-4e55-95e7-a2c8ff4134bc',
                'date_derniere_connexion' => new \DateTime('2026-03-03 17:00:26'),
            ],
            [
                'email'                   => 'lambert@example.net',
                'nom'                     => 'Lambert',
                'prenom'                  => 'Thomas',
                'mot_de_passe'            => 'user123',
                'statut'                  => StatutEnum::EN_ATTENTE,
                'date_creation'           => new \DateTime('2026-02-15 10:42:38'),
                'date_modification'       => new \DateTime('2026-03-01 15:05:44'),
                'oauth_id'                => '9fa11d9b-e1f7-4337-b93d-5bc4fe6f91ae',
                'date_derniere_connexion' => new \DateTime('2026-03-04 07:48:04'),
            ],
            [
                'email'                   => 'deschampsdiane@example.net',
                'nom'                     => 'Deschamps',
                'prenom'                  => 'Diane',
                'mot_de_passe'            => 'user123',
                'statut'                  => StatutEnum::REFUSE,
                'date_creation'           => new \DateTime('2026-01-28 11:18:08'),
                'date_modification'       => new \DateTime('2026-03-01 13:56:50'),
                'oauth_id'                => '62b176b7-42b4-489a-878b-9eab34119d72',
                'date_derniere_connexion' => new \DateTime('2026-03-04 03:30:17'),
            ],
        ];

        $users = [];
        foreach ($usersData as $userData) {
            $user = new Utilisateur();
            $user->setEmail($userData['email']);
            $user->setNom($userData['nom']);
            $user->setPrenom($userData['prenom']);
            $user->setMotDePasse(
                $this->hasher->hashPassword($user, $userData['mot_de_passe'])
            );
            $user->setStatut($userData['statut']);
            $user->setDateCreation($userData['date_creation']);
            $user->setDateModification($userData['date_modification']);
            $user->setOauthId($userData['oauth_id']);
            $user->setDateDerniereConnexion($userData['date_derniere_connexion']);

            $manager->persist($user);
            $users[] = $user;
        }
        // $users[0] = Luce      | $users[1] = Roussel
        // $users[2] = Buisson   | $users[3] = Lambert
        // $users[4] = Deschamps


         
        // ADMINISTRATEUR
         
        $admin = new Administrateur();
        $admin->setEmail('admin@example.com');
        $admin->setMotDePasse(
            $this->hasher->hashPassword($admin, 'admin123')
        );

        $manager->persist($admin);


         
        // ADRESSES
         
        $adressesData = [
            [
                'adresse'                => '123',
                'rue'                    => 'Rue de la Laverie',
                'code_postal'            => '75001',
                'ville'                  => 'Paris',
                'pays'                   => 'France',
                'latitude'               => 48.8566,
                'longitude'              => 2.3522,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '12',
                'rue'                    => 'Rue du Général de Gaulle',
                'code_postal'            => '75001',
                'ville'                  => 'Paris',
                'pays'                   => 'France',
                'latitude'               => 48.8566,
                'longitude'              => 2.3522,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '45',
                'rue'                    => 'Avenue du Lavage',
                'code_postal'            => '69001',
                'ville'                  => 'Lyon',
                'pays'                   => 'France',
                'latitude'               => 45.4528,
                'longitude'              => 4.4956,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '5',
                'rue'                    => 'Avenue de la Fontaine',
                'code_postal'            => '69001',
                'ville'                  => 'Lyon',
                'pays'                   => 'France',
                'latitude'               => 45.4529,
                'longitude'              => 4.4957,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
        ];

        $adresses = [];
        foreach ($adressesData as $adresseData) {
            $adresse = new Adresse();
            $adresse->setAdresse($adresseData['adresse']);
            $adresse->setRue($adresseData['rue']);
            $adresse->setCodePostal($adresseData['code_postal']);
            $adresse->setVille($adresseData['ville']);
            $adresse->setPays($adresseData['pays']);
            $adresse->setLatitude($adresseData['latitude']);
            $adresse->setLongitude($adresseData['longitude']);
            $adresse->setStatutGeolocalisation($adresseData['statut_geolocalisation']);

            $manager->persist($adresse);
            $adresses[] = $adresse;
        }
        // $adresses[0] = Paris Laverie  | $adresses[1] = Paris Gaulle
        // $adresses[2] = Lyon Lavage    | $adresses[3] = Lyon Fontaine


         
        // PROFESSIONNELS
         
        // Lambert ($users[3]) et Deschamps ($users[4]) sont professionnels
        // $professionnels[0] = Lambert  |  $professionnels[1] = Deschamps

        $professionnalsData = [
            [
                'utilisateur'     => $users[3], // Lambert
                'siren'           => '362 521 879',
                'statut'          => StatutEnum::VALIDE,
                'date_validation' => new \DateTime('2026-01-02 20:40:20'),
                'adresse'         => $adresses[0],
            ],
            [
                'utilisateur'     => $users[4], // Deschamps
                'siren'           => '362 521 880',
                'statut'          => StatutEnum::EN_ATTENTE,
                'date_validation' => new \DateTime('2026-01-02 20:40:20'),
                'adresse'         => $adresses[1],
            ],
        ];

        $professionnels = [];
        foreach ($professionnalsData as $professionnalData) {
            $professionnel = new Professionnel();
            $professionnel->setSiren($professionnalData['siren']);
            $professionnel->setStatut($professionnalData['statut']);
            $professionnel->setDateValidation($professionnalData['date_validation']);
            $professionnel->setUtilisateurId($professionnalData['utilisateur']);
            $professionnel->setAdresseId($professionnalData['adresse']);

            $manager->persist($professionnel);
            $professionnels[] = $professionnel;
        }


         
        // LANGUES
         
        $langueData = [
            ['nom' => 'Français'],
            ['nom' => 'Anglais'],
            ['nom' => 'Allemand'],
            ['nom' => 'Espagnol'],
        ];

        $langues = [];
        foreach ($langueData as $data) {
            $langue = new Langue();
            $langue->setNom($data['nom']);

            $manager->persist($langue);
            $langues[] = $langue;
        }
        // $langues[0] = Français | $langues[1] = Anglais
        // $langues[2] = Allemand | $langues[3] = Espagnol




        // MEDIAS
         

        $mediaData = [
            [
                'emplacement'  => 'uploads/medias/media1.png',
                'nom_original' => 'media1.png',
                'poids'        => 50,
                'mime_type'    => 'image/png',
            ],
            [
                'emplacement'  => 'uploads/medias/media2.png',
                'nom_original' => 'media2.png',
                'poids'        => 50,
                'mime_type'    => 'image/png',
            ],
        ];

        $medias = [];
        foreach ($mediaData as $data) {
            $media = new Media();
            $media->setEmplacement($data['emplacement']);
            $media->setNomOriginal($data['nom_original']);
            $media->setPoids($data['poids']);
            $media->setMimeType($data['mime_type']);

            $manager->persist($media);
            $medias[] = $media;
        }
        // $medias[0] = media1 | $medias[1] = media2



         
        // LAVERIES
        $laundryData = [
            [
                'professionnel'     => $professionnels[0], // Lambert
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => 1,
                'nom_etablissement' => 'Laverie Express',
                'contact_email'     => 'contact@laverieexpress.com',
                'description'       => 'Laverie rapide et efficace proche de chez vous.',
                'adresse'           => $adresses[0],
                'date_ajout'        => new \DateTime('2026-01-02 20:40:20'),
                'date_modification' => new \DateTime('2026-01-02 20:40:20'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0], // Lambert
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => 1,
                'nom_etablissement' => 'Laverie Express 2',
                'contact_email'     => 'contact@laverieexpress.com',
                'description'       => 'Laverie rapide et efficace proche de chez vous.',
                'adresse'           => $adresses[1],
                'date_ajout'        => new \DateTime('2026-01-02 20:40:20'),
                'date_modification' => new \DateTime('2026-01-02 20:40:20'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[1], // Deschamps
                'statut'            => LaverieStatutEnum::EN_ATTENTE,
                'wi_line_reference' => 2,
                'nom_etablissement' => 'AutoLaverie',
                'contact_email'     => 'contact@autolaverie.com',
                'description'       => 'AutoLaverie, Laverie rapide partout en France.',
                'adresse'           => $adresses[2],
                'date_ajout'        => new \DateTime('2026-01-03 20:41:20'),
                'date_modification' => new \DateTime('2026-01-03 20:42:20'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[1], // Deschamps
                'statut'            => LaverieStatutEnum::REFUSE,
                'wi_line_reference' => 2,
                'nom_etablissement' => 'AutoLaverie 2',
                'contact_email'     => 'contact@autolaverie.com',
                'description'       => 'AutoLaverie, Laverie rapide partout en France.',
                'adresse'           => $adresses[3],
                'date_ajout'        => new \DateTime('2026-01-03 20:43:20'),
                'date_modification' => new \DateTime('2026-01-03 20:44:20'),
                'supprimee_le'      => null,
            ],
        ];

        $laveries = [];
        foreach ($laundryData as $data) {
            $laverie = new Laverie();
            $laverie->setProfessionnelId($data['professionnel']); // setProfessionnelId & setAdresseId semble non créé/utilisé dans laverie.php
            $laverie->setStatut($data['statut']);
            $laverie->setWiLineReference($data['wi_line_reference']);
            $laverie->setNomEtablissement($data['nom_etablissement']);
            $laverie->setContactEmail($data['contact_email']);
            $laverie->setDescription($data['description']);
            $laverie->setAdresseId($data['adresse']);
            $laverie->setDateAjout($data['date_ajout']);
            $laverie->setDateModification($data['date_modification']);
            $laverie->setSupprimeLe($data['supprimee_le']);
            $laverie->setLogo($medias[0]);

            $manager->persist($laverie);
            $laveries[] = $laverie;
        }
        // $laveries[0] = Laverie Express    | $laveries[1] = Laverie Express 2
        // $laveries[2] = AutoLaverie        | $laveries[3] = AutoLaverie 2


         
        // LAVERIE NOTES
         

        $laverieNotesData = [
            [
                'laverie'                    => $laveries[0],
                'utilisateur'                => $users[0], // Luce
                'note'                       => 4,
                'note_le'                    => new \DateTime('2026-01-04 12:00:00'),
                'commentaire'                => 'Très bonne laverie, service rapide et efficace.',
                'commente_le'                => new \DateTime('2026-01-05 14:30:00'),
                'reponse'                    => 'Merci pour votre avis positif ! Nous sommes ravis que vous ayez apprécié notre service.',
                'repond_le'                  => new \DateTime('2026-01-06 09:00:00'),
                'commentaire_supprime_motif' => null,
                'commentaire_supprime_le'    => null,
            ],
            [
                'laverie'                    => $laveries[1],
                'utilisateur'                => $users[1], // Roussel
                'note'                       => 2,
                'note_le'                    => new \DateTime('2026-01-04 12:00:00'),
                'commentaire'                => 'Mauvaise laverie, service lent et inefficace.',
                'commente_le'                => new \DateTime('2026-01-05 14:30:00'),
                'reponse'                    => 'Merci pour votre avis.',
                'repond_le'                  => new \DateTime('2026-01-06 09:00:00'),
                'commentaire_supprime_motif' => null,
                'commentaire_supprime_le'    => null,
            ],
        ];

        foreach ($laverieNotesData as $data) {
            $laverieNote = new LaverieNote();
            $laverieNote->setLaverieId($data['laverie']);
            $laverieNote->setUtilisateurId($data['utilisateur']);
            $laverieNote->setNote($data['note']);
            $laverieNote->setNoteLe($data['note_le']);
            $laverieNote->setCommentaire($data['commentaire']);
            $laverieNote->setCommentaireLe($data['commente_le']);
            $laverieNote->setReponse($data['reponse']);
            $laverieNote->setRepondLe($data['repond_le']);
            $laverieNote->setCommentaireSupprimeMotif($data['commentaire_supprime_motif']);
            $laverieNote->setCommentaireSupprimeLe($data['commentaire_supprime_le']);

            $manager->persist($laverieNote);
        }


         
        // LAVERIE EQUIPEMENTS
         
        $laverieEquipmentData = [
            [
                'laverie'              => $laveries[0],
                'equipement_reference' => 1,
                'nom'                  => 'Machine à laver',
                'type'                 => EquipementEnum::BANC,
                'capacite'             => 7,
                'tarif'                => 3.00,
                'duree'                => 30,
            ],
            [
                'laverie'              => $laveries[1],
                'equipement_reference' => 2,
                'nom'                  => 'Machine à laver',
                'type'                 => EquipementEnum::DISTRIBUTEUR_LESSIVE,
                'capacite'             => 10,
                'tarif'                => 5.00,
                'duree'                => 45,
            ],
        ];

        foreach ($laverieEquipmentData as $data) {
            $laverieEquipment = new LaverieEquipement();
            $laverieEquipment->setLaverieId($data['laverie']);
            $laverieEquipment->setEquipementReference($data['equipement_reference']);
            $laverieEquipment->setNom($data['nom']);
            $laverieEquipment->setType($data['type']);
            $laverieEquipment->setCapacite($data['capacite']);
            $laverieEquipment->setTarif($data['tarif']);
            $laverieEquipment->setDuree($data['duree']);

            $manager->persist($laverieEquipment);
        }


         
        // LAVERIE FERMETURE (horaires)

        $laverieFermetureData = [
            [
                'laverie'           => $laveries[0],
                'jour'              => JourEnum::LUNDI,
                'date_ajout'        => new \DateTime('2026-01-05 14:30:00'),
                'date_modification' => new \DateTime('2026-01-05 15:30:00'),
                'heure_debut'       => new \DateTime('1970-01-01 08:30:00'),
                'heure_fin'         => new \DateTime('1970-01-01 19:30:00'),
            ],
            [
                'laverie'           => $laveries[1],
                'jour'              => JourEnum::LUNDI,
                'date_ajout'        => new \DateTime('2026-01-05 14:30:00'),
                'date_modification' => new \DateTime('2026-01-05 15:30:00'),
                'heure_debut'       => new \DateTime('1970-01-01 08:30:00'),
                'heure_fin'         => new \DateTime('1970-01-01 19:30:00'),
            ],
        ];

        foreach ($laverieFermetureData as $data) {
            $laverieFermeture = new LaverieFermeture();
            $laverieFermeture->setLaverieId($data['laverie']);
            $laverieFermeture->setJour($data['jour']);
            $laverieFermeture->setDateAjout($data['date_ajout']);
            $laverieFermeture->setDateModification($data['date_modification']);
            $laverieFermeture->setHeureDebut($data['heure_debut']);
            $laverieFermeture->setHeureFin($data['heure_fin']);

            $manager->persist($laverieFermeture);
        }




         
        // LAVERIE MEDIA
        $laverieMediaData = [
            [
                'laverie'     => $laveries[0],
                'media'       => $medias[0],
                'description' => 'Logo',
            ],
            [
                'laverie'     => $laveries[1],
                'media'       => $medias[1],
                'description' => 'Image logo',
            ],
        ];

        foreach ($laverieMediaData as $data) {
            $laverieMedia = new LaverieMedia();
            $laverieMedia->setLaverie($data['laverie']);
            $laverieMedia->setMedia($data['media']);
            $laverieMedia->setDescription($data['description']);

            $manager->persist($laverieMedia);
        }


         
        // METHODES DE PAIEMENT
         
        $methodePaiementData = [
            ['nom' => 'Carte Bleue'],
            ['nom' => 'Billet'],
            ['nom' => 'Pièces'],
            ['nom' => 'Carte Fidélité'],
        ];

        foreach ($methodePaiementData as $data) {
            $methodePaiement = new MethodePaiement();
            $methodePaiement->setNom($data['nom']);
            $manager->persist($methodePaiement);
        }


         
        // MOTS INJURIEUX
         
        $motInjurieuxData = [
            ['label' => 'connard'],
            ['label' => 'pute'],
            ['label' => 'merde'],
            ['label' => 'fuck'],
            ['label' => 'salaud'],
        ];

        foreach ($motInjurieuxData as $data) {
            $motInjurieux = new MotInjurieux();
            $motInjurieux->setLabel($data['label']);
            $manager->persist($motInjurieux);
        }


         
        // SERVICES
         
        $serviceData = [
            ['nom' => 'Distributeur de lessive'],
            ['nom' => 'Wi-Fi'],
            ['nom' => 'Table'],
            ['nom' => 'Parking'],
            ['nom' => 'Distributeur de snack'],
        ];

        foreach ($serviceData as $data) {
            $service = new Service();
            $service->setNom($data['nom']);
            $manager->persist($service);
        }


         
        // PREFERENCES UTILISATEURS

        $utilisateurPreferenceData = [
            ['utilisateur' => $users[0], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $users[1], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $users[2], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $users[3], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $users[4], 'theme' => ThemeEnum::CLAIR, 'notifications' => false, 'langue' => $langues[0]],
        ];

        foreach ($utilisateurPreferenceData as $data) {
            $preference = new UtilisateurPreference();
            $preference->setTheme($data['theme']);
            $preference->setNotifications($data['notifications']);
            $preference->setLangueId($data['langue']);
            $preference->setUtilisateur($data['utilisateur']);
            $manager->persist($preference);
        }

         

        $manager->flush();
    }
}
