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

use App\Enum\ActionEnum;
use App\Enum\EquipementEnum;
use App\Enum\GeoStatutEnum;
use App\Enum\JourEnum;
use App\Enum\LaverieStatutEnum;
use App\Enum\MotifEnum;
use App\Enum\RoleEnum;
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
                'mot_de_passe'            => 'Utilisateur1234.',
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
                'mot_de_passe'            => 'Utilisateur1234.',
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
                'mot_de_passe'            => 'Utilisateur1234.',
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
                'mot_de_passe'            => 'Utilisateur1234.',
                'statut'                  => StatutEnum::VALIDE,
                'date_creation'           => new \DateTime('2026-02-15 10:42:38'),
                'date_modification'       => new \DateTime('2026-03-01 15:05:44'),
                'oauth_id'                => '9fa11d9b-e1f7-4337-b93d-5bc4fe6f91ae',
                'date_derniere_connexion' => new \DateTime('2026-03-04 07:48:04'),
            ],
            [
                'email'                   => 'deschamps@example.net',
                'nom'                     => 'Deschamps',
                'prenom'                  => 'Diane',
                'mot_de_passe'            => 'Utilisateur1234.',
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

        // UTILISATEURS DE TEST — MODÉRATION (dédiés, n'interfèrent pas avec les fixtures existantes)

        $moderationUsersData = [
            [
                'email'                   => 'martin@example.net',
                'nom'                     => 'Martin',
                'prenom'                  => 'Sophie',
                'mot_de_passe'            => 'Utilisateur1234.',
                'statut'                  => StatutEnum::VALIDE,
                'date_creation'           => new \DateTime('2026-01-10 08:00:00'),
                'date_modification'       => new \DateTime('2026-03-01 10:00:00'),
                'oauth_id'                => 'a1b2c3d4-0001-4000-8000-000000000001',
                'date_derniere_connexion' => new \DateTime('2026-03-05 09:00:00'),
            ],
            [
                'email'                   => 'dubois@example.net',
                'nom'                     => 'Dubois',
                'prenom'                  => 'Karim',
                'mot_de_passe'            => 'Utilisateur1234.',
                'statut'                  => StatutEnum::VALIDE,
                'date_creation'           => new \DateTime('2026-01-12 09:00:00'),
                'date_modification'       => new \DateTime('2026-03-01 11:00:00'),
                'oauth_id'                => 'a1b2c3d4-0002-4000-8000-000000000002',
                'date_derniere_connexion' => new \DateTime('2026-03-05 10:00:00'),
            ],
            [
                'email'                   => 'petit@example.net',
                'nom'                     => 'Petit',
                'prenom'                  => 'Nora',
                'mot_de_passe'            => 'Utilisateur1234.',
                'statut'                  => StatutEnum::VALIDE,
                'date_creation'           => new \DateTime('2026-01-14 10:00:00'),
                'date_modification'       => new \DateTime('2026-03-01 12:00:00'),
                'oauth_id'                => 'a1b2c3d4-0003-4000-8000-000000000003',
                'date_derniere_connexion' => new \DateTime('2026-03-05 11:00:00'),
            ],
        ];

        $moderationUsers = [];
        foreach ($moderationUsersData as $userData) {
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
            $moderationUsers[] = $user;
        }
        // $moderationUsers[0] = Martin  (> seuil : 18 signalements)
        // $moderationUsers[1] = Dubois  (= seuil : 15 signalements)
        // $moderationUsers[2] = Petit   (< seuil :  6 signalements)



        // ADMINISTRATEUR
         
        $admin = new Administrateur();
        $admin->setEmail('admin@example.com');
        $admin->setMotDePasse(
            $this->hasher->hashPassword($admin, 'Admin1234.')
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
                'siren'           => 362521879,
                'statut'          => StatutEnum::VALIDE,
                'date_validation' => new \DateTime('2026-01-02 20:40:20'),
                'adresse'         => $adresses[0],
            ],
            [
                'utilisateur'     => $users[4], // Deschamps
                'siren'           => 362521880,
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




        // MÉDIAS LOGOS (20 fichiers — /fichiers/logo/)
        // $logoMedias[0..3]  → $laveries[0..3]
        // $logoMedias[4..19] → $laveriesGeo[0..15], rotation pour geo[16..19] et senlisLaveries

        $logoMediaData = [
            ['emplacement' => '/fichiers/logo/logo_laverie1.png',   'nom_original' => 'logo_laverie1.png',   'poids' => 6767,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_2.png',  'nom_original' => 'logo_laverie_2.png',  'poids' => 185068,  'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_3.png',  'nom_original' => 'logo_laverie_3.png',  'poids' => 8360,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_4.png',  'nom_original' => 'logo_laverie_4.png',  'poids' => 4748,    'mime_type' => 'image/webp'],
            ['emplacement' => '/fichiers/logo/logo_laverie_5.png',  'nom_original' => 'logo_laverie_5.png',  'poids' => 64201,   'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/logo/logo_laverie_6.png',  'nom_original' => 'logo_laverie_6.png',  'poids' => 4765,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_7.png',  'nom_original' => 'logo_laverie_7.png',  'poids' => 5201,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_8.png',  'nom_original' => 'logo_laverie_8.png',  'poids' => 7680,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_9.png',  'nom_original' => 'logo_laverie_9.png',  'poids' => 6593,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_10.png', 'nom_original' => 'logo_laverie_10.png', 'poids' => 6001,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_11.png', 'nom_original' => 'logo_laverie_11.png', 'poids' => 9088,    'mime_type' => 'image/webp'],
            ['emplacement' => '/fichiers/logo/logo_laverie_12.png', 'nom_original' => 'logo_laverie_12.png', 'poids' => 27526,   'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_13.png', 'nom_original' => 'logo_laverie_13.png', 'poids' => 8707,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_14.png', 'nom_original' => 'logo_laverie_14.png', 'poids' => 8346,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_15.png', 'nom_original' => 'logo_laverie_15.png', 'poids' => 59575,   'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_16.png', 'nom_original' => 'logo_laverie_16.png', 'poids' => 16378,   'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/logo/logo_laverie_17.png', 'nom_original' => 'logo_laverie_17.png', 'poids' => 6592,    'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/logo/logo_laverie_18.png', 'nom_original' => 'logo_laverie_18.png', 'poids' => 6580,    'mime_type' => 'image/png'],
            ['emplacement' => '/fichiers/logo/logo_laverie_19.png', 'nom_original' => 'logo_laverie_19.png', 'poids' => 5272,    'mime_type' => 'image/webp'],
            ['emplacement' => '/fichiers/logo/logo_laverie_20.png', 'nom_original' => 'logo_laverie_20.png', 'poids' => 5191,    'mime_type' => 'image/png'],
        ];

        $logoMedias = [];
        foreach ($logoMediaData as $data) {
            $media = new Media();
            $media->setEmplacement($data['emplacement']);
            $media->setNomOriginal($data['nom_original']);
            $media->setPoids($data['poids']);
            $media->setMimeType($data['mime_type']);
            $manager->persist($media);
            $logoMedias[] = $media;
        }


        // MÉDIAS IMAGES (20 fichiers — /fichiers/images/)

        $imageMediaData = [
            ['emplacement' => '/fichiers/images/images.jpeg',                                                                                              'nom_original' => 'images.jpeg',                                                                                              'poids' => 7794,      'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/images2.jpeg',                                                                                             'nom_original' => 'images2.jpeg',                                                                                             'poids' => 9115,      'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/images3_.jpeg',                                                                                            'nom_original' => 'images3_.jpeg',                                                                                            'poids' => 7625,      'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/images4.jpeg',                                                                                             'nom_original' => 'images4.jpeg',                                                                                             'poids' => 10272,     'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/images5.jpeg',                                                                                             'nom_original' => 'images5.jpeg',                                                                                             'poids' => 7838,      'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/images6.jpeg',                                                                                             'nom_original' => 'images6.jpeg',                                                                                             'poids' => 10685,     'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/images7.jpeg',                                                                                             'nom_original' => 'images7.jpeg',                                                                                             'poids' => 6150,      'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/images8.jpeg',                                                                                             'nom_original' => 'images8.jpeg',                                                                                             'poids' => 8603,      'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/images9.jpeg',                                                                                             'nom_original' => 'images9.jpeg',                                                                                             'poids' => 6545,      'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/bfdcdc1f3a85.jpg',                                                                                         'nom_original' => 'bfdcdc1f3a85.jpg',                                                                                         'poids' => 83122,     'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/istock-2216546853-1b3884.jpg',                                                                             'nom_original' => 'istock-2216546853-1b3884.jpg',                                                                             'poids' => 57729,     'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/laundry-413688_640.jpg',                                                                                   'nom_original' => 'laundry-413688_640.jpg',                                                                                   'poids' => 92032,     'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/machine-laver-rangee-machines-laver-automatiques-dans-buanderie-concept-service-blanchisserie_64235-2213.avif', 'nom_original' => 'machine-laver-rangee-machines-laver-automatiques-dans-buanderie-concept-service-blanchisserie_64235-2213.avif', 'poids' => 27387,     'mime_type' => 'image/avif'],
            ['emplacement' => '/fichiers/images/processus-lavage-vetements_1098-14493.avif',                                                               'nom_original' => 'processus-lavage-vetements_1098-14493.avif',                                                               'poids' => 27415,     'mime_type' => 'image/avif'],
            ['emplacement' => '/fichiers/images/happy-man-arms-crossed-standing-260nw-2746368747.webp',                                                    'nom_original' => 'happy-man-arms-crossed-standing-260nw-2746368747.webp',                                                    'poids' => 28038,     'mime_type' => 'image/webp'],
            ['emplacement' => '/fichiers/images/inside-washing-machine-wash-machine-details.jpg',                                                          'nom_original' => 'inside-washing-machine-wash-machine-details.jpg',                                                          'poids' => 7568525,   'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/washing-machine-minimal-laundry-room-interior-design.jpg',                                                 'nom_original' => 'washing-machine-minimal-laundry-room-interior-design.jpg',                                                 'poids' => 11360672,  'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/closeup-photo-fashionable-clothes-hangers-shop.jpg',                                                       'nom_original' => 'closeup-photo-fashionable-clothes-hangers-shop.jpg',                                                       'poids' => 9649608,   'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/Sans titre.jpeg',                                                                                          'nom_original' => 'Sans titre.jpeg',                                                                                          'poids' => 9414,      'mime_type' => 'image/jpeg'],
            ['emplacement' => '/fichiers/images/Sans titre2.jpeg',                                                                                         'nom_original' => 'Sans titre2.jpeg',                                                                                         'poids' => 10685,     'mime_type' => 'image/jpeg'],
        ];

        $imageMedias = [];
        foreach ($imageMediaData as $data) {
            $media = new Media();
            $media->setEmplacement($data['emplacement']);
            $media->setNomOriginal($data['nom_original']);
            $media->setPoids($data['poids']);
            $media->setMimeType($data['mime_type']);
            $manager->persist($media);
            $imageMedias[] = $media;
        }



         
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
        foreach ($laundryData as $i => $data) {
            $laverie = new Laverie();
            $laverie->setProfessionnel($data['professionnel']); // setProfessionnelId & setAdresseId semble non créé/utilisé dans laverie.php
            $laverie->setStatut($data['statut']);
            $laverie->setWiLineReference($data['wi_line_reference']);
            $laverie->setNomEtablissement($data['nom_etablissement']);
            $laverie->setContactEmail($data['contact_email']);
            $laverie->setDescription($data['description']);
            $laverie->setAdresse($data['adresse']);
            $laverie->setDateAjout($data['date_ajout']);
            $laverie->setDateModification($data['date_modification']);
            $laverie->setSupprimeLe($data['supprimee_le']);
            $laverie->setLogo($logoMedias[$i]);

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
 
        $laverieNotes = [];
        foreach ($laverieNotesData as $data) {
            $laverieNote = new LaverieNote();
            $laverieNote->setLaverie($data['laverie']);
            $laverieNote->setUtilisateur($data['utilisateur']);
            $laverieNote->setNote($data['note']);
            $laverieNote->setNoteLe($data['note_le']);
            $laverieNote->setCommentaire($data['commentaire']);
            $laverieNote->setCommentaireLe($data['commente_le']);
            $laverieNote->setReponse($data['reponse']);
            $laverieNote->setRepondLe($data['repond_le']);
            $laverieNote->setCommentaireSupprimeMotif($data['commentaire_supprime_motif']);
            $laverieNote->setCommentaireSupprimeLe($data['commentaire_supprime_le']);

            $manager->persist($laverieNote);
            $laverieNotes[] = $laverieNote;
        }
        // $laverieNotes[0] = note Luce sur Laverie Express
        // $laverieNotes[1] = note Roussel sur Laverie Express 2


         
        // LAVERIE EQUIPEMENTS
         
        $laverieEquipmentData = [
            [
                'laverie'              => $laveries[0],
                'equipement_reference' => 1,
                'nom'                  => 'Machine à laver',
                'type'                 => EquipementEnum::MACHINE_A_LAVER,
                'capacite'             => 7,
                'tarif'                => 3.00,
                'duree'                => 30,
            ],
            [
                'laverie'              => $laveries[1],
                'equipement_reference' => 2,
                'nom'                  => 'Machine à laver',
                'type'                 => EquipementEnum::MACHINE_A_LAVER,
                'capacite'             => 10,
                'tarif'                => 5.00,
                'duree'                => 45,
            ],
        ];

        foreach ($laverieEquipmentData as $data) {
            $laverieEquipment = new LaverieEquipement();
            $laverieEquipment->setLaverie($data['laverie']);
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
            $laverieFermeture->setLaverie($data['laverie']);
            $laverieFermeture->setJour($data['jour']);
            $laverieFermeture->setDateAjout($data['date_ajout']);
            $laverieFermeture->setDateModification($data['date_modification']);
            $laverieFermeture->setHeureDebut($data['heure_debut']);
            $laverieFermeture->setHeureFin($data['heure_fin']);

            $manager->persist($laverieFermeture);
        }




         
        // LAVERIE MEDIA — galerie variable (1–8 images par laverie)
        $lavImageCounts = [4, 6, 2, 3];
        $descPool       = ['Intérieur laverie', 'Façade', 'Vue extérieure', 'Machines',
                           'Entrée', 'Zone de séchage', 'Distributeurs', 'Parking'];
        $imgOffset      = 0;
        foreach ($laveries as $i => $lav) {
            for ($j = 0; $j < $lavImageCounts[$i]; $j++) {
                $lm = new LaverieMedia();
                $lm->setLaverie($lav)
                   ->setMedia($imageMedias[$imgOffset % 9 + 9])
                   ->setDescription($descPool[$j % 8]);
                $manager->persist($lm);
                $imgOffset++;
            }
        }


         
        // METHODES DE PAIEMENT
         
        $methodePaiementData = [
            ['nom' => 'Carte Bleue'],
            ['nom' => 'Billet'],
            ['nom' => 'Pièces'],
            ['nom' => 'Carte Fidélité'],
        ];

        $methodePaiements = [];
        foreach ($methodePaiementData as $data) {
            $methodePaiement = new MethodePaiement();
            $methodePaiement->setNom($data['nom']);
            $manager->persist($methodePaiement);
            $methodePaiements[] = $methodePaiement;
        }
        // $methodePaiements[0]=Carte Bleue | [1]=Billet | [2]=Pièces | [3]=Carte Fidélité


         
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

        $services = [];
        foreach ($serviceData as $data) {
            $service = new Service();
            $service->setNom($data['nom']);
            $manager->persist($service);
            $services[] = $service;
        }
        // $services[0]=Distrib. lessive | [1]=Wi-Fi | [2]=Table | [3]=Parking | [4]=Distrib. snack


         
        // PREFERENCES UTILISATEURS

        $utilisateurPreferenceData = [
            ['utilisateur' => $users[0], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $users[1], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $users[2], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $users[3], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $users[4],            'theme' => ThemeEnum::CLAIR, 'notifications' => false, 'langue' => $langues[0]],
            ['utilisateur' => $moderationUsers[0], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $moderationUsers[1], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
            ['utilisateur' => $moderationUsers[2], 'theme' => ThemeEnum::CLAIR, 'notifications' => true,  'langue' => $langues[0]],
        ];

        foreach ($utilisateurPreferenceData as $data) {
            $preference = new UtilisateurPreference();
            $preference->setTheme($data['theme']);
            $preference->setNotifications($data['notifications']);
            $preference->setLangueId($data['langue']);
            $preference->setUtilisateur($data['utilisateur']);
            $manager->persist($preference);
        }



        // LAVERIE FERMETURES EXCEPTIONNELLES
        

        $laverieFermetureExceptionnelleData = [
            [
                'laverie'    => $laveries[0], // Laverie Express
                'date_debut' => new \DateTime('2026-02-14 00:00:00'),
                'date_fin'   => new \DateTime('2026-02-15 23:59:59'),
                'raison'     => 'Fermeture exceptionnelle pour travaux.',
                'date_ajout' => new \DateTime('2026-01-10 09:00:00'),
            ],
            [
                'laverie'    => $laveries[1], // Laverie Express 2
                'date_debut' => new \DateTime('2026-03-01 00:00:00'),
                'date_fin'   => new \DateTime('2026-03-01 23:59:59'),
                'raison'     => 'Jour férié — fermeture exceptionnelle.',
                'date_ajout' => new \DateTime('2026-02-01 10:00:00'),
            ],
            [
                'laverie'    => $laveries[2], // AutoLaverie
                'date_debut' => new \DateTime('2026-04-18 00:00:00'),
                'date_fin'   => new \DateTime('2026-04-21 23:59:59'),
                'raison'     => 'Fermeture pour congés de Pâques.',
                'date_ajout' => new \DateTime('2026-03-15 08:30:00'),
            ],
            [
                'laverie'    => $laveries[0], // Laverie Express
                'date_debut' => new \DateTime('2026-12-24 12:00:00'),
                'date_fin'   => new \DateTime('2026-12-26 23:59:59'),
                'raison'     => null, // Pas de raison renseignée
                'date_ajout' => new \DateTime('2026-11-01 08:00:00'),
            ],
        ];

        foreach ($laverieFermetureExceptionnelleData as $data) {
            $fermetureExceptionnelle = new LaverieFermetureExceptionnelle();
            $fermetureExceptionnelle->setLaverie($data['laverie']);
            $fermetureExceptionnelle->setDateDebut($data['date_debut']);
            $fermetureExceptionnelle->setDateFin($data['date_fin']);
            $fermetureExceptionnelle->setRaison($data['raison']);
            $fermetureExceptionnelle->setDateAjout($data['date_ajout']);

            $manager->persist($fermetureExceptionnelle);
        }



        // LAVERIE HISTORIQUE INTERACTIONS

        $laverieHistoriqueInteractionData = [
            [
                'administrateur' => $admin,
                'laverie'        => $laveries[0], // Laverie Express
                'action'         => ActionEnum::VALIDE,
                'motif_action'   => null,
                'date'           => new \DateTime('2026-01-03 10:00:00'),
            ],
            [
                'administrateur' => $admin,
                'laverie'        => $laveries[1], // Laverie Express 2
                'action'         => ActionEnum::VALIDE,
                'motif_action'   => null,
                'date'           => new \DateTime('2026-01-03 10:15:00'),
            ],
            [
                'administrateur' => $admin,
                'laverie'        => $laveries[2], // AutoLaverie
                'action'         => ActionEnum::REFUSE,
                'motif_action'   => 'Informations du professionnel incomplètes.',
                'date'           => new \DateTime('2026-01-04 14:30:00'),
            ],
            [
                'administrateur' => $admin,
                'laverie'        => $laveries[3], // AutoLaverie 2
                'action'         => ActionEnum::REFUSE,
                'motif_action'   => 'Doublon avec une laverie déjà enregistrée.',
                'date'           => new \DateTime('2026-01-04 15:00:00'),
            ],
        ];

        foreach ($laverieHistoriqueInteractionData as $data) {
            $historiqueInteraction = new LaverieHistoriqueInteraction();
            $historiqueInteraction->setAdministrateur($data['administrateur']);
            $historiqueInteraction->setLaverie($data['laverie']);
            $historiqueInteraction->setAction($data['action']);
            $historiqueInteraction->setMotifAction($data['motif_action']);
            $historiqueInteraction->setDate($data['date']);

            $manager->persist($historiqueInteraction);
        }

         

        // LAVERIE NOTE SIGNALEMENTS

        $laverieNoteSignalementData = [
            [
                'laverie_note' => $laverieNotes[0], // Note de Luce
                'utilisateur'  => $users[1],        // Signalé par Roussel
                'date'         => new \DateTime('2026-01-06 10:00:00'),
                'motif'        => MotifEnum::SPAM,
                'commentaire'  => 'Ce commentaire ressemble à de la publicité déguisée.',
            ],
            [
                'laverie_note' => $laverieNotes[0], // Note de Luce
                'utilisateur'  => $users[2],        // Signalé par Buisson
                'date'         => new \DateTime('2026-01-07 11:30:00'),
                'motif'        => MotifEnum::PROPOS_INJURIEUX,
                'commentaire'  => null,
            ],
            [
                'laverie_note' => $laverieNotes[1], // Note de Roussel
                'utilisateur'  => $users[0],        // Signalé par Luce
                'date'         => new \DateTime('2026-01-08 09:15:00'),
                'motif'        => MotifEnum::PUBLICITE,
                'commentaire'  => 'Contenu non sollicité dans le commentaire.',
            ],
        ];

        foreach ($laverieNoteSignalementData as $data) {
            $signalement = new LaverieNoteSignalement();
            $signalement->setLaverieNote($data['laverie_note']);
            $signalement->setUtilisateur($data['utilisateur']);
            $signalement->setDate($data['date']);
            $signalement->setMotif($data['motif']);
            $signalement->setCommentaire($data['commentaire']);

            $manager->persist($signalement);
        }

        // FIXTURES MODÉRATION UTILISATEURS
        // Martin  : 9 notes × 2 reporters = 18 signalements (> seuil 15) → "À examiner"
        // Dubois  : 7 notes × 2 reporters + 1 note × 1 reporter = 15 (= seuil) → "À examiner"
        // Petit   : 3 notes × 2 reporters = 6 (< seuil) → "Tous" uniquement

        $moderationTestData = [
            [
                'user'      => $moderationUsers[0],
                'nb_notes'  => 9,
                'reporters' => [$users[0], $users[1]],
                'motif'     => MotifEnum::PROPOS_INJURIEUX,
            ],
            [
                'user'      => $moderationUsers[1],
                'nb_notes'  => 8,
                'reporters' => [$users[0], $users[2]],
                'motif'     => MotifEnum::SPAM,
            ],
            [
                'user'      => $moderationUsers[2],
                'nb_notes'  => 3,
                'reporters' => [$users[1], $users[2]],
                'motif'     => MotifEnum::PUBLICITE,
            ],
        ];

        foreach ($moderationTestData as $config) {
            for ($i = 0; $i < $config['nb_notes']; $i++) {
                $note = new LaverieNote();
                $note->setLaverie($laveries[$i % 2]);
                $note->setUtilisateur($config['user']);
                $note->setNote(1);
                $note->setNoteLe(new \DateTime('2026-03-' . str_pad($i + 1, 2, '0', STR_PAD_LEFT) . ' 10:00:00'));
                $note->setCommentaire('Commentaire signalé #' . ($i + 1));
                $note->setCommentaireLe(new \DateTime('2026-03-' . str_pad($i + 1, 2, '0', STR_PAD_LEFT) . ' 11:00:00'));
                $note->setReponse(null);
                $note->setRepondLe(null);
                $note->setCommentaireSupprimeMotif(null);
                $note->setCommentaireSupprimeLe(null);
                $manager->persist($note);

                // Dernière note de Dubois : un seul reporter pour tomber exactement à 15
                $reporters = ($config['user'] === $moderationUsers[1] && $i === $config['nb_notes'] - 1)
                    ? [$config['reporters'][0]]
                    : $config['reporters'];

                foreach ($reporters as $reporter) {
                    $sig = new LaverieNoteSignalement();
                    $sig->setLaverieNote($note);
                    $sig->setUtilisateur($reporter);
                    $sig->setDate(new \DateTime('2026-03-' . str_pad($i + 1, 2, '0', STR_PAD_LEFT) . ' 12:00:00'));
                    $sig->setMotif($config['motif']);
                    $sig->setCommentaire(null);
                    $manager->persist($sig);
                }
            }
        }




        // PROFESSIONNEL HISTORIQUE INTERACTIONS

        $professionnelHistoriqueInteractionData = [
            [
                'administrateur' => $admin,
                'professionnel'  => $professionnels[0], // Lambert
                'action'         => StatutEnum::VALIDE,
                'motif_action'   => null,
                'date'           => new \DateTime('2026-01-03 09:00:00'),
            ],
            [
                'administrateur' => $admin,
                'professionnel'  => $professionnels[0], // Lambert — second passage EN_ATTENTE avant validation
                'action'         => StatutEnum::EN_ATTENTE,
                'motif_action'   => 'Vérification du SIREN en cours.',
                'date'           => new \DateTime('2026-01-02 08:30:00'),
            ],
            [
                'administrateur' => $admin,
                'professionnel'  => $professionnels[1], // Deschamps
                'action'         => StatutEnum::EN_ATTENTE,
                'motif_action'   => 'Dossier incomplet, en attente de pièces justificatives.',
                'date'           => new \DateTime('2026-01-03 10:00:00'),
            ],
            [
                'administrateur' => $admin,
                'professionnel'  => $professionnels[1], // Deschamps — refus après vérification
                'action'         => StatutEnum::REFUSE,
                'motif_action'   => 'SIREN invalide, correspondance introuvable au registre.',
                'date'           => new \DateTime('2026-01-05 14:00:00'),
            ],
        ];

        foreach ($professionnelHistoriqueInteractionData as $data) {
            $historiqueInteraction = new ProfessionnelHistoriqueInteraction();
            $historiqueInteraction->setAdministrateur($data['administrateur']);
            $historiqueInteraction->setProfessionnel($data['professionnel']);
            $historiqueInteraction->setAction($data['action']);
            $historiqueInteraction->setMotifAction($data['motif_action']);
            $historiqueInteraction->setDate($data['date']);

            $manager->persist($historiqueInteraction);
        }



        // UTILISATEUR HISTORIQUE INTERACTIONS

        $utilisateurHistoriqueInteractionData = [
            [
                'administrateur' => $admin,
                'utilisateur'    => $users[0], // Luce — validé
                'action'         => StatutEnum::VALIDE,
                'motif_action'   => null,
                'date'           => new \DateTime('2026-01-02 08:00:00'),
            ],
            [
                'administrateur' => $admin,
                'utilisateur'    => $users[1], // Roussel — validé
                'action'         => StatutEnum::VALIDE,
                'motif_action'   => null,
                'date'           => new \DateTime('2026-01-19 09:00:00'),
            ],
            [
                'administrateur' => $admin,
                'utilisateur'    => $users[2], // Buisson — en attente
                'action'         => StatutEnum::EN_ATTENTE,
                'motif_action'   => 'Vérification de l\'adresse email en cours.',
                'date'           => new \DateTime('2026-03-02 10:00:00'),
            ],
            [
                'administrateur' => $admin,
                'utilisateur'    => $users[3], // Lambert — en attente
                'action'         => StatutEnum::EN_ATTENTE,
                'motif_action'   => 'Compte en cours de vérification.',
                'date'           => new \DateTime('2026-02-16 08:00:00'),
            ],
            [
                'administrateur' => $admin,
                'utilisateur'    => $users[4], // Deschamps — refusé
                'action'         => StatutEnum::EN_ATTENTE,
                'motif_action'   => null,
                'date'           => new \DateTime('2026-01-29 08:00:00'),
            ],
            [
                'administrateur' => $admin,
                'utilisateur'    => $users[4], // Deschamps — refusé après vérification
                'action'         => StatutEnum::REFUSE,
                'motif_action'   => 'Informations d\'identité non conformes.',
                'date'           => new \DateTime('2026-02-01 14:00:00'),
            ],
        ];

        foreach ($utilisateurHistoriqueInteractionData as $data) {
            $historiqueInteraction = new UtilisateurHistoriqueInteraction();
            $historiqueInteraction->setAdministrateur($data['administrateur']);
            $historiqueInteraction->setUtilisateur($data['utilisateur']);
            $historiqueInteraction->setAction($data['action']);
            $historiqueInteraction->setMotifAction($data['motif_action']);
            $historiqueInteraction->setDate($data['date']);

            $manager->persist($historiqueInteraction);
        }



        // ───────────────────────────────────────────────────────────────────────
        // LAVERIES DE TEST POUR LA RECHERCHE GÉOLOCALISÉE (US 18)
        // Groupe A : autour de Survilliers / Chantilly / Senlis → doivent apparaître
        // Groupe B : villes éloignées en France → ne doivent PAS apparaître
        // ───────────────────────────────────────────────────────────────────────

        $adressesGeoData = [
            // Groupe A — proches de Survilliers (Île-de-France)
            [
                'adresse'                => '5',
                'rue'                    => 'Rue de la Mairie',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.10234,
                'longitude'              => 2.54562,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '12',
                'rue'                    => 'Allée de la Gare',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.10890,
                'longitude'              => 2.56140,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '3',
                'rue'                    => 'Avenue du Connétable',
                'code_postal'            => 60500,
                'ville'                  => 'Chantilly',
                'pays'                   => 'France',
                'latitude'               => 49.1940,
                'longitude'              => 2.4700,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '8',
                'rue'                    => 'Rue de la République',
                'code_postal'            => 60300,
                'ville'                  => 'Senlis',
                'pays'                   => 'France',
                'latitude'               => 49.2040,
                'longitude'              => 2.5880,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '2',
                'rue'                    => 'Rue du Parc',
                'code_postal'            => 95270,
                'ville'                  => 'Luzarches',
                'pays'                   => 'France',
                'latitude'               => 49.1170,
                'longitude'              => 2.4240,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            // Groupe A (suite) — 10 laveries supplémentaires dans les 5km de Survilliers
            [
                'adresse'                => '3',
                'rue'                    => 'Rue du Château d\'eau',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.10495,
                'longitude'              => 2.55040,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '7',
                'rue'                    => 'Rue des Lilas',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.10190,
                'longitude'              => 2.54640,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '15',
                'rue'                    => 'Allée des Acacias',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.10285,
                'longitude'              => 2.54490,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '2',
                'rue'                    => 'Rue du Moulin',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.10075,
                'longitude'              => 2.54810,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '9',
                'rue'                    => 'Avenue de la Forêt',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.11010,
                'longitude'              => 2.56190,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '18',
                'rue'                    => 'Rue des Vignes',
                'code_postal'            => 95380,
                'ville'                  => 'Louvres',
                'pays'                   => 'France',
                'latitude'               => 49.0385,
                'longitude'              => 2.5195,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '4',
                'rue'                    => 'Rue de la Croix',
                'code_postal'            => 95380,
                'ville'                  => 'Louvres',
                'pays'                   => 'France',
                'latitude'               => 49.0360,
                'longitude'              => 2.5240,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '6',
                'rue'                    => 'Rue de l\'Église',
                'code_postal'            => 95470,
                'ville'                  => 'Fosses',
                'pays'                   => 'France',
                'latitude'               => 49.0935,
                'longitude'              => 2.4945,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '11',
                'rue'                    => 'Grande Rue',
                'code_postal'            => 95380,
                'ville'                  => 'Chennevières-lès-Louvres',
                'pays'                   => 'France',
                'latitude'               => 49.0635,
                'longitude'              => 2.4975,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '1',
                'rue'                    => 'Rue de Picardie',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.10210,
                'longitude'              => 2.54510,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            // Groupe B — villes éloignées (ne doivent PAS apparaître dans la zone Survilliers)
            [
                'adresse'                => '14',
                'rue'                    => 'Quai du Vieux-Port',
                'code_postal'            => 13001,
                'ville'                  => 'Marseille',
                'pays'                   => 'France',
                'latitude'               => 43.2965,
                'longitude'              => 5.3698,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '7',
                'rue'                    => 'Quai des Chartrons',
                'code_postal'            => 33000,
                'ville'                  => 'Bordeaux',
                'pays'                   => 'France',
                'latitude'               => 44.8378,
                'longitude'              => -0.5792,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '22',
                'rue'                    => 'Rue de la République',
                'code_postal'            => 69002,
                'ville'                  => 'Lyon',
                'pays'                   => 'France',
                'latitude'               => 45.7640,
                'longitude'              => 4.8357,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '1',
                'rue'                    => 'Rue de Paris',
                'code_postal'            => 59000,
                'ville'                  => 'Lille',
                'pays'                   => 'France',
                'latitude'               => 50.6292,
                'longitude'              => 3.0573,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '4',
                'rue'                    => 'Rue des Bouchers',
                'code_postal'            => 67000,
                'ville'                  => 'Strasbourg',
                'pays'                   => 'France',
                'latitude'               => 48.5734,
                'longitude'              => 7.7521,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
        ];

        $adressesGeo = [];
        foreach ($adressesGeoData as $adresseData) {
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
            $adressesGeo[] = $adresse;
        }
        // $adressesGeo[0]  = Survilliers Mairie          | $adressesGeo[1]  = Survilliers Gare
        // $adressesGeo[2]  = Chantilly Connétable        | $adressesGeo[3]  = Senlis République
        // $adressesGeo[4]  = Luzarches Parc
        // $adressesGeo[5]  = Survilliers Château d'eau   | $adressesGeo[6]  = Survilliers Lilas
        // $adressesGeo[7]  = Survilliers Acacias         | $adressesGeo[8]  = Survilliers Moulin
        // $adressesGeo[9]  = Survilliers Forêt           | $adressesGeo[10] = Louvres Vignes
        // $adressesGeo[11] = Louvres Croix               | $adressesGeo[12] = Fosses Église
        // $adressesGeo[13] = Chennevières Grande Rue      | $adressesGeo[14] = Survilliers Picardie
        // $adressesGeo[15] = Marseille Vieux-Port        | $adressesGeo[16] = Bordeaux Chartrons
        // $adressesGeo[17] = Lyon République             | $adressesGeo[18] = Lille Paris
        // $adressesGeo[19] = Strasbourg Bouchers

        $laveriesGeoData = [
            // Groupe A — Survilliers / Chantilly / Senlis
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie du Bourg',
                'contact_email'     => 'contact@laveriedubourg.fr',
                'description'       => 'Laverie au cœur du bourg de Survilliers, ouverte 7j/7.',
                'adresse'           => $adressesGeo[0],
                'date_ajout'        => new \DateTime('2026-02-01 09:00:00'),
                'date_modification' => new \DateTime('2026-02-01 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de la Gare',
                'contact_email'     => 'contact@laveriegare.fr',
                'description'       => 'Proche de la gare de Survilliers, idéale pour les pendulaires.',
                'adresse'           => $adressesGeo[1],
                'date_ajout'        => new \DateTime('2026-02-02 10:00:00'),
                'date_modification' => new \DateTime('2026-02-02 10:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie des Princes',
                'contact_email'     => 'contact@laverie-chantilly.fr',
                'description'       => 'Laverie moderne à Chantilly, près du château.',
                'adresse'           => $adressesGeo[2],
                'date_ajout'        => new \DateTime('2026-02-03 11:00:00'),
                'date_modification' => new \DateTime('2026-02-03 11:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de la Cathédrale',
                'contact_email'     => 'contact@laverie-senlis.fr',
                'description'       => 'Laverie en plein cœur de Senlis, face à la cathédrale.',
                'adresse'           => $adressesGeo[3],
                'date_ajout'        => new \DateTime('2026-02-04 12:00:00'),
                'date_modification' => new \DateTime('2026-02-04 12:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie du Parc',
                'contact_email'     => 'contact@laverie-luzarches.fr',
                'description'       => 'Laverie calme et spacieuse à Luzarches.',
                'adresse'           => $adressesGeo[4],
                'date_ajout'        => new \DateTime('2026-02-05 13:00:00'),
                'date_modification' => new \DateTime('2026-02-05 13:00:00'),
                'supprimee_le'      => null,
            ],
            // Groupe A (suite) — 10 laveries supplémentaires dans les 5km de Survilliers
            // $adressesGeo[10..19] correspondent aux nouvelles adresses ajoutées ci-dessus
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie du Château d\'eau',
                'contact_email'     => 'contact@laverie-survilliers3.fr',
                'description'       => 'Laverie pratique près du château d\'eau.',
                'adresse'           => $adressesGeo[5],
                'date_ajout'        => new \DateTime('2026-02-11 09:00:00'),
                'date_modification' => new \DateTime('2026-02-11 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie des Lilas',
                'contact_email'     => 'contact@laverie-survilliers4.fr',
                'description'       => 'Laverie colorée au cœur du quartier des Lilas.',
                'adresse'           => $adressesGeo[6],
                'date_ajout'        => new \DateTime('2026-02-12 09:00:00'),
                'date_modification' => new \DateTime('2026-02-12 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie des Acacias',
                'contact_email'     => 'contact@laverie-survilliers5.fr',
                'description'       => 'Laverie moderne, parking gratuit.',
                'adresse'           => $adressesGeo[7],
                'date_ajout'        => new \DateTime('2026-02-13 09:00:00'),
                'date_modification' => new \DateTime('2026-02-13 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie du Moulin',
                'contact_email'     => 'contact@laverie-survilliers6.fr',
                'description'       => 'Laverie familiale, tarifs doux.',
                'adresse'           => $adressesGeo[8],
                'date_ajout'        => new \DateTime('2026-02-14 09:00:00'),
                'date_modification' => new \DateTime('2026-02-14 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de la Forêt',
                'contact_email'     => 'contact@laverie-survilliers7.fr',
                'description'       => 'Laverie en bordure de forêt.',
                'adresse'           => $adressesGeo[9],
                'date_ajout'        => new \DateTime('2026-02-15 09:00:00'),
                'date_modification' => new \DateTime('2026-02-15 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie des Vignes',
                'contact_email'     => 'contact@laverie-louvres1.fr',
                'description'       => 'Laverie de Louvres, accès facile.',
                'adresse'           => $adressesGeo[10],
                'date_ajout'        => new \DateTime('2026-02-16 09:00:00'),
                'date_modification' => new \DateTime('2026-02-16 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de la Croix',
                'contact_email'     => 'contact@laverie-louvres2.fr',
                'description'       => 'Petite laverie de quartier.',
                'adresse'           => $adressesGeo[11],
                'date_ajout'        => new \DateTime('2026-02-17 09:00:00'),
                'date_modification' => new \DateTime('2026-02-17 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de l\'Église',
                'contact_email'     => 'contact@laverie-fosses.fr',
                'description'       => 'Laverie de Fosses, ouverte tous les jours.',
                'adresse'           => $adressesGeo[12],
                'date_ajout'        => new \DateTime('2026-02-18 09:00:00'),
                'date_modification' => new \DateTime('2026-02-18 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de Chennevières',
                'contact_email'     => 'contact@laverie-chennevieres.fr',
                'description'       => 'Laverie de Chennevières-lès-Louvres.',
                'adresse'           => $adressesGeo[13],
                'date_ajout'        => new \DateTime('2026-02-19 09:00:00'),
                'date_modification' => new \DateTime('2026-02-19 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[0],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de Picardie',
                'contact_email'     => 'contact@laverie-survilliers8.fr',
                'description'       => 'Grande laverie avec machines industrielles.',
                'adresse'           => $adressesGeo[14],
                'date_ajout'        => new \DateTime('2026-02-20 09:00:00'),
                'date_modification' => new \DateTime('2026-02-20 09:00:00'),
                'supprimee_le'      => null,
            ],
            // Groupe B — villes éloignées
            [
                'professionnel'     => $professionnels[1],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie du Vieux-Port',
                'contact_email'     => 'contact@laverie-marseille.fr',
                'description'       => 'Laverie en bord de mer à Marseille.',
                'adresse'           => $adressesGeo[15],
                'date_ajout'        => new \DateTime('2026-02-06 09:00:00'),
                'date_modification' => new \DateTime('2026-02-06 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[1],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie des Quais',
                'contact_email'     => 'contact@laverie-bordeaux.fr',
                'description'       => 'Laverie sur les quais de Bordeaux.',
                'adresse'           => $adressesGeo[16],
                'date_ajout'        => new \DateTime('2026-02-07 09:00:00'),
                'date_modification' => new \DateTime('2026-02-07 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[1],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de la Bourse',
                'contact_email'     => 'contact@laverie-lyon.fr',
                'description'       => 'Laverie au cœur de Lyon Presqu\'île.',
                'adresse'           => $adressesGeo[17],
                'date_ajout'        => new \DateTime('2026-02-08 09:00:00'),
                'date_modification' => new \DateTime('2026-02-08 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[1],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de la Grand-Place',
                'contact_email'     => 'contact@laverie-lille.fr',
                'description'       => 'Laverie en plein centre de Lille.',
                'adresse'           => $adressesGeo[18],
                'date_ajout'        => new \DateTime('2026-02-09 09:00:00'),
                'date_modification' => new \DateTime('2026-02-09 09:00:00'),
                'supprimee_le'      => null,
            ],
            [
                'professionnel'     => $professionnels[1],
                'statut'            => LaverieStatutEnum::VALIDE,
                'wi_line_reference' => null,
                'nom_etablissement' => 'Laverie de la Cathédrale',
                'contact_email'     => 'contact@laverie-strasbourg.fr',
                'description'       => 'Laverie dans le centre historique de Strasbourg.',
                'adresse'           => $adressesGeo[19],
                'date_ajout'        => new \DateTime('2026-02-10 09:00:00'),
                'date_modification' => new \DateTime('2026-02-10 09:00:00'),
                'supprimee_le'      => null,
            ],
        ];

        $laveriesGeo = [];
        foreach ($laveriesGeoData as $i => $data) {
            $laverie = new Laverie();
            $laverie->setProfessionnel($data['professionnel']);
            $laverie->setStatut($data['statut']);
            $laverie->setWiLineReference($data['wi_line_reference']);
            $laverie->setNomEtablissement($data['nom_etablissement']);
            $laverie->setContactEmail($data['contact_email']);
            $laverie->setDescription($data['description']);
            $laverie->setAdresse($data['adresse']);
            $laverie->setDateAjout($data['date_ajout']);
            $laverie->setDateModification($data['date_modification']);
            $laverie->setSupprimeLe($data['supprimee_le']);
            $laverie->setLogo($logoMedias[($i + 4) % 20]);

            $manager->persist($laverie);
            $laveriesGeo[] = $laverie;
        }
        // $laveriesGeo[0]=Laverie du Bourg      | [1]=Laverie de la Gare      | [2]=Laverie des Princes
        // $laveriesGeo[3]=Laverie de la Cathédrale | [4]=Laverie du Parc
        // $laveriesGeo[5..9]=Survilliers suite  | [9]=Laverie de la Forêt

        // ── RELATIONS COMPLÈTES — LAVERIE DE LA CATHÉDRALE [3] & LAVERIE DE LA FORÊT [9] ──
        // Permet de tester la fiche laverie avec toutes les sections visibles.

        foreach ([$laveriesGeo[3], $laveriesGeo[9]] as $laverieCible) {
            foreach ($services as $service) {
                $laverieCible->addService($service);
            }
            foreach ($methodePaiements as $methode) {
                $laverieCible->addMethodePaiement($methode);
            }
        }

        foreach ([
            ['laverie' => $laveriesGeo[3], 'ref' => 10, 'nom' => 'Machine à laver',   'type' => EquipementEnum::MACHINE_A_LAVER, 'capacite' => 8,  'tarif' => 3.50, 'duree' => 35],
            ['laverie' => $laveriesGeo[3], 'ref' => 11, 'nom' => 'Machine à laver XL', 'type' => EquipementEnum::MACHINE_A_LAVER, 'capacite' => 14, 'tarif' => 5.00, 'duree' => 45],
            ['laverie' => $laveriesGeo[3], 'ref' => 12, 'nom' => 'Sèche-linge',        'type' => EquipementEnum::SECHE_LINGE,     'capacite' => 8,  'tarif' => 1.50, 'duree' => 20],
            ['laverie' => $laveriesGeo[9], 'ref' => 13, 'nom' => 'Machine à laver',   'type' => EquipementEnum::MACHINE_A_LAVER, 'capacite' => 7,  'tarif' => 3.00, 'duree' => 30],
            ['laverie' => $laveriesGeo[9], 'ref' => 14, 'nom' => 'Sèche-linge',        'type' => EquipementEnum::SECHE_LINGE,     'capacite' => 7,  'tarif' => 1.50, 'duree' => 20],
        ] as $d) {
            $eq = new LaverieEquipement();
            $eq->setLaverie($d['laverie'])
               ->setEquipementReference($d['ref'])
               ->setNom($d['nom'])
               ->setType($d['type'])
               ->setCapacite($d['capacite'])
               ->setTarif($d['tarif'])
               ->setDuree($d['duree']);
            $manager->persist($eq);
        }

        $horairesGeo = [
            [JourEnum::LUNDI,    '08:00', '12:00', '14:00', '19:30'],
            [JourEnum::MARDI,    '08:00', '12:00', '14:00', '19:30'],
            [JourEnum::MERCREDI, '08:00', '12:00', '14:00', '19:30'],
            [JourEnum::JEUDI,    '08:00', '12:00', '14:00', '19:30'],
            [JourEnum::VENDREDI, '08:00', '12:00', '14:00', '19:30'],
            [JourEnum::SAMEDI,   '09:00', '12:30', '14:00', '18:00'],
            [JourEnum::DIMANCHE, '09:00', '12:00', null,    null   ],
        ];
        foreach ([$laveriesGeo[3], $laveriesGeo[9]] as $laverieCible) {
            foreach ($horairesGeo as [$jour, $debAm, $finAm, $debPm, $finPm]) {
                $fam = new LaverieFermeture();
                $fam->setLaverie($laverieCible)
                    ->setJour($jour)
                    ->setDateAjout(new \DateTime('2026-02-01 09:00:00'))
                    ->setDateModification(new \DateTime('2026-02-01 09:00:00'))
                    ->setHeureDebut(new \DateTime("1970-01-01 {$debAm}:00"))
                    ->setHeureFin(new \DateTime("1970-01-01 {$finAm}:00"));
                $manager->persist($fam);

                if ($debPm !== null) {
                    $fpm = new LaverieFermeture();
                    $fpm->setLaverie($laverieCible)
                        ->setJour($jour)
                        ->setDateAjout(new \DateTime('2026-02-01 09:00:00'))
                        ->setDateModification(new \DateTime('2026-02-01 09:00:00'))
                        ->setHeureDebut(new \DateTime("1970-01-01 {$debPm}:00"))
                        ->setHeureFin(new \DateTime("1970-01-01 {$finPm}:00"));
                    $manager->persist($fpm);
                }
            }
        }

        foreach ([
            [$laveriesGeo[3], $users[0], 5, 'Laverie magnifique, en plein cœur de Senlis. Machines impeccables !', '2026-03-10 10:00:00', '2026-03-10 10:05:00', 'Merci ! À bientôt à la Cathédrale !', '2026-03-11 08:00:00'],
            [$laveriesGeo[3], $users[1], 3, 'Correct mais un peu cher pour la région.',                              '2026-03-15 14:00:00', '2026-03-15 14:10:00', null, null],
            [$laveriesGeo[9], $users[0], 4, 'Cadre verdoyant, très agréable. Machines en bon état.',                 '2026-03-12 11:00:00', '2026-03-12 11:05:00', 'Merci ! La forêt nous inspire !', '2026-03-13 09:00:00'],
        ] as [$lav, $user, $note, $comment, $noteLe, $commentLe, $reponse, $repondLe]) {
            $n = new LaverieNote();
            $n->setLaverie($lav)
              ->setUtilisateur($user)
              ->setNote($note)
              ->setNoteLe(new \DateTime($noteLe))
              ->setCommentaire($comment)
              ->setCommentaireLe(new \DateTime($commentLe))
              ->setReponse($reponse)
              ->setRepondLe($repondLe ? new \DateTime($repondLe) : null)
              ->setCommentaireSupprimeMotif(null)
              ->setCommentaireSupprimeLe(null);
            $manager->persist($n);
        }

        $geoImageCounts = [3, 5, 2, 8, 4, 1, 6, 3, 7, 2, 5, 1, 4, 8, 3, 6, 2, 5, 4, 1];
        $imgOffset      = 0;
        foreach ($laveriesGeo as $i => $lav) {
            for ($j = 0; $j < $geoImageCounts[$i]; $j++) {
                $geoMedia = new LaverieMedia();
                $geoMedia->setLaverie($lav)
                         ->setMedia($imageMedias[$imgOffset % 9 + 9])
                         ->setDescription($descPool[$j % 8]);
                $manager->persist($geoMedia);
                $imgOffset++;
            }
        }
        // ─────────────────────────────────────────────────────────────────────

        // ── FAVORIS (laverie_favori) ──────────────────────────────────────────
        // $users[0] = Luce | $users[1] = Roussel | $users[2] = Buisson
        // $users[3] = Lambert | $users[4] = Deschamps
        // $laveries[0] = Laverie Express   | $laveries[1] = Laverie Express 2
        // $laveries[2] = AutoLaverie       | $laveries[3] = AutoLaverie 2

        // Luce : 2 favoris (happy path + multi-favoris par user)
        $laveries[0]->addFavori($users[0]);
        $laveries[1]->addFavori($users[0]);

        // Roussel : 2 favoris (multi-users sur même laverie + laverie EN_ATTENTE)
        $laveries[0]->addFavori($users[1]);
        $laveries[2]->addFavori($users[1]);

        // Lambert : 1 favori (3e user sur Laverie Express 2)
        $laveries[1]->addFavori($users[3]);

        // Buisson : 1 favori (user EN_ATTENTE + laverie REFUSE → cas limite)
        $laveries[3]->addFavori($users[2]);
        // ─────────────────────────────────────────────────────────────────────

        // ── SENLIS — 5 laveries supplémentaires (total 6 avec $laveriesGeo[3]) ──

        $senlisAdressesData = [
            ['adresse' => '2',  'rue' => 'Place du Parvis',      'code_postal' => 60300, 'ville' => 'Senlis', 'pays' => 'France', 'latitude' => 49.2029, 'longitude' => 2.5843],
            ['adresse' => '15', 'rue' => 'Rue Saint-Hilaire',    'code_postal' => 60300, 'ville' => 'Senlis', 'pays' => 'France', 'latitude' => 49.2055, 'longitude' => 2.5868],
            ['adresse' => '4',  'rue' => 'Place Henri IV',       'code_postal' => 60300, 'ville' => 'Senlis', 'pays' => 'France', 'latitude' => 49.2048, 'longitude' => 2.5888],
            ['adresse' => '8',  'rue' => 'Rue du Châtel',        'code_postal' => 60300, 'ville' => 'Senlis', 'pays' => 'France', 'latitude' => 49.2065, 'longitude' => 2.5905],
            ['adresse' => '22', 'rue' => 'Rue de la Treille',    'code_postal' => 60300, 'ville' => 'Senlis', 'pays' => 'France', 'latitude' => 49.2036, 'longitude' => 2.5924],
        ];

        $senlisAdresses = [];
        foreach ($senlisAdressesData as $d) {
            $a = new Adresse();
            $a->setAdresse($d['adresse']);
            $a->setRue($d['rue']);
            $a->setCodePostal($d['code_postal']);
            $a->setVille($d['ville']);
            $a->setPays($d['pays']);
            $a->setLatitude($d['latitude']);
            $a->setLongitude($d['longitude']);
            $a->setStatutGeolocalisation(GeoStatutEnum::GEOLOCALISE);
            $manager->persist($a);
            $senlisAdresses[] = $a;
        }

        $senlisLaveriesData = [
            ['nom' => 'Laverie du Parvis',      'adresse' => $senlisAdresses[0], 'email' => 'parvis@laverie-senlis.fr',      'desc' => 'Laverie moderne face au parvis de la cathédrale.', 'date' => '2026-03-01 09:00:00'],
            ['nom' => 'Laverie Saint-Hilaire',  'adresse' => $senlisAdresses[1], 'email' => 'saint-hilaire@laverie-senlis.fr', 'desc' => 'Au cœur du quartier historique de Senlis.', 'date' => '2026-03-02 09:00:00'],
            ['nom' => 'Laverie du Marché',      'adresse' => $senlisAdresses[2], 'email' => 'marche@laverie-senlis.fr',       'desc' => 'Laverie idéalement placée près du marché.', 'date' => '2026-03-03 09:00:00'],
            ['nom' => 'Laverie des Remparts',   'adresse' => $senlisAdresses[3], 'email' => 'remparts@laverie-senlis.fr',     'desc' => 'À deux pas des remparts gallo-romains.', 'date' => '2026-03-04 09:00:00'],
            ['nom' => 'Laverie de la Treille',  'adresse' => $senlisAdresses[4], 'email' => 'treille@laverie-senlis.fr',      'desc' => 'Laverie de quartier conviviale et bien équipée.', 'date' => '2026-03-05 09:00:00'],
        ];

        $senlisLaveries = [];
        foreach ($senlisLaveriesData as $i => $d) {
            $l = new Laverie();
            $l->setProfessionnel($professionnels[0]);
            $l->setStatut(LaverieStatutEnum::VALIDE);
            $l->setWiLineReference(null);
            $l->setNomEtablissement($d['nom']);
            $l->setContactEmail($d['email']);
            $l->setDescription($d['desc']);
            $l->setAdresse($d['adresse']);
            $l->setLogo($logoMedias[($i + 4) % 20]);
            $l->setDateAjout(new \DateTime($d['date']));
            $l->setDateModification(new \DateTime($d['date']));
            $l->setSupprimeLe(null);
            foreach ($services as $s)         { $l->addService($s); }
            foreach ($methodePaiements as $m) { $l->addMethodePaiement($m); }
            $manager->persist($l);
            $senlisLaveries[] = $l;
        }

        // Équipements — 3 par laverie (refs 20-34)
        $refBase = 20;
        foreach ($senlisLaveries as $i => $lav) {
            $offset = $i * 3;
            foreach ([
                ['ref' => $refBase + $offset,     'nom' => 'Machine à laver',    'type' => EquipementEnum::MACHINE_A_LAVER, 'capacite' => 7,  'tarif' => 3.00, 'duree' => 30],
                ['ref' => $refBase + $offset + 1, 'nom' => 'Machine à laver XL', 'type' => EquipementEnum::MACHINE_A_LAVER, 'capacite' => 14, 'tarif' => 5.00, 'duree' => 45],
                ['ref' => $refBase + $offset + 2, 'nom' => 'Sèche-linge',        'type' => EquipementEnum::SECHE_LINGE,     'capacite' => 8,  'tarif' => 1.50, 'duree' => 20],
            ] as $d) {
                $eq = new LaverieEquipement();
                $eq->setLaverie($lav)
                   ->setEquipementReference($d['ref'])
                   ->setNom($d['nom'])
                   ->setType($d['type'])
                   ->setCapacite($d['capacite'])
                   ->setTarif($d['tarif'])
                   ->setDuree($d['duree']);
                $manager->persist($eq);
            }
        }

        // Horaires — même planning que $horairesGeo pour toutes les laveries Senlis
        foreach ($senlisLaveries as $lav) {
            foreach ($horairesGeo as [$jour, $debAm, $finAm, $debPm, $finPm]) {
                $fam = new LaverieFermeture();
                $fam->setLaverie($lav)
                    ->setJour($jour)
                    ->setDateAjout(new \DateTime('2026-03-01 09:00:00'))
                    ->setDateModification(new \DateTime('2026-03-01 09:00:00'))
                    ->setHeureDebut(new \DateTime("1970-01-01 {$debAm}:00"))
                    ->setHeureFin(new \DateTime("1970-01-01 {$finAm}:00"));
                $manager->persist($fam);

                if ($debPm !== null) {
                    $fpm = new LaverieFermeture();
                    $fpm->setLaverie($lav)
                        ->setJour($jour)
                        ->setDateAjout(new \DateTime('2026-03-01 09:00:00'))
                        ->setDateModification(new \DateTime('2026-03-01 09:00:00'))
                        ->setHeureDebut(new \DateTime("1970-01-01 {$debPm}:00"))
                        ->setHeureFin(new \DateTime("1970-01-01 {$finPm}:00"));
                    $manager->persist($fpm);
                }
            }
        }

        // Notes
        foreach ([
            [$senlisLaveries[0], $users[0], 5, 'Super laverie, machines neuves et propres !',            '2026-04-01 10:00:00', '2026-04-01 10:05:00', 'Merci pour votre fidélité !', '2026-04-02 08:00:00'],
            [$senlisLaveries[0], $users[1], 4, 'Très pratique, juste un peu bruyant.',                   '2026-04-03 14:00:00', '2026-04-03 14:10:00', null, null],
            [$senlisLaveries[1], $users[0], 4, 'Bonne laverie, cadre historique agréable.',              '2026-04-05 11:00:00', '2026-04-05 11:05:00', 'Le quartier est magnifique, merci !', '2026-04-06 09:00:00'],
            [$senlisLaveries[1], $users[2], 3, 'Correct mais les horaires du dimanche sont courts.',     '2026-04-06 09:30:00', '2026-04-06 09:40:00', null, null],
            [$senlisLaveries[2], $users[1], 5, 'Idéal pour faire sa lessive le jour du marché !',       '2026-04-08 10:00:00', '2026-04-08 10:05:00', 'On vous attend chaque semaine !', '2026-04-09 08:30:00'],
            [$senlisLaveries[2], $users[0], 4, 'Machines bien entretenues, personnel aimable.',          '2026-04-09 15:00:00', '2026-04-09 15:05:00', null, null],
            [$senlisLaveries[3], $users[2], 5, 'Vue sur les remparts, moment de lessive inoubliable.', '2026-04-11 09:00:00', '2026-04-11 09:05:00', 'Merci ! L\'histoire est partout ici !', '2026-04-12 08:00:00'],
            [$senlisLaveries[3], $users[1], 3, 'Parking difficile à côté, sinon très bien.',            '2026-04-12 11:00:00', '2026-04-12 11:10:00', null, null],
            [$senlisLaveries[4], $users[0], 4, 'Petite laverie sympa, ambiance de quartier.',           '2026-04-14 10:00:00', '2026-04-14 10:05:00', 'Merci, on essaie de garder cet esprit !', '2026-04-15 08:00:00'],
            [$senlisLaveries[4], $users[2], 5, 'Propre, calme, bien situé. Je recommande.',             '2026-04-15 14:00:00', '2026-04-15 14:05:00', null, null],
        ] as [$lav, $user, $note, $comment, $noteLe, $commentLe, $reponse, $repondLe]) {
            $n = new LaverieNote();
            $n->setLaverie($lav)
              ->setUtilisateur($user)
              ->setNote($note)
              ->setNoteLe(new \DateTime($noteLe))
              ->setCommentaire($comment)
              ->setCommentaireLe(new \DateTime($commentLe))
              ->setReponse($reponse)
              ->setRepondLe($repondLe ? new \DateTime($repondLe) : null)
              ->setCommentaireSupprimeMotif(null)
              ->setCommentaireSupprimeLe(null);
            $manager->persist($n);
        }

        // Médias — galerie variable (1–8 images par laverie)
        $senlisImageCounts = [5, 3, 7, 2, 4];
        $imgOffset         = 0;
        foreach ($senlisLaveries as $i => $lav) {
            for ($j = 0; $j < $senlisImageCounts[$i]; $j++) {
                $m = new LaverieMedia();
                $m->setLaverie($lav)
                  ->setMedia($imageMedias[$imgOffset % 9 + 9])
                  ->setDescription($descPool[$j % 8]);
                $manager->persist($m);
                $imgOffset++;
            }
        }

        // Historique — 1 validation par laverie
        foreach ($senlisLaveries as $i => $lav) {
            $h = new LaverieHistoriqueInteraction();
            $h->setAdministrateur($admin);
            $h->setLaverie($lav);
            $h->setAction(ActionEnum::VALIDE);
            $h->setMotifAction(null);
            $h->setDate(new \DateTime('2026-03-0' . ($i + 1) . ' 10:00:00'));
            $manager->persist($h);
        }

        // Favoris Senlis
        $senlisLaveries[0]->addFavori($users[0]); // Luce → Parvis
        $senlisLaveries[2]->addFavori($users[0]); // Luce → Marché
        $senlisLaveries[1]->addFavori($users[1]); // Roussel → Saint-Hilaire
        $senlisLaveries[4]->addFavori($users[3]); // Lambert → Treille
        // ─────────────────────────────────────────────────────────────────────

        $manager->flush();
    }
}
