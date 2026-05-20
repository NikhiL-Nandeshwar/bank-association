import { ROUTES } from '@/constants/routes.constants';

export const HEADER_COPY = {
  en: {
    home: 'Home',
    about: 'About Us',
    recruitment: 'Recruitment Updates',
    ebook: 'E-Book',
    login: 'Login / Register',
    languageLabel: 'View in',
    english: 'English',
    marathi: '\u092e\u0930\u093e\u0920\u0940',
    logoLineOne: 'Kolhapur District Urban Banks',
    logoLineTwo: 'Association Ltd.',
  },
  mr: {
    home: 'मुख्यपृष्ठ',
    about: 'आमच्याबद्दल',
    recruitment: 'भरती अपडेट्स',
    ebook: 'ई-पुस्तक',
    login: 'लॉगिन / नोंदणी',
    languageLabel: 'भाषा',
    english: 'English',
    marathi: 'मराठी',
    logoLineOne: 'कोल्हापूर जिल्हा नागरी बँक्स',
    logoLineTwo: 'असोसिएशन लि.',
  },
} as const;

export const HEADER_NAV_ITEMS = [
  {
    href: ROUTES.home,
    labelKey: 'home',
    external: false,
  },
  {
    href: ROUTES.about,
    labelKey: 'about',
    external: false,
  },
  {
    href: ROUTES.recruitment,
    labelKey: 'recruitment',
    external: false,
  },
  {
    href: 'https://digi-e-book.vercel.app/',
    labelKey: 'ebook',
    external: true,
  },
] as const;
