import Link from 'next/link';

const highlights = [
  'Coordinates recruitment support for member cooperative banks.',
  'Improves communication around notices, timelines, and applicant readiness.',
  'Helps make the recruitment journey more structured and transparent.',
];

export default function AboutPage() {
  return (
    <section className="bg-[radial-gradient(circle_at_top_left,_rgba(252,214,46,0.2),_transparent_26%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
          <div className="grid gap-8 px-6 py-10 md:px-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                About us
              </span>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">
                Kolhapur District Urban Banks Association recruitment portal
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                This portal is designed to present recruitment notices, guide applicants, and streamline the application journey for member banks. Instead of sending every visitor directly into a form, it helps people understand the process first and apply only during active recruitment windows.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/recruitment"
                  className="inline-flex items-center rounded-full bg-slate-700 hover:bg-slate-600 px-5 py-3 text-sm font-semibold text-white"
                >
                  Recruitment Updates
                </Link>
                <Link
                  href="/#recruitments"
                  className="inline-flex items-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900"
                >
                  Current Openings
                </Link>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-slate-700 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">What this portal focuses on</p>
              <div className="mt-5 space-y-4">
                {highlights.map((item, index) => (
                  <div key={item} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-amber-300">
                      0{index + 1}
                    </div>
                    <p className="text-sm leading-7 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

