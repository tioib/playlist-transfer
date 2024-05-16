import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import LanguageDetector from 'i18next-browser-languagedetector';
// don't want to use this?
// have a look at the Quick start guide 
// for passing in lng and translations on init

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    debug: true,
    returnObjects: true,

    resources: {
      en: {
        translation: {
          homePageTitle: "Transfer playlists between YouTube and Spotify",
          language: "Language",

          playlists: {
            cancel: "CANCEL",
            create: "CREATE",

            which: {
              youtube: "Create a new playlist in your Spotify profile from this YouTube playlist",
              spotify: "Create a new playlist in your YouTube channel from this Spotify playlist"
            },

            title: {
              t: "Title",
              placeholder: "New playlist's title"
            },
            desc: {
              t: "Description",
              placeholder: "New playlist's description"
            },

            youtubeT: {
              title: "YouTube Playlists",
              notFound: "YOUTUBE PLAYLISTS NOT FOUND"
            },

            spotifyT: {
              title: "Spotify Playlists",
              notFound: "SPOTIFY PLAYLISTS NOT FOUND"
            }
          }
        }
      },

      es: {
        translation: {
          homePageTitle: "Transfiere playlists entre YouTube y Spotify",
          language: "Idioma",

          playlists: {
            cancel: "CANCELAR",
            create: "CREAR",

            which: {
              youtube: "Crear una nueva playlist en tu perfil de Spotify con esta playlist de YouTube",
              spotify: "Crear una nueva playlist en tu canal de YouTube con esta playlist de Spotify"
            },

            title: {
              t: "Título",
              placeholder: "Título de la playlist a crear"
            },
            desc: {
              t: "Descripción",
              placeholder: "Descripción de la playlist a crear"
            },

            youtubeT: {
              title: "Playlists de YouTube",
              notFound: "NO SE ENCONTRARON PLAYLISTS DE YOUTUBE"
            },

            spotifyT: {
              title: "Playlists de Spotify",
              notFound: "NO SE ENCONTRARON PLAYLISTS DE SPOTIFY"
            }
          }
        }
      }
    }
  });


export default i18n;