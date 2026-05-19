'use client';

import { HERO_COPY } from '@/constants/home.constants';
import { ROUTES } from '@/constants/routes.constants';
import Link from 'next/link';
import Image from 'next/image';
import { usePortalLanguage } from '@/lib/usePortalLanguage';

export default function Hero() {
  const { language } = usePortalLanguage();
  const content = HERO_COPY[language];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[#f9f6f7]" />

      <div className="relative z-10 mx-auto max-w-7xl px-12 py-14">
        <div className="grid items-center gap-12 md:grid-cols-[320px_1fr]">

          {/* Left Logo */}
          <div className="flex justify-center md:justify-start">
            <Image
              src="/logo.png"
              alt="Logo"
              width={400}
              height={400}
              className="h-auto w-64 md:w-80 lg:w-96 object-contain"
              priority
            />
          </div>

          {/* Right Content */}
          <div className="max-w-2xl text-center md:text-left">
            <h1 className="text-3xl font-bold leading-snug text-[#b13c7a] md:text-4xl">
              {content.titleLineOne}
              <br />
              <span className="text-[#bb7d9e] text-[33px]">
                {content.titleLineTwo}
              </span>
            </h1>

            <p className="mt-4 text-xl text-[#b13c7a]/80">
              {content.description}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link
                href={ROUTES.about}
                className="inline-flex items-center rounded-md bg-[] border border-[#b13c7a] px-5 py-3 text-md font-semibold text-[#b13c7a] shadow-sm transition hover:bg-[#f9e7f1]"              >
                {content.about}
              </Link>

              <Link
                href={ROUTES.recruitment}
                className="inline-flex items-center rounded-md border border-[#c63b85] bg-[#b13c7a]/80 hover:bg-[#b13c7a] px-5 py-3 text-md font-semibold text-white backdrop-blur-sm transition"              >
                {content.recruitment}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}