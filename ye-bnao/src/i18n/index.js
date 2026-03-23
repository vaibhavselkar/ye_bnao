import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import hinglish from './locales/hinglish.json';
import bn from './locales/bn.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';
import ml from './locales/ml.json';
import or from './locales/or.json';
import as_lang from './locales/as.json';
import ur from './locales/ur.json';
import mai from './locales/mai.json';
import sat from './locales/sat.json';
import ks from './locales/ks.json';
import ne from './locales/ne.json';
import sd from './locales/sd.json';
import kok from './locales/kok.json';
import doi from './locales/doi.json';
import brx from './locales/brx.json';
import mni from './locales/mni.json';
import sa from './locales/sa.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    hinglish: { translation: hinglish },
    bn: { translation: bn },
    mr: { translation: mr },
    ta: { translation: ta },
    te: { translation: te },
    kn: { translation: kn },
    gu: { translation: gu },
    pa: { translation: pa },
    ml: { translation: ml },
    or: { translation: or },
    as: { translation: as_lang },
    ur: { translation: ur },
    mai: { translation: mai },
    sat: { translation: sat },
    ks: { translation: ks },
    ne: { translation: ne },
    sd: { translation: sd },
    kok: { translation: kok },
    doi: { translation: doi },
    brx: { translation: brx },
    mni: { translation: mni },
    sa: { translation: sa },
  },
  lng: 'en',
  fallbackLng: ['hi', 'en'],
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v3',
});

export default i18n;
