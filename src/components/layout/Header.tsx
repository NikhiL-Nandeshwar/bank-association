'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

const copy = {
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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage } = usePortalLanguage();

  const navLinks = [
    { href: '/', label: copy[language].home },
    { href: '/about', label: copy[language].about },
    { href: '/recruitment', label: copy[language].recruitment },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-slate-800 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <Image src="/logo.png" alt="KOP Bank Logo" width={40} height={40} className="h-10 w-10 object-contain" priority />
          <div>
            <p className="text-sm font-semibold leading-tight">{copy[language].logoLineOne}</p>
            <p className="text-xs text-[#fcd62e]">{copy[language].logoLineTwo}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center rounded-full border border-slate-600 bg-slate-700/60 p-1 text-[11px] font-semibold">
            <button type="button" onClick={() => setLanguage('mr')} className={`rounded-full px-2 py-1 transition ${language === 'mr' ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-200'}`}>
              {copy[language].marathi}
            </button>
            <button type="button" onClick={() => setLanguage('en')} className={`rounded-full px-2 py-1 transition ${language === 'en' ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-200'}`}>
              EN
            </button>
          </div>

          <Link href="/login" className="inline-flex items-center rounded-md bg-[#fcd62e] px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-400" onClick={closeMenu}>
            {copy[language].login}
          </Link>

          <button type="button" aria-label="Toggle menu" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((prev) => !prev)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-500 text-slate-100 hover:bg-slate-700">
            <span className="text-sm font-semibold leading-none">{isMenuOpen ? 'X' : '|||'} </span>
          </button>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#fcd62e]">
              {item.label}
            </Link>
          ))}

          <div className="ml-2 flex items-center gap-3 rounded-full border border-slate-600 bg-slate-700/60 px-3 py-1.5 text-xs">
            <span className="text-slate-300">{copy[language].languageLabel}</span>
            <div className="flex items-center rounded-full bg-slate-800/80 p-1 font-semibold">
              <button type="button" onClick={() => setLanguage('mr')} className={`rounded-full px-3 py-1 transition ${language === 'mr' ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-200'}`}>
                {copy[language].marathi}
              </button>
              <button type="button" onClick={() => setLanguage('en')} className={`rounded-full px-3 py-1 transition ${language === 'en' ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-200'}`}>
                {copy[language].english}
              </button>
            </div>
          </div>

          <Link href="/login" className="inline-flex items-center rounded-md bg-[#fcd62e] px-4 py-2 text-slate-800 hover:bg-yellow-400">
            {copy[language].login}
          </Link>
        </nav>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-slate-700 bg-slate-800 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-sm font-medium">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu} className={`rounded-md px-3 py-2 ${item.href === '/recruitment' ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-100 hover:bg-slate-700'}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
