export const FORM_STYLES = {
  input:
    'mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100',
  inputInvalid:
    'border-red-300 focus:border-red-500 focus:ring-red-100',
  label: 'text-sm font-medium text-slate-800',
  error:
    'mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700',
  submitButton:
    'mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#fcd62e] px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70',
} as const;
