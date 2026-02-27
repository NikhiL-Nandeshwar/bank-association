'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="bg-slate-800 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">

        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <Image
            src="/logo.png"
            alt="KOP Bank Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
            priority
          />
          <div>
            <p className="text-sm font-semibold leading-tight">
              कोल्हापूर जिल्हा नागरी बँक्स
            </p>
            <p className="text-xs text-[#fcd62e]
">
              सहकारी असोसिएशन लि.
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/recruitment"
            className="inline-flex items-center rounded-md bg-[#fcd62e] px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-yellow-400 md:hidden"
            onClick={closeMenu}
          >
            Recruitment
          </Link>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-500 text-slate-100 hover:bg-slate-700 md:hidden"
          >
            <span className="text-lg leading-none">{isMenuOpen ? 'X' : '≡'}</span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#fcd62e]">
              {item.label}
            </Link>
          ))}
          <Link
            href="/recruitment"
            className="ml-4 inline-flex items-center rounded-md bg-[#fcd62e] px-4 py-2 text-slate-800 hover:bg-yellow-400"
          >
            Recruitment
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="border-t border-slate-700 bg-slate-800 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-sm font-medium">
            <Link
              href="/recruitment"
              onClick={closeMenu}
              className="rounded-md bg-[#fcd62e] px-3 py-2 text-slate-900"
            >
              Recruitment
            </Link>
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-md px-3 py-2 text-slate-100 hover:bg-slate-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
