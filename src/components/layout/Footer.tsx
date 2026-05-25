'use client';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-700 bg-slate-500 text-slate-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">

        {/* Address */}
        <div>
          <h3 className="mb-3 text-2xl font-semibold text-[#fcd62e] hover:cursor-pointer hover:text-yellow-500">
            Association Office
          </h3>

          <p className="text-md leading-relaxed">
            कोल्हापूर जिल्हा नागरी बँक्स सहकारी असोसिएशन लि.
            <br />
            कोल्हापूर - 416012
          </p>

          <p className="mt-3 text-md">
            Phone: 0231-2627307
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="mb-3 text-2xl font-semibold text-[#fcd62e] hover:cursor-pointer hover:text-yellow-500">
            Quick Links
          </h4>

          <ul className="space-y-2 text-md">
            <li>RBI</li>
            <li>Govt. of Maharashtra</li>
            <li>Banking Regulation Act</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Copyright */}
        <div className="flex items-end text-md">
          © {year} - Kolhapur District Urban Banks Association
        </div>
      </div>
    </footer>
  );
}

