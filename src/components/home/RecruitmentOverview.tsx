// React/Core
import Link from 'next/link';

const currentRecruitments = [
    {
        code: 'KM-016',
        name: 'शिवाजी सहकारी बँक लि., कोल्हापूर',
        date: '16-10-2025',
        time: '10:00 AM',
    },
    {
        code: 'KM-015',
        name: 'पुणे सहकारी बँक लि., पुणे',
        date: '09-01-2026',
        time: '10:00 AM',
    },
    {
        code: 'KM-014',
        name: 'पुणे मर्चंट्स को-ऑप बँक लि., पुणे',
        date: '02-01-2026',
        time: '10:00 AM',
    },
    {
        code: 'KM-013',
        name: 'शिवाबासवन्ना जनता को-ऑप बँक लि., कोल्हापूर',
        date: '31-12-2025',
        time: '10:00 AM',
    },
];

export default function RecruitmentOverview() {
    return (
        <section className="bg-slate-100 py-14">
            <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 gap-8 md:grid-cols-4">

                {/* LEFT - TABLE */}
                <div className="md:col-span-3 bg-white rounded-xl shadow-sm">

                    {/* Tabs */}
                    <div className="flex border-b">
                        <button className="px-6 py-3 text-sm bg-blue-950 text-[#fcd62e] font-semibold border-b-2 border-yellow-400">
                            Current Recruitments
                        </button>
                        <button className="px-6 py-3 text-sm text-slate-500">
                            Previous Recruitments
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3 text-left">Recruitment Code</th>
                                    <th className="px-4 py-3 text-left">Recruitment Name</th>
                                    <th className="px-4 py-3 text-left">Start Date / Time</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRecruitments.map((item) => (
                                    <tr
                                        key={item.code}
                                        className="border-t hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            {item.code}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.date} <br />
                                            <span className="text-xs text-slate-500">
                                                {item.time}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href="/recruitment"
                                                className="inline-block rounded-md bg-[#fcd62e] px-4 py-1.5 text-xs font-semibold text-gray-800 hover:bg-yellow-400"
                                            >
                                                Apply Now
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer note */}
                    <div className="px-4 py-3 text-xs text-slate-500">
                        सर्व पद भरती प्रक्रिया सहकारी बँकांद्वारे राबविण्यात येते.
                    </div>
                </div>

                {/* RIGHT - SIDEBAR */}
                <div className="space-y-6">

                    {/* Banking Regulation Acts */}
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h3 className="mb-4 rounded-lg bg-gradient-to-r from-slate-600 to-slate-800 p-2 text-sm font-semibold text-white">
                            Banking Regulation Acts
                        </h3>

                        <ul className="space-y-3 text-sm text-slate-700">
                            <li>- Banking Regulation Act</li>
                            <li>- Cooperative Department Circulars</li>
                            <li>- RBI & NABARD Updates</li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-xl shadow-sm p-5">
                        <h3 className="mb-4 rounded-lg bg-gradient-to-r from-slate-600 to-slate-800 p-2 text-sm font-semibold text-white">
                            Quick Links
                        </h3>
                        <ul className="space-y-3 text-sm text-slate-700">
                            <li>- अर्ज मार्गदर्शक सूचना</li>
                            <li>- बँक भरती परिपत्रक</li>
                            <li>- शुल्क व अटी</li>
                        </ul>
                    </div>

                </div>
            </div>
        </section>
    );
}
