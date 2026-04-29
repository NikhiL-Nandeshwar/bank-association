export default function TopBar() {
  return (
    <div className="w-full border-b border-slate-200 bg-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-2 text-[11px] leading-tight text-text-secondary sm:flex-row sm:items-center sm:justify-between sm:text-xs">
        <p>
          Office Timing: Mon - Sat | 10:00 AM - 5:00 PM
        </p>
        <p className="sm:text-right">
          Helpline: 0231-2627307
        </p>
      </div>
    </div>
  );
}
