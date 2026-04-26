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
                'latitude'               => 49.0415,
                'longitude'              => 2.5283,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '12',
                'rue'                    => 'Allée de la Gare',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.0530,
                'longitude'              => 2.5150,
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
                'latitude'               => 49.1130,
                'longitude'              => 2.4390,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            // Groupe A (suite) — 10 laveries supplémentaires dans les 5km de Survilliers
            [
                'adresse'                => '3',
                'rue'                    => 'Rue du Château d\'eau',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.0450,
                'longitude'              => 2.5320,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '7',
                'rue'                    => 'Rue des Lilas',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.0380,
                'longitude'              => 2.5200,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '15',
                'rue'                    => 'Allée des Acacias',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.0300,
                'longitude'              => 2.5350,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '2',
                'rue'                    => 'Rue du Moulin',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.0470,
                'longitude'              => 2.5450,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '9',
                'rue'                    => 'Avenue de la Forêt',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.0600,
                'longitude'              => 2.5400,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '18',
                'rue'                    => 'Rue des Vignes',
                'code_postal'            => 95380,
                'ville'                  => 'Louvres',
                'pays'                   => 'France',
                'latitude'               => 49.0200,
                'longitude'              => 2.5300,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '4',
                'rue'                    => 'Rue de la Croix',
                'code_postal'            => 95380,
                'ville'                  => 'Louvres',
                'pays'                   => 'France',
                'latitude'               => 49.0150,
                'longitude'              => 2.5400,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '6',
                'rue'                    => 'Rue de l\'Église',
                'code_postal'            => 95470,
                'ville'                  => 'Fosses',
                'pays'                   => 'France',
                'latitude'               => 49.0680,
                'longitude'              => 2.5050,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '11',
                'rue'                    => 'Grande Rue',
                'code_postal'            => 95380,
                'ville'                  => 'Chennevières-lès-Louvres',
                'pays'                   => 'France',
                'latitude'               => 49.0480,
                'longitude'              => 2.4900,
                'statut_geolocalisation' => GeoStatutEnum::GEOLOCALISE,
            ],
            [
                'adresse'                => '1',
                'rue'                    => 'Rue de Picardie',
                'code_postal'            => 95470,
                'ville'                  => 'Survilliers',
                'pays'                   => 'France',
                'latitude'               => 49.0350,
                'longitude'              => 2.5450,
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
        // $adressesGeo[0] = Survilliers Mairie      | $adressesGeo[1] = Survilliers Gare
        // $adressesGeo[2] = Chantilly Connétable    | $adressesGeo[3] = Senlis République
        // $adressesGeo[4] = Luzarches Parc
        // $adressesGeo[5] = Marseille Vieux-Port    | $adressesGeo[6] = Bordeaux Chartrons
        // $adressesGeo[7] = Lyon République         | $adressesGeo[8] = Lille Paris
        // $adressesGeo[9] = Strasbourg Bouchers

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
        foreach ($laveriesGeoData as $data) {
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

        $geoMedia3 = new LaverieMedia();
        $geoMedia3->setLaverie($laveriesGeo[3])->setMedia($medias[0])->setDescription('Vue de la façade');
        $manager->persist($geoMedia3);

        $geoMedia9 = new LaverieMedia();
        $geoMedia9->setLaverie($laveriesGeo[9])->setMedia($medias[1])->setDescription('Intérieur de la laverie');
        $manager->persist($geoMedia9);
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

        $manager->flush();
    }
}
