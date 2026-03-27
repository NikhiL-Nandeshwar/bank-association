import Link from 'next/link';

const processSteps = [
  'Check current recruitment notices and bank-wise openings.',
  'Read eligibility, required documents, and application dates carefully.',
  'Apply only when the recruitment window is officially open.',
  'Track updates for exam, interview, and document verification.',
];

const requiredItems = [
  'Recent passport-size photo',
  'Aadhaar and PAN details',
  'Academic qualification details',
  'Resume or profile link',
  'Experience summary and preferred posting location',
];

const faqs = [
  {
    question: 'Can I apply anytime?',
    answer: 'No. Applications should be submitted only during the active recruitment dates announced by the association or member bank.',
  },
  {
    question: 'Where will the application form appear?',
    answer: 'The application form is shown only when a recruitment is open and you enter through an active Apply Now link.',
  },
  {
    question: 'What should I keep ready before applying?',
    answer: 'Keep your identity details, education records, experience summary, and resume link ready so you can complete the form smoothly.',
  },
];

export default function RecruitmentPage() {
  return (
    <section className="bg-[radial-gradient(circle_at_top,_rgba(252,214,46,0.18),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] py-12 md:py-16">
      <div className="mx-auto max-w-7xl space-y-8 px-4">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
          <div className="bg-slate-700 px-6 py-10 text-white md:px-10">
            <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
              Recruitment updates
            </span>
            <h1 className="mt-4 text-3xl font-semibold md:text-4xl">Recruitment notices, dates, and application guidance</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              This page is the right place for applicants to understand the process before applying. The application form is not always open. It becomes available only when a recruitment window is live.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#recruitments"
                className="inline-flex items-center rounded-full bg-[#fcd62e] px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400"
              >
                View current openings
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                About the Association
              </Link>
            </div>
          </div>

          <div className="grid gap-6 px-6 py-8 md:px-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="rounded-[1.75rem] bg-slate-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">How recruitment works</p>
                <div className="mt-4 space-y-4">
                  {processSteps.map((step, index) => (
                    <div key={step} className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-700 text-sm font-semibold text-amber-300">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Before applying, keep these ready</p>
                <ul className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
                  {requiredItems.map((item) => (
                    <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.75rem] bg-amber-50 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Important note</p>
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  Applicants should not expect a permanent registration form on this page. The form should be opened only through an active recruitment listing so the correct bank and recruitment code are captured.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Frequently asked questions</p>
                <div className="mt-4 space-y-4">
                  {faqs.map((item) => (
                    <div key={item.question} className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{item.question}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

