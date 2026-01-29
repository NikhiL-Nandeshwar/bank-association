export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Address */}
        <div>
          <h4 className="text-[#fcd62e] hover:cursor-pointer hover:text-yellow-500 font-semibold mb-3">
            Association Office
          </h4>
          <p className="text-sm leading-relaxed">
            कोल्हापूर जिल्हा नागरी बँक्स सहकारी असोसिएशन लि.<br />
            कोल्हापूर - 416012
          </p>
          <p className="mt-3 text-sm">
            Phone: 0231-2627307
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-[#fcd62e] hover:cursor-pointer hover:text-yellow-500 font-semibold mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            <li>RBI</li>
            <li>Govt. of Maharashtra</li>
            <li>Banking Regulation Act</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Copyright */}
        <div className="flex items-end text-sm">
          © {new Date().getFullYear()} Kolhapur District Urban Banks Association
        </div>
      </div>
    </footer>
  );
}
