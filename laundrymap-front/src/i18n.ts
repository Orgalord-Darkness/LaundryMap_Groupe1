import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      connexion: 'Connexion',
      email: 'Email',
      mot_de_passe: 'Mot de passe',
      inscription: 'Inscription',
      en_tant_que_utilisateur: 'en tant qu\'utilisateur',
      en_tant_que_professionnel: 'en tant que professionnel',
      mes_informations: 'Mes informations',
      modifier_mes_informations: 'Modifier mes informations',
      consigne_co_pro: 'Se connecter en tant que professionnel ?',
      // Recherche / carte
      search_placeholder: 'Ville, adresse ou code postal...',
      search_button: 'Rechercher',
      search_title: 'Liste des laveries',
      search_invite: 'Saisissez une ville ou un code postal pour trouver des laveries près de chez vous.',
      search_no_results: 'Aucune laverie trouvée dans ce périmètre. Essayez d\'élargir votre recherche.',
      search_error: 'Une erreur est survenue. Veuillez réessayer.',
      search_open: 'Ouverte',
      search_loading: 'Recherche en cours...',
      consigne_co_google: 'Si vous utilisez votre compte google merci de cliquer sur le bouton ci-dessous pour vous connecter', 
      mdp_oublie: 'Mot de passe oublié ?',
      lien_inscription: 'Pas de compte ? Cliquer ici pour s\'inscrire',
    },
  },
  en: {
    translation: {
      connexion: 'Login',
      email: 'Email',
      mot_de_passe: 'Password',
      inscription: 'Registration',
      en_tant_que_utilisateur: 'as user',
      en_tant_que_professionnel: 'as professional',
      mes_informations: 'My information',
      modifier_mes_informations: 'Update my information',
      consigne_co_pro: 'Login as a professional ?',
      consigne_co_google: 'If you are using your google account please click on the button below to login', 
      mdp_oublie: 'Forgot password ?',
      lien_inscription: 'No account ? Click here to register', 
      // Search / map
      search_placeholder: 'City, address or postal code...',
      search_button: 'Search',
      search_title: 'Laundry list',
      search_invite: 'Enter a city or postal code to find laundries near you.',
      search_no_results: 'No laundry found in this area. Try expanding your search.',
      search_error: 'An error occurred. Please try again.',
      search_open: 'Open',
      search_loading: 'Searching...',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
