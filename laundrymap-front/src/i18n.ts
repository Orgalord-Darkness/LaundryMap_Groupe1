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
      // add more keys as needed
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
      // add more keys as needed
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
