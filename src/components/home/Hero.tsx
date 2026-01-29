// React/Core
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero-bg.png')",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-slate-600/85" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="max-w-2xl">

          <h1 className="text-3xl md:text-4xl font-bold leading-snug text-white">
            ऑनलाइन अर्ज पोर्टल 2026-27 साठी
            <br />
            <span className="text-[#fcd62e]">
              भरती प्रक्रिया
            </span>
          </h1>

          <p className="mt-4 text-sm md:text-base text-white/90">
            सदस्य सहकारी बँकांच्या पद भरती प्रक्रियेसाठी
            ऑनलाइन अर्ज सादर करा.
          </p>

          <div className="mt-8">
            <Link
              href="/recruitment"
              className="inline-flex items-center rounded-md bg-[#fcd62e] px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400"
            >
              Register Now
            </Link>
          </div>

        </div>
      </div>

    </section>
  );
}
