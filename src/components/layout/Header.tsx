'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-slate-800 text-white ">
      <div className="max-w-7xl bg- mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200" />
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

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/about" className="hover:text-[#fcd62e]">About</Link>
          <Link href="/services" className="hover:text-[#fcd62e]">Services</Link>
          <Link href="/gallery" className="hover:text-[#fcd62e]">Gallery</Link>
          <Link href="/contact" className="hover:text-[#fcd62e]">Contact</Link>
          <Link
            href="/recruitment"
            className="ml-4 inline-flex items-center rounded-md bg-[#fcd62e]
 px-4 py-2 text-slate-800 hover:bg-yellow-400"
          >
            Recruitment
          </Link>
        </nav>
      </div>
    </header>
  );
}
