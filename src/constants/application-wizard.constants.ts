export type LanguageName = 'marathi' | 'hindi' | 'english';
export type LanguageAbility = 'read' | 'write' | 'speak';
export type LanguageSkills = Record<LanguageName, Record<LanguageAbility, boolean>>;

export type EducationEntry = {
  level: string;
  completed: string;
  institute: string;
  board: string;
  specialization: string;
  score: string;
  className: string;
  passedMonthYear: string;
};

export type SummaryTone = keyof typeof SUMMARY_TONE_CLASS_NAMES;

export const APPLICATION_STEPS = [
  { id: '01', title: 'Role', description: 'Confirm the recruitment and bank details.' },
  { id: '02', title: 'Profile', description: 'Tell us who you are.' },
  { id: '03', title: 'Contact', description: 'Add your address and communication details.' },
  { id: '04', title: 'Education', description: 'Share detailed academic background.' },
  { id: '05', title: 'Experience', description: 'Highlight your work readiness.' },
  { id: '06', title: 'Documents', description: 'Provide IDs, links, and preferences.' },
  { id: '07', title: 'Review', description: 'Verify everything before payment.' },
  { id: '08', title: 'Payment', description: 'Complete the demo application payment.' },
] as const;

export const APPLICATION_INPUT_CLASS_NAME =
  'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-amber-100';

export const EDUCATION_TEMPLATE: EducationEntry[] = [
  { level: 'SSC / 10th', completed: '', institute: '', board: '', specialization: '', score: '', className: '', passedMonthYear: '' },
  { level: 'HSC / 12th', completed: '', institute: '', board: '', specialization: '', score: '', className: '', passedMonthYear: '' },
  { level: 'Graduation', completed: '', institute: '', board: '', specialization: '', score: '', className: '', passedMonthYear: '' },
  { level: 'Post Graduation', completed: '', institute: '', board: '', specialization: '', score: '', className: '', passedMonthYear: '' },
  { level: 'Computer Certification', completed: '', institute: '', board: '', specialization: '', score: '', className: '', passedMonthYear: '' },
];

export const EMPTY_LANGUAGE_SKILLS: LanguageSkills = {
  marathi: { read: false, write: false, speak: false },
  hindi: { read: false, write: false, speak: false },
  english: { read: false, write: false, speak: false },
};

export const LANGUAGE_NAMES: LanguageName[] = ['marathi', 'hindi', 'english'];
export const LANGUAGE_ABILITIES: LanguageAbility[] = ['read', 'write', 'speak'];

export const SUMMARY_TONE_CLASS_NAMES = {
  slate: 'bg-slate-50 text-slate-500',
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
} as const;
