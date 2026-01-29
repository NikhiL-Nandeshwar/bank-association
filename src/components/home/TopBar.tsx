export default function TopBar() {
  return (
    <div className="w-full p-2 bg-slate-100 border-b-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-1 flex items-center justify-between text-xs text-text-secondary">
        
        {/* Left */}
        <p>
          Office Timing: Mon - Sat | 10:00 AM - 5:00 PM
        </p>

        {/* Right */}
        <p>
          Helpline: 0231-2627307
        </p>

      </div>
    </div>
  );
}
