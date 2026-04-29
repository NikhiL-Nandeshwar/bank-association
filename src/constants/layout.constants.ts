import { ROUTES } from '@/constants/routes.constants';

export const HEADER_COPY = {
  en: {
    home: 'Home',
    about: 'About Us',
    recruitment: 'Recruitment Updates',
    login: 'Login / Register',
    languageLabel: 'View in',
    english: 'English',
    marathi: '\u092e\u0930\u093e\u0920\u0940',
    logoLineOne: 'Kolhapur District Urban Banks',
    logoLineTwo: 'Association Ltd.',
  },
  mr: {
    home: '\u092e\u0941\u0916\u094d\u092f\u092a\u0943\u0937\u094d\u0920',
    about: '\u0906\u092e\u091a\u094d\u092f\u093e\u092c\u0926\u094d\u0926\u0932',
    recruitment: '\u092d\u0930\u0924\u0940 \u0905\u0926\u094d\u092f\u0924\u0928\u0947',
    login: '\u0932\u0949\u0917\u093f\u0928 / \u0928\u094b\u0902\u0926\u0923\u0940',
    languageLabel: '\u092d\u093e\u0937\u093e',
    english: 'English',
    marathi: '\u092e\u0930\u093e\u0920\u0940',
    logoLineOne: '\u0915\u094b\u0932\u094d\u0939\u093e\u092a\u0942\u0930 \u091c\u093f\u0932\u094d\u0939\u093e \u0928\u093e\u0917\u0930\u0940 \u092c\u0901\u0915\u094d\u0938',
    logoLineTwo: '\u0938\u0939\u0915\u093e\u0930\u0940 \u0905\u0938\u094b\u0938\u093f\u090f\u0936\u0928 \u0932\u093f.',
  },
} as const;

export const HEADER_NAV_ITEMS = [
  { href: ROUTES.home, labelKey: 'home' },
  { href: ROUTES.about, labelKey: 'about' },
  { href: ROUTES.recruitment, labelKey: 'recruitment' },
] as const;
