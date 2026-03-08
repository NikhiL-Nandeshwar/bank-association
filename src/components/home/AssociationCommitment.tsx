const focusAreas = [
  {
    title: 'मार्गदर्शन आणि धोरण सहाय्य',
    description:
      'सदस्य बँकांना नियमपालन, प्रशासकीय निर्णय आणि दैनंदिन व्यवस्थापनात स्पष्ट दिशा मिळावी यासाठी तज्ज्ञ सल्ला दिला जातो.',
  },
  {
    title: 'प्रशिक्षण आणि कौशल्य विकास',
    description:
      'संचालक, अधिकारी आणि कर्मचारी यांच्यासाठी व्यवहार्य प्रशिक्षण कार्यक्रम राबवून संस्थेची कामगिरी अधिक सक्षम केली जाते.',
  },
  {
    title: 'वसुली व समन्वय मदत',
    description:
      'थकबाकी प्रकरणांमध्ये समन्वय, प्रक्रियात्मक मार्गदर्शन आणि आवश्यक कागदपत्रीय सहाय्य देऊन परिणामकारक कृतीस गती दिली जाते.',
  },
  {
    title: 'पुनर्बांधणी व पुनरुज्जीवन समर्थन',
    description:
      'अडचणीत असलेल्या बँकांसाठी टप्प्याटप्प्याने पुनर्बांधणी आराखडा, जोखीम नियंत्रण आणि बाह्य तांत्रिक मदतीचे मार्गदर्शन केले जाते.',
  },
];

export default function AssociationCommitment() {
  return (
    <section className="relative overflow-hidden bg-slate-100 py-16 md:py-20">
      {/* <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950" /> */}
      <div className="absolute -left-16 top-24 h-64 w-64 rounded-full bg-[#fcd62e]/25 blur-3xl" />
      <div className="absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-10">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex rounded-full bg-blue-950 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-[#fcd62e]">
              आमची बांधिलकी
            </span>
            <h2 className="mt-4 text-lg font-bold leading-tight text-slate-900 md:text-2xl">
              सदस्य बँकांसाठी ठोस साथ
            </h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              कोल्हापूर जिल्हा नागरी बँक्स सहकारी असोसिएशन सदस्य संस्थांना नियोजन, प्रशिक्षण आणि
              अंमलबजावणी या तिन्ही स्तरांवर ठोस सहाय्य देऊन अधिक सक्षम आणि लोकाभिमुख बँकिंग
              व्यवस्थेकडे वाटचाल घडवते.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {focusAreas.map((item, index) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
              >
                <div className="absolute right-0 top-0 h-20 w-20 -translate-y-8 translate-x-8 rounded-full bg-[#fcd62e]/35 transition group-hover:bg-[#fcd62e]/50" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-xs font-bold text-[#fcd62e]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px w-10 bg-slate-300" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold leading-snug text-slate-900 md:text-base">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
