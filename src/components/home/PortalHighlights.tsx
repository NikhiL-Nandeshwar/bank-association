import Link from 'next/link';

const highlightCards = [
  {
    title: 'Exam Calendar',
    description: 'Upcoming exam schedule for member banks.',
    href: '/notices',
    cta: 'View Schedule',
  },
  {
    title: 'Download Admit Card',
    description: 'Get your hall ticket for active recruitments.',
    href: '/recruitment',
    cta: 'Download',
  },
  {
    title: 'Results & Merit List',
    description: 'Check latest published results and updates.',
    href: '/notices',
    cta: 'Check Result',
  },
  {
    title: 'Candidate Helpdesk',
    description: 'Guidelines, FAQs and support contacts.',
    href: '/contact',
    cta: 'Get Support',
  },
];

export default function PortalHighlights() {
  return (
    <section className="textured-surface py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Exam Portal
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
              Candidate Services
            </h2>
          </div>
          <Link
            href="/recruitment"
            className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
          >
            Explore All
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {highlightCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            >
              <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
              <Link
                href={card.href}
                className="mt-4 inline-block text-sm font-semibold text-blue-900 hover:text-blue-700"
              >
                {card.cta} {'->'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
