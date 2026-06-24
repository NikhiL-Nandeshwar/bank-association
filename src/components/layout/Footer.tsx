'use client';

import { Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-700 bg-slate-500 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">

        {/* Address */}
        <div>
          <h3 className="mb-4 text-2xl font-semibold text-[#fcd62e]">
            Association Office
          </h3>

          <p className="text-md leading-7">
            Kolhapur District Urban Co-operative Banks Asso. Ltd.
            <br />
            C.S. 1458, G.N. Chambers,
            <br />
            Mangalwar Peth, Kolhapur,
            <br />
            Maharashtra - 416012
          </p>

          <a
            href="tel:02312627307"
            className="mt-4 inline-block font-medium transition-colors hover:text-[#fcd62e]"
          >
            📞 0231-2627307
          </a>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-3 text-2xl font-semibold text-[#fcd62e]">
            Quick Links
          </h4>

          <ul className="space-y-2 text-md">
            <li>
              <a
                href="https://rbi.org.in"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-[#fcd62e]"
              >
                RBI
              </a>
            </li>

            <li>
              <a
                href="https://www.maharashtra.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-[#fcd62e]"
              >
                Govt. of Maharashtra
              </a>
            </li>

            {/* <li>
              <Link
                href="/banking-regulation-act"
                className="transition hover:text-[#fcd62e]"
              >
                Banking Regulation Act
              </Link>
            </li> */}

            <li className="cursor-not-allowed text-slate-400">
              Banking Regulation Act (Coming Soon)
            </li>

            {/* <li>
              <Link
                href="/privacy-policy"
                className="transition hover:text-[#fcd62e]"
              >
                Privacy Policy
              </Link>
            </li> */}
            <li className="cursor-not-allowed text-slate-400">
              Privacy Policy (Coming Soon)
            </li>
          </ul>
        </div>

        {/* Copyright */}
        <div className="flex flex-col justify-end text-md">
          <p>
            © {year} - Kolhapur District Urban Co-operative Banks Association
          </p>

          <p className="mt-2 text-sm text-slate-200">
            Managed by{' '}
            <a
              href="https://www.nexspiretechnologies.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#fcd62e] hover:text-yellow-400"
            >
              Nexspire Technologies
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}