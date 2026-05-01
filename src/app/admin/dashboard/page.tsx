'use client';

import { createBank, createVacancy, getVacancies, publishVacancy, updateVacancy } from '@/actions/api';
import { STORAGE_KEYS } from '@/constants/storage.constants';
import { createBankSchema } from '@/schemas/bank.schema';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes.constants';
import { createVacancySchema } from '@/schemas/vacancy.schema';
import type { ApiPagedResult, Vacancy } from '@/types/api.types';
import { getErrorMessage } from '@/utils/api-error';
import { getZodFieldErrors } from '@/utils/validation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ADMIN_DASHBOARD_MESSAGES } from './messages';

type AdminBank = {
  bankId: number;
  bankName: string;
  bankNameMarathi?: string;
  bankCode?: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl: string;
};

type AdminRecruitment = {
  id: number;
  bankId: number;
  bankName: string;
  bankCode?: string;
  code: string;
  postName: string;
  postNameMarathi: string;
  totalSeats: string;
  applicationStartDate: string;
  applicationEndDate: string;
  applicationFee: string;
  minAge?: string;
  maxAge?: string;
  ageAsOnDate: string;
  requiredCityDistrict?: string;
  requiredStateId?: string;
  requiredEducation: string;
  isDomicileRequired: boolean;
  isNCLRequired: boolean;
  noticePdfUrl: string;
  noticePdfFileName: string;
  status: string;
  isPublished: boolean;
};

const emptyBankForm = {
  bankName: '',
  bankNameMarathi: '',
  bankCode: '',
  address: '',
  contactEmail: '',
  contactPhone: '',
  logoUrl: '',
};

const emptyRecruitmentForm = {
  bankId: '',
  postName: '',
  postNameMarathi: '',
  totalSeats: '',
  applicationStartDate: '',
  applicationEndDate: '',
  applicationFee: '',
  minAge: '',
  maxAge: '',
  ageAsOnDate: '',
  requiredCityDistrict: '',
  requiredStateId: '',
  requiredEducation: '',
  isDomicileRequired: false,
  isNCLRequired: false,
  noticePdfUrl: '',
  noticePdfFileName: '',
};

type BankForm = typeof emptyBankForm;
type BankFormField = keyof BankForm;
type BankFormErrors = Partial<Record<BankFormField, string>>;
type RecruitmentForm = typeof emptyRecruitmentForm;
type RecruitmentFormField = keyof RecruitmentForm;
type RecruitmentFormErrors = Partial<Record<RecruitmentFormField, string>>;

function readStoredList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T[]) : [];
  } catch {
    return [];
  }
}

function writeStoredList<T>(key: string, items: T[]) {
  window.localStorage.setItem(key, JSON.stringify(items));
}

function formatDate(value: string) {
  if (!value) return '';
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-');

  if (year && month && day) {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(Number(year), Number(month) - 1, Number(day)));
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getDateInputValue(value: string) {
  if (!value) return '';
  return value.split('T')[0] ?? '';
}

function createRecruitmentCode(bank: AdminBank, id: number) {
  const prefix = (bank.bankCode || bank.bankName.slice(0, 2) || 'BK').replace(/[^a-z0-9]/gi, '').toUpperCase();
  return `${prefix}-${String(id).slice(-4)}`;
}

function getVacancyItems(data: ApiPagedResult<Vacancy> | Vacancy[]) {
  return Array.isArray(data) ? data : data.items;
}

function formatApiRecruitment(item: Vacancy): AdminRecruitment {
  const id = item.vacancyId ?? item.id ?? Date.now();

  return {
    id,
    bankId: item.bankId,
    bankName: item.bankName || `Bank #${item.bankId}`,
    bankCode: item.bankCode,
    code: createRecruitmentCode(
      {
        bankId: item.bankId,
        bankName: item.bankName || `Bank ${item.bankId}`,
        bankCode: item.bankCode,
        address: '',
        contactEmail: '',
        contactPhone: '',
        logoUrl: '',
      },
      id,
    ),
    postName: item.postName,
    postNameMarathi: item.postNameMarathi ?? '',
    totalSeats: String(item.totalSeats ?? ''),
    applicationStartDate: item.applicationStartDate,
    applicationEndDate: item.applicationEndDate,
    applicationFee: String(item.applicationFee ?? ''),
    minAge: item.minAge ? String(item.minAge) : '',
    maxAge: item.maxAge ? String(item.maxAge) : '',
    ageAsOnDate: item.ageAsOnDate,
    requiredCityDistrict: item.requiredCityDistrict ?? '',
    requiredStateId: item.requiredStateId ? String(item.requiredStateId) : '',
    requiredEducation: item.requiredEducation,
    isDomicileRequired: item.isDomicileRequired,
    isNCLRequired: item.isNCLRequired,
    noticePdfUrl: item.noticePdfUrl ?? '',
    noticePdfFileName: item.noticePdfFileName ?? '',
    status: item.status || 'Open',
    isPublished: Boolean(item.isPublished) || item.status?.toLowerCase() === 'published',
  };
}

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<'overview' | 'banks' | 'recruitments'>('overview');
  const [banks, setBanks] = useState<AdminBank[]>([]);
  const [recruitments, setRecruitments] = useState<AdminRecruitment[]>([]);
  const [bankForm, setBankForm] = useState(emptyBankForm);
  const [recruitmentForm, setRecruitmentForm] = useState(emptyRecruitmentForm);
  const [bankErrors, setBankErrors] = useState<BankFormErrors>({});
  const [recruitmentErrors, setRecruitmentErrors] = useState<RecruitmentFormErrors>({});
  const [bankMessage, setBankMessage] = useState('');
  const [recruitmentMessage, setRecruitmentMessage] = useState('');
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [isSavingRecruitment, setIsSavingRecruitment] = useState(false);
  const [editingRecruitmentId, setEditingRecruitmentId] = useState<number | null>(null);
  const [publishingRecruitmentId, setPublishingRecruitmentId] = useState<number | null>(null);

  const editingRecruitment = useMemo(
    () => recruitments.find((item) => item.id === editingRecruitmentId) ?? null,
    [editingRecruitmentId, recruitments],
  );

  const { user, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role?.toLowerCase().includes('admin');

  // Redirect non-admin users to login page after auth state is determined
  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.replace(ROUTES.login);
    }
  }, [isLoading, user, isAdmin, router]);

  useEffect(() => {
    if (isLoading || !user || !isAdmin) {
      return;
    }

    setBanks(readStoredList<AdminBank>(STORAGE_KEYS.adminBanks));
    void loadRecruitments();
  }, [isLoading, user, isAdmin]);

  if (isLoading || !user || !isAdmin) {
    return null;
  }

  async function loadRecruitments() {
    try {
      const response = await getVacancies();
      setRecruitments(getVacancyItems(response.data).map(formatApiRecruitment));
    } catch (caughtError) {
      const errorMessage = getErrorMessage(caughtError, ADMIN_DASHBOARD_MESSAGES.recruitment.loadFailed);
      setRecruitmentMessage(errorMessage);
    }
  }

  async function handleBankSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBankMessage('');

    const bankPayload = createBankSchema.safeParse({
      bankName: bankForm.bankName,
      bankNameMarathi: bankForm.bankNameMarathi,
      bankCode: bankForm.bankCode,
      address: bankForm.address,
      contactEmail: bankForm.contactEmail,
      contactPhone: bankForm.contactPhone,
      logoUrl: bankForm.logoUrl,
    });

    if (!bankPayload.success) {
      setBankErrors(getZodFieldErrors<BankFormField>(bankPayload.error));
      setBankMessage(ADMIN_DASHBOARD_MESSAGES.bank.validationError);
      toast.error(ADMIN_DASHBOARD_MESSAGES.bank.validationError);
      return;
    }

    setBankErrors({});
    setIsSavingBank(true);

    const localBank: AdminBank = {
      bankId: Date.now(),
      ...bankPayload.data,
    };

    try {
      const response = await createBank(bankPayload.data);

      localBank.bankId = response.data.bankId;
      setBankMessage(ADMIN_DASHBOARD_MESSAGES.bank.saveSuccess);
      toast.success(ADMIN_DASHBOARD_MESSAGES.bank.saveSuccess);
    } catch {
      setBankMessage(ADMIN_DASHBOARD_MESSAGES.bank.localSaveFallback);
      toast.error(ADMIN_DASHBOARD_MESSAGES.bank.saveFailed);
    } finally {
      const nextBanks = [localBank, ...banks];
      setBanks(nextBanks);
      writeStoredList(STORAGE_KEYS.adminBanks, nextBanks);
      setBankForm(emptyBankForm);
      setBankErrors({});
      setIsSavingBank(false);
    }
  }

  async function handleRecruitmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecruitmentMessage('');

    if (!recruitmentForm.bankId) {
      setRecruitmentErrors({ bankId: ADMIN_DASHBOARD_MESSAGES.recruitment.bankRequired });
      setRecruitmentMessage(ADMIN_DASHBOARD_MESSAGES.recruitment.bankRequired);
      toast.error(ADMIN_DASHBOARD_MESSAGES.recruitment.bankRequired);
      return;
    }

    const vacancyPayload = {
      bankId: recruitmentForm.bankId,
      postName: recruitmentForm.postName,
      postNameMarathi: recruitmentForm.postNameMarathi,
      totalSeats: recruitmentForm.totalSeats,
      applicationStartDate: recruitmentForm.applicationStartDate,
      applicationEndDate: recruitmentForm.applicationEndDate,
      applicationFee: recruitmentForm.applicationFee,
      minAge: recruitmentForm.minAge,
      maxAge: recruitmentForm.maxAge,
      ageAsOnDate: recruitmentForm.ageAsOnDate,
      requiredCityDistrict: recruitmentForm.requiredCityDistrict || undefined,
      requiredStateId: recruitmentForm.requiredStateId,
      requiredEducation: recruitmentForm.requiredEducation,
      isDomicileRequired: recruitmentForm.isDomicileRequired,
      isNCLRequired: recruitmentForm.isNCLRequired,
      noticePdfUrl: recruitmentForm.noticePdfUrl,
      noticePdfFileName: recruitmentForm.noticePdfFileName,
    };
    const parsedVacancyPayload = createVacancySchema.safeParse(vacancyPayload);

    if (!parsedVacancyPayload.success) {
      setRecruitmentErrors(getZodFieldErrors<RecruitmentFormField>(parsedVacancyPayload.error));
      setRecruitmentMessage(ADMIN_DASHBOARD_MESSAGES.recruitment.validationError);
      toast.error(ADMIN_DASHBOARD_MESSAGES.recruitment.validationError);
      return;
    }

    setRecruitmentErrors({});
    setIsSavingRecruitment(true);

    try {
      if (editingRecruitmentId) {
        await updateVacancy({
          vacancyId: editingRecruitmentId,
          ...parsedVacancyPayload.data,
        });
      } else {
        await createVacancy(parsedVacancyPayload.data);
      }

      await loadRecruitments();
      setRecruitmentMessage(
        editingRecruitmentId
          ? ADMIN_DASHBOARD_MESSAGES.recruitment.updateSuccess
          : ADMIN_DASHBOARD_MESSAGES.recruitment.saveSuccess,
      );
      toast.success(
        editingRecruitmentId
          ? ADMIN_DASHBOARD_MESSAGES.recruitment.updateSuccess
          : ADMIN_DASHBOARD_MESSAGES.recruitment.saveSuccess,
      );
      setRecruitmentForm(emptyRecruitmentForm);
      setRecruitmentErrors({});
      setEditingRecruitmentId(null);
    } catch (caughtError) {
      const errorMessage = getErrorMessage(
        caughtError,
        editingRecruitmentId
          ? ADMIN_DASHBOARD_MESSAGES.recruitment.updateFailed
          : ADMIN_DASHBOARD_MESSAGES.recruitment.saveFailed,
      );
      setRecruitmentMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSavingRecruitment(false);
    }
  }

  function handleEditRecruitment(item: AdminRecruitment) {
    setActiveSection('recruitments');
    setEditingRecruitmentId(item.id);
    setRecruitmentMessage('');
    setRecruitmentErrors({});
    setRecruitmentForm({
      bankId: String(item.bankId),
      postName: item.postName,
      postNameMarathi: item.postNameMarathi,
      totalSeats: item.totalSeats,
      applicationStartDate: getDateInputValue(item.applicationStartDate),
      applicationEndDate: getDateInputValue(item.applicationEndDate),
      applicationFee: item.applicationFee,
      minAge: item.minAge ?? '',
      maxAge: item.maxAge ?? '',
      ageAsOnDate: getDateInputValue(item.ageAsOnDate),
      requiredCityDistrict: item.requiredCityDistrict ?? '',
      requiredStateId: item.requiredStateId ?? '',
      requiredEducation: item.requiredEducation,
      isDomicileRequired: item.isDomicileRequired,
      isNCLRequired: item.isNCLRequired,
      noticePdfUrl: item.noticePdfUrl,
      noticePdfFileName: item.noticePdfFileName,
    });
  }

  function handleCancelRecruitmentEdit() {
    setEditingRecruitmentId(null);
    setRecruitmentForm(emptyRecruitmentForm);
    setRecruitmentErrors({});
    setRecruitmentMessage('');
  }

  async function handlePublishRecruitment(item: AdminRecruitment) {
    setPublishingRecruitmentId(item.id);
    setRecruitmentMessage('');

    try {
      await publishVacancy(item.id);
      await loadRecruitments();
      setRecruitmentMessage(ADMIN_DASHBOARD_MESSAGES.recruitment.publishSuccess);
      toast.success(ADMIN_DASHBOARD_MESSAGES.recruitment.publishSuccess);
    } catch (caughtError) {
      const errorMessage = getErrorMessage(caughtError, ADMIN_DASHBOARD_MESSAGES.recruitment.publishFailed);
      setRecruitmentMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPublishingRecruitmentId(null);
    }
  }

  return (
    <section className="bg-slate-100 px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:self-start">
          <div className="border-b border-slate-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Admin</p>
            <h1 className="mt-2 text-xl font-semibold text-slate-950">Dashboard</h1>
          </div>

          <nav className="mt-4 space-y-2">
            <SidebarButton label="Overview" active={activeSection === 'overview'} onClick={() => setActiveSection('overview')} />
            <SidebarButton label="Bank Master" active={activeSection === 'banks'} onClick={() => setActiveSection('banks')} />
            <SidebarButton label="Recruitment" active={activeSection === 'recruitments'} onClick={() => setActiveSection('recruitments')} />
          </nav>
        </aside>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Recruitment management</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Manage banks and recruitment notices</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Add member banks, publish recruitment entries, and review the latest records from one workspace.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DashboardCard title="Banks added" value={banks.length} detail="Bank master records available for recruitment mapping." />
            <DashboardCard title="Recruitments added" value={recruitments.length} detail="Recruitment records loaded from the API." />
          </div>

          {activeSection === 'overview' ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <RecentlyAddedBanks banks={banks} />
              <RecentlyAddedRecruitments recruitments={recruitments} onEdit={handleEditRecruitment} onPublish={handlePublishRecruitment} publishingRecruitmentId={publishingRecruitmentId} />
            </div>
          ) : null}

          {activeSection === 'banks' ? (
            <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
              <form onSubmit={handleBankSubmit} noValidate className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Bank Master</h2>
                <div className="mt-5 space-y-4">
                  <AdminInput label="Bank name" value={bankForm.bankName} onChange={(value) => setBankForm((prev) => ({ ...prev, bankName: value }))} error={bankErrors.bankName} required />
                  <AdminInput label="Bank name in Marathi" value={bankForm.bankNameMarathi} onChange={(value) => setBankForm((prev) => ({ ...prev, bankNameMarathi: value }))} error={bankErrors.bankNameMarathi} />
                  <AdminInput label="Bank code" value={bankForm.bankCode} onChange={(value) => setBankForm((prev) => ({ ...prev, bankCode: value }))} error={bankErrors.bankCode} />
                  <AdminInput label="Address" value={bankForm.address} onChange={(value) => setBankForm((prev) => ({ ...prev, address: value }))} error={bankErrors.address} required />
                  <AdminInput label="Contact email" type="email" value={bankForm.contactEmail} onChange={(value) => setBankForm((prev) => ({ ...prev, contactEmail: value }))} error={bankErrors.contactEmail} required />
                  <AdminInput label="Contact phone" value={bankForm.contactPhone} onChange={(value) => setBankForm((prev) => ({ ...prev, contactPhone: value.replace(/\D/g, '').slice(0, 10) }))} error={bankErrors.contactPhone} required />
                  <AdminInput label="Logo URL" value={bankForm.logoUrl} onChange={(value) => setBankForm((prev) => ({ ...prev, logoUrl: value }))} error={bankErrors.logoUrl} />
                </div>
                {bankMessage ? <p className="mt-4 text-sm font-medium text-slate-600">{bankMessage}</p> : null}
                <button type="submit" disabled={isSavingBank} className="mt-6 w-full rounded-md bg-slate-700 px-4 py-3 text-sm font-semibold text-white hover:cursor-pointer hover:bg-slate-600 disabled:opacity-60">
                  {isSavingBank ? 'Saving bank...' : 'Save bank'}
                </button>
              </form>

              <RecentlyAddedBanks banks={banks} />
            </div>
          ) : null}

          {activeSection === 'recruitments' ? (
            <div className="space-y-6">
              <form onSubmit={handleRecruitmentSubmit} noValidate className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{editingRecruitmentId ? 'Edit Recruitment' : 'Add Recruitment'}</h2>
                    {editingRecruitment ? <p className="mt-1 text-sm text-slate-500">Editing {editingRecruitment.code}</p> : null}
                  </div>
                  {editingRecruitmentId ? (
                    <button type="button" onClick={handleCancelRecruitmentEdit} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                      Cancel edit
                    </button>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">Bank</span>
                    <select value={recruitmentForm.bankId} onChange={(event) => setRecruitmentForm((prev) => ({ ...prev, bankId: event.target.value }))} required aria-invalid={Boolean(recruitmentErrors.bankId)} className={`${adminInputClassName} ${recruitmentErrors.bankId ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}>
                      <option value="">Select bank</option>
                      {editingRecruitment && !banks.some((bank) => bank.bankId === editingRecruitment.bankId) ? (
                        <option value={editingRecruitment.bankId}>{editingRecruitment.bankName}</option>
                      ) : null}
                      {banks.map((bank) => (
                        <option key={bank.bankId} value={bank.bankId}>{bank.bankName}</option>
                      ))}
                    </select>
                    {recruitmentErrors.bankId ? <p className="mt-2 text-sm text-rose-600">{recruitmentErrors.bankId}</p> : null}
                  </label>
                  <AdminInput label="Post name" value={recruitmentForm.postName} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, postName: value }))} error={recruitmentErrors.postName} required />
                  <AdminInput label="Post name Marathi" value={recruitmentForm.postNameMarathi} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, postNameMarathi: value }))} error={recruitmentErrors.postNameMarathi} />
                  <AdminInput label="Total seats" type="number" value={recruitmentForm.totalSeats} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, totalSeats: value }))} error={recruitmentErrors.totalSeats} required />
                  <AdminInput label="Application start date" type="date" value={recruitmentForm.applicationStartDate} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, applicationStartDate: value }))} error={recruitmentErrors.applicationStartDate} required />
                  <AdminInput label="Application end date" type="date" value={recruitmentForm.applicationEndDate} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, applicationEndDate: value }))} error={recruitmentErrors.applicationEndDate} required />
                  <AdminInput label="Application fee" type="number" value={recruitmentForm.applicationFee} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, applicationFee: value }))} error={recruitmentErrors.applicationFee} required />
                  <AdminInput label="Min age" type="number" value={recruitmentForm.minAge} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, minAge: value }))} error={recruitmentErrors.minAge} />
                  <AdminInput label="Max age" type="number" value={recruitmentForm.maxAge} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, maxAge: value }))} error={recruitmentErrors.maxAge} />
                  <AdminInput label="Age as on date" type="date" value={recruitmentForm.ageAsOnDate} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, ageAsOnDate: value }))} error={recruitmentErrors.ageAsOnDate} required />
                  <AdminInput label="Applicable city/district" value={recruitmentForm.requiredCityDistrict} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, requiredCityDistrict: value }))} error={recruitmentErrors.requiredCityDistrict} />
                  <AdminInput label="Applicable state" value={recruitmentForm.requiredStateId} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, requiredStateId: value }))} error={recruitmentErrors.requiredStateId} />
                  <AdminInput label="Required education" value={recruitmentForm.requiredEducation} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, requiredEducation: value }))} error={recruitmentErrors.requiredEducation} required />
                  <AdminInput label="Notice PDF URL" value={recruitmentForm.noticePdfUrl} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, noticePdfUrl: value }))} error={recruitmentErrors.noticePdfUrl} />
                  <AdminInput label="Notice PDF file name" value={recruitmentForm.noticePdfFileName} onChange={(value) => setRecruitmentForm((prev) => ({ ...prev, noticePdfFileName: value }))} error={recruitmentErrors.noticePdfFileName} />
                </div>

                <div className="mt-5 flex flex-wrap gap-4">
                  <Toggle label="Domicile required" checked={recruitmentForm.isDomicileRequired} onChange={(checked) => setRecruitmentForm((prev) => ({ ...prev, isDomicileRequired: checked }))} />
                  <Toggle label="NCL required" checked={recruitmentForm.isNCLRequired} onChange={(checked) => setRecruitmentForm((prev) => ({ ...prev, isNCLRequired: checked }))} />
                </div>

                {recruitmentMessage ? <p className="mt-4 text-sm font-medium text-slate-600">{recruitmentMessage}</p> : null}
                <button type="submit" disabled={isSavingRecruitment} className="mt-6 rounded-md bg-[#fcd62e] px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-400 disabled:opacity-60">
                  {isSavingRecruitment ? 'Saving recruitment...' : editingRecruitmentId ? 'Update recruitment' : 'Add recruitment'}
                </button>
              </form>

              <RecentlyAddedRecruitments recruitments={recruitments} onEdit={handleEditRecruitment} onPublish={handlePublishRecruitment} publishingRecruitmentId={publishingRecruitmentId} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const adminInputClassName =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-amber-100';

function SidebarButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold transition ${
        active ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      }`}
    >
      {label}
    </button>
  );
}

function DashboardCard({ title, value, detail }: { title: string; value: number; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className="rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Live</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

function RecentlyAddedBanks({ banks }: { banks: AdminBank[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Recently added banks</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{banks.length} total</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-3 text-left">Bank</th>
              <th className="px-3 py-3 text-left">Code</th>
              <th className="px-3 py-3 text-left">Contact</th>
              <th className="px-3 py-3 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {banks.map((bank) => (
              <tr key={bank.bankId} className="border-t">
                <td className="px-3 py-3 font-semibold text-slate-900">
                  <div className="flex items-center gap-3">
                    {bank.logoUrl ? <img src={bank.logoUrl} alt="" className="h-9 w-9 rounded-md border border-slate-200 object-contain" /> : <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600">{bank.bankName.slice(0, 2).toUpperCase()}</span>}
                    <span>{bank.bankName}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600">{bank.bankCode || 'NA'}</td>
                <td className="px-3 py-3 text-slate-600">{bank.contactEmail}</td>
                <td className="px-3 py-3 text-slate-600">{bank.contactPhone}</td>
              </tr>
            ))}
            {banks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">No bank added yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecentlyAddedRecruitments({
  recruitments,
  onEdit,
  onPublish,
  publishingRecruitmentId,
}: {
  recruitments: AdminRecruitment[];
  onEdit: (item: AdminRecruitment) => void;
  onPublish: (item: AdminRecruitment) => void;
  publishingRecruitmentId: number | null;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-900">Recently added recruitments</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{recruitments.length} total</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-3 text-left">Code</th>
              <th className="px-3 py-3 text-left">Bank</th>
              <th className="px-3 py-3 text-left">Post</th>
              <th className="px-3 py-3 text-left">Start Date</th>
              <th className="px-3 py-3 text-left">End Date</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recruitments.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-3 font-semibold">{item.code}</td>
                <td className="px-3 py-3">{item.bankName}</td>
                <td className="px-3 py-3">{item.postName}</td>
                <td className="px-3 py-3 whitespace-nowrap">{formatDate(item.applicationStartDate) || 'To be announced'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{formatDate(item.applicationEndDate) || 'To be announced'}</td>
                <td className="px-3 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {item.isPublished ? 'Published' : item.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => onEdit(item)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onPublish(item)}
                      disabled={item.isPublished || publishingRecruitmentId === item.id}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {publishingRecruitmentId === item.id ? 'Publishing...' : item.isPublished ? 'Published' : 'Publish'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {recruitments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">No recruitment added yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        aria-invalid={Boolean(error)}
        className={`${adminInputClassName} ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
      />
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 px-4 py-3">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
      <span className="text-sm font-semibold text-slate-800">{label}</span>
    </label>
  );
}
