'use client';

// React
import { useState } from 'react';

// Framework
import Image from 'next/image';
import Link from 'next/link';

// Constants
import { HEADER_COPY, HEADER_NAV_ITEMS } from '@/constants/layout.constants';
import { ROUTES } from '@/constants/routes.constants';

// Utils/lib
import { usePortalLanguage } from '@/lib/usePortalLanguage';
import { cn } from '@/utils/classnames';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage } = usePortalLanguage();
  const content = HEADER_COPY[language];

  const navLinks = HEADER_NAV_ITEMS.map((item) => ({
    href: item.href,
    label: content[item.labelKey],
  }));

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-slate-800 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href={ROUTES.home} className="flex min-w-0 items-center gap-2 sm:gap-3" onClick={closeMenu}>
          <Image src="/logo.png" alt="KOP Bank Logo" width={40} height={40} className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10" priority />
          <div className="min-w-0">
            <p className="max-w-[150px] truncate text-[11px] font-semibold leading-tight sm:max-w-none sm:text-sm">{content.logoLineOne}</p>
            <p className="max-w-[150px] truncate text-[10px] text-[#fcd62e] sm:max-w-none sm:text-xs">{content.logoLineTwo}</p>
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <div className="flex items-center rounded-full border border-slate-600 bg-slate-700/60 p-0.5 text-[10px] font-semibold">
            <button type="button" onClick={() => setLanguage('mr')} className={cn('rounded-full px-2 py-1 transition', language === 'mr' ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-200')}>
              {content.marathi}
            </button>
            <button type="button" onClick={() => setLanguage('en')} className={cn('rounded-full px-2 py-1 transition', language === 'en' ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-200')}>
              EN
            </button>
          </div>

          <button type="button" aria-label="Toggle menu" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen((prev) => !prev)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-500 text-slate-100 hover:bg-slate-700">
            {isMenuOpen ? (
              <span className="text-sm font-semibold leading-none">X</span>
            ) : (
              <span className="flex flex-col gap-1" aria-hidden="true">
                <span className="block h-0.5 w-5 rounded-full bg-slate-100" />
                <span className="block h-0.5 w-5 rounded-full bg-slate-100" />
                <span className="block h-0.5 w-5 rounded-full bg-slate-100" />
              </span>
            )}
          </button>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#fcd62e]">
              {item.label}
            </Link>
          ))}

          <div className="ml-2 flex items-center gap-3 rounded-full border border-slate-600 bg-slate-700/60 px-3 py-1.5 text-xs">
            <span className="text-slate-300">{content.languageLabel}</span>
            <div className="flex items-center rounded-full bg-slate-800/80 p-1 font-semibold">
              <button type="button" onClick={() => setLanguage('mr')} className={cn('rounded-full px-3 py-1 transition', language === 'mr' ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-200')}>
                {content.marathi}
              </button>
              <button type="button" onClick={() => setLanguage('en')} className={cn('rounded-full px-3 py-1 transition', language === 'en' ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-200')}>
                {content.english}
              </button>
            </div>
          </div>

          <Link href={ROUTES.login} className="inline-flex items-center rounded-md bg-[#fcd62e] px-4 py-2 text-slate-800 hover:bg-yellow-400">
            {content.login}
          </Link>
        </nav>
      </div>

      {isMenuOpen && (
        <nav className="border-t border-slate-700 bg-slate-800 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-sm font-medium">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu} className={cn('rounded-md px-3 py-2', item.href === ROUTES.recruitment ? 'bg-[#fcd62e] text-slate-900' : 'text-slate-100 hover:bg-slate-700')}>
                {item.label}
              </Link>
            ))}
            <Link href={ROUTES.login} onClick={closeMenu} className="mt-2 rounded-md bg-[#fcd62e] px-3 py-2 text-center font-semibold text-slate-900 hover:bg-yellow-400">
              {content.login}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
