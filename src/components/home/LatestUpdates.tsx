import Link from 'next/link';

const notices = [
  'Recruitment 2026-27 online form window extended till 15 March 2026.',
  'Exam center allocation notice published for KM-015.',
  'Document verification guidelines updated for shortlisted candidates.',
];

const events = [
  { title: 'Mock Test Window', date: '05 Mar 2026' },
  { title: 'KM-015 Online Exam', date: '12 Mar 2026' },
  { title: 'Interview Guidance Session', date: '18 Mar 2026' },
];

export default function LatestUpdates() {
  return (
    <section className="bg-slate-800 py-14 text-slate-100">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-600 bg-slate-900/55 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Latest Notices</h3>
            <Link href="/notices" className="text-xs font-semibold text-[#fcd62e] hover:underline">
              View All
            </Link>
          </div>
          <ul className="space-y-3 text-sm text-slate-200">
            {notices.map((notice) => (
              <li key={notice} className="border-b border-slate-600 pb-3 last:border-b-0 last:pb-0">
                {notice}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-600 bg-slate-900/55 p-6">
          <h3 className="mb-4 text-lg font-semibold">Upcoming Events</h3>
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.title}
                className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3"
              >
                <p className="text-sm text-slate-100">{event.title}</p>
                <span className="rounded-md bg-[#fcd62e] px-2 py-1 text-xs font-semibold text-slate-900">
                  {event.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
