const announcementText =
  'कोल्हापूर जिल्हा नागरी बॅंक्स सहकारी असोसिएशन लि. मध्ये आपले स्वागत आहे. ऑनलाइन परीक्षा व भरती पोर्टलवरील ताज्या सूचना येथे पाहा.';

export default function AnnouncementMarquee() {
  return (
    <section className="border-y border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
        <span className="shrink-0 rounded-md bg-amber-500 px-2.5 py-1 text-xs font-semibold text-slate-900">
          सूचना
        </span>

        <div className="relative flex-1 overflow-hidden">
          <div
            className="flex w-max min-w-full items-center gap-8 whitespace-nowrap text-sm font-medium text-slate-700 will-change-transform"
            style={{ animation: 'marquee-scroll 22s linear infinite' }}
          >
            <span>{announcementText}</span>
            <span aria-hidden="true">{announcementText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
