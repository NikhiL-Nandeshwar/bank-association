'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  src?: string;
  alt: string;
}

export function BookCover({ src, alt }: Props) {
  function resolveSrc(s?: string) {
    if (!s) return '/images/UPI.webp';
    if (/^https?:\/\//i.test(s) || s.startsWith('//')) return s;
    if (s.startsWith('/')) return s;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? '';
    if (base) return `${base}/${s}`;
    return `/${s}`;
  }

  const [imageSrc, setImageSrc] = useState<string>(() => resolveSrc(src));

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className="object-contain object-center"
      onError={() => setImageSrc('/images/UPI.webp')}
    />
  );
}