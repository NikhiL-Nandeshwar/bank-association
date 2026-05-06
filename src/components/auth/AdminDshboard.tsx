/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { STORAGE_KEYS } from '@/constants/storage.constants';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes.constants';
import { useEffect, useState } from 'react';
import { AdminBank, AdminRecruitment } from '@/types/adminDashboard';
import { formatDate } from '@/utils/adminDashboardHelper';
import { fetchRecruitmentsService } from '@/actions/api/admin.actions';
import { useBankForm } from '@/hooks/useBankForm';
import { useRecruitmentForm } from '@/hooks/useRecruitmentForm';
import { useRecruitmentActions } from '@/hooks/useRecruitmentActions';
import { toast } from 'sonner';

/**
 * Admin dashboard page component for managing banks and recruitment notices.
 * Only accessible to users with admin privileges. Provides forms for 
 * adding/editing banks and recruitments,
 * @returns 
 */
export default function AdminDashboardPage() {
    const [activeSection, setActiveSection] = useState<'overview' | 'banks' | 'recruitments'>('overview');
    const [banks, setBanks] = useState<AdminBank[]>([]);
    const bank = useBankForm(banks, setBanks);
    const [recruitments, setRecruitments] = useState<AdminRecruitment[]>([]);

    const { user, status } = useAuth();
    const router = useRouter();
    const isAdmin =
        user?.role?.toLowerCase?.().includes('admin') ?? false;

    async function loadRecruitments() {
        try {
            const data = await fetchRecruitmentsService();
            setRecruitments(data);
        } catch {
            toast.error('Failed to load recruitments');
        }
    }

    const recruitment = useRecruitmentForm(loadRecruitments);
    const actions = useRecruitmentActions(loadRecruitments);

    useEffect(() => {
        if (status !== 'authenticated' || !isAdmin) return;

        loadRecruitments();
    }, [status, isAdmin, router]);

    // Redirect non-admin users to login page after auth state is determined
    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated' || !isAdmin) {
            router.replace(ROUTES.login);
        }
    }, [status, isAdmin, router]);

    // Load initial data on mount
    if (status === 'loading' || !user || !isAdmin) return null;



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
                            <RecentlyAddedRecruitments
                                recruitments={recruitments}
                                onEdit={(item) => {
                                    setActiveSection('recruitments');
                                    recruitment.startEdit(item);
                                }}
                                onUpload={(item) => actions.setUploadId(item.id)}
                                onPublish={(item) => actions.publish(item.id)}
                                publishingRecruitmentId={actions.publishingId}
                            />
                        </div>
                    ) : null}

                    {activeSection === 'banks' ? (
                        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                                    Bank Master
                                </h2>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        bank.submit();
                                    }}
                                    className="space-y-4"
                                >
                                    <AdminInput
                                        label="Bank name"
                                        value={bank.form.bankName}
                                        onChange={(v) =>
                                            bank.setForm((p) => ({ ...p, bankName: v }))
                                        }
                                        error={bank.errors.bankName}
                                    />

                                    <AdminInput
                                        label="Bank name in Marathi"
                                        value={bank.form.bankNameMarathi}
                                        onChange={(v) =>
                                            bank.setForm((p) => ({ ...p, bankNameMarathi: v }))
                                        }
                                    />

                                    <AdminInput
                                        label="Bank code"
                                        value={bank.form.bankCode}
                                        onChange={(v) =>
                                            bank.setForm((p) => ({ ...p, bankCode: v }))
                                        }
                                        error={bank.errors.bankCode}
                                    />

                                    <AdminInput
                                        label="Address"
                                        value={bank.form.address}
                                        onChange={(v) =>
                                            bank.setForm((p) => ({ ...p, address: v }))
                                        }
                                        error={bank.errors.address}
                                    />

                                    <AdminInput
                                        label="Contact email"
                                        value={bank.form.contactEmail}
                                        onChange={(v) =>
                                            bank.setForm((p) => ({ ...p, contactEmail: v }))
                                        }
                                        error={bank.errors.contactEmail}
                                    />

                                    <AdminInput
                                        label="Contact phone"
                                        value={bank.form.contactPhone}
                                        onChange={(v) =>
                                            bank.setForm((p) => ({ ...p, contactPhone: v }))
                                        }
                                        error={bank.errors.contactPhone}
                                    />

                                    <AdminInput
                                        label="Logo URL"
                                        value={bank.form.logoUrl}
                                        onChange={(v) =>
                                            bank.setForm((p) => ({ ...p, logoUrl: v }))
                                        }
                                    />

                                    {bank.message && (
                                        <p className="text-sm text-emerald-600">{bank.message}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={bank.isSaving}
                                        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                    >
                                        {bank.isSaving ? 'Saving...' : 'Save bank'}
                                    </button>
                                </form>
                            </div>

                            <RecentlyAddedBanks banks={banks} />
                        </div>
                    ) : null}

                    {activeSection === 'recruitments' ? (
                        <div className="space-y-6">
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-semibold text-slate-900 mb-6">
                                    Add Recruitment
                                </h2>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        recruitment.submit();
                                    }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    {/* Bank */}
                                    <label className="block">
                                        <span className="text-sm font-semibold text-slate-800">Bank</span>
                                        <select
                                            value={recruitment.form.bankId}
                                            onChange={(e) =>
                                                recruitment.setForm((p) => ({
                                                    ...p,
                                                    bankId: e.target.value,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                                        >
                                            <option value="">Select bank</option>
                                            {banks.map((b) => (
                                                <option key={b.bankId} value={b.bankId}>
                                                    {b.bankName}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <AdminInput
                                        label="Post name"
                                        value={recruitment.form.postName}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({ ...p, postName: v }))
                                        }
                                        error={recruitment.errors.postName}
                                    />

                                    <AdminInput
                                        label="Post name Marathi"
                                        value={recruitment.form.postNameMarathi}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({
                                                ...p,
                                                postNameMarathi: v,
                                            }))
                                        }
                                    />

                                    <AdminInput
                                        label="Total seats"
                                        value={recruitment.form.totalSeats}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({ ...p, totalSeats: v }))
                                        }
                                    />

                                    <AdminInput
                                        label="Application start date"
                                        type="date"
                                        value={recruitment.form.applicationStartDate}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({
                                                ...p,
                                                applicationStartDate: v,
                                            }))
                                        }
                                    />

                                    <AdminInput
                                        label="Application end date"
                                        type="date"
                                        value={recruitment.form.applicationEndDate}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({
                                                ...p,
                                                applicationEndDate: v,
                                            }))
                                        }
                                    />

                                    <AdminInput
                                        label="Application fee"
                                        value={recruitment.form.applicationFee}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({
                                                ...p,
                                                applicationFee: v,
                                            }))
                                        }
                                    />

                                    <AdminInput
                                        label="Min age"
                                        value={recruitment.form.minAge}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({ ...p, minAge: v }))
                                        }
                                    />

                                    <AdminInput
                                        label="Max age"
                                        value={recruitment.form.maxAge}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({ ...p, maxAge: v }))
                                        }
                                    />

                                    <AdminInput
                                        label="Age as on date"
                                        type="date"
                                        value={recruitment.form.ageAsOnDate}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({
                                                ...p,
                                                ageAsOnDate: v,
                                            }))
                                        }
                                    />

                                    <AdminInput
                                        label="Required education"
                                        value={recruitment.form.requiredEducation}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({
                                                ...p,
                                                requiredEducation: v,
                                            }))
                                        }
                                    />

                                    <AdminInput
                                        label="Notice PDF URL"
                                        value={recruitment.form.noticePdfUrl}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({
                                                ...p,
                                                noticePdfUrl: v,
                                            }))
                                        }
                                    />

                                    <AdminInput
                                        label="Notice file name"
                                        value={recruitment.form.noticePdfFileName}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({
                                                ...p,
                                                noticePdfFileName: v,
                                            }))
                                        }
                                    />

                                    {/* Buttons */}
                                    <div className="col-span-full">
                                        {recruitment.message && (
                                            <p className="text-sm text-emerald-600 mb-2">
                                                {recruitment.message}
                                            </p>
                                        )}

                                        <div className="col-span-full flex items-center gap-6 mb-4">
                                            <label className="flex items-center gap-2 text-sm text-slate-800">
                                                <input
                                                    type="checkbox"
                                                    checked={recruitment.form.isDomicileRequired}
                                                    onChange={(e) =>
                                                        recruitment.setForm((p) => ({
                                                            ...p,
                                                            isDomicileRequired: e.target.checked,
                                                        }))
                                                    }
                                                    className="h-4 w-4"
                                                />
                                                Domicile required
                                            </label>

                                            <label className="flex items-center gap-2 text-sm text-slate-800">
                                                <input
                                                    type="checkbox"
                                                    checked={recruitment.form.isNCLRequired}
                                                    onChange={(e) =>
                                                        recruitment.setForm((p) => ({
                                                            ...p,
                                                            isNCLRequired: e.target.checked,
                                                        }))
                                                    }
                                                    className="h-4 w-4"
                                                />
                                                NCL required
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={recruitment.isSaving}
                                            className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-60"
                                        >
                                            {recruitment.isSaving
                                                ? 'Saving...'
                                                : recruitment.editingId
                                                    ? 'Update recruitment'
                                                    : 'Add recruitment'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <RecentlyAddedRecruitments
                                recruitments={recruitments}
                                onEdit={(item) => {
                                    setActiveSection('recruitments');
                                    recruitment.startEdit(item);
                                }}
                                onUpload={(item) => actions.setUploadId(item.id)}
                                onPublish={(item) => actions.publish(item.id)}
                                publishingRecruitmentId={actions.publishingId}
                            />
                        </div>
                    ) : null}
                </div>
            </div>

            {actions.uploadId ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
                    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-950">
                                    Upload vacancy notice PDF
                                </h3>
                                <p className="mt-2 text-sm text-slate-600">
                                    Add the PDF before publishing this recruitment.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => actions.setUploadId(null)}
                                className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                            >
                                Close
                            </button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                actions.upload();
                            }}
                            className="mt-6 space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-semibold text-slate-800">
                                    Notice PDF file
                                </label>

                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(e) =>
                                        actions.setFile(e.target.files?.[0] ?? null)
                                    }
                                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                                />
                            </div>

                            {actions.error && (
                                <p className="text-sm text-rose-600">{actions.error}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={actions.uploading}
                                    className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {actions.uploading ? 'Uploading...' : 'Upload PDF'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => actions.setUploadId(null)}
                                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
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
            className={`w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
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
                        {banks.map((bank, index) => (
                            <tr key={`${bank.bankId}-${bank.contactEmail}-${index}`} className="border-t">
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
    onUpload,
    onPublish,
    publishingRecruitmentId,
}: {
    recruitments: AdminRecruitment[];
    onEdit: (item: AdminRecruitment) => void;
    onUpload: (item: AdminRecruitment) => void;
    onPublish: (item: AdminRecruitment) => void;
    publishingRecruitmentId: number | null;
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">Recently added recruitments</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{recruitments.length} total</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">Upload a vacancy notice PDF before you publish each recruitment listing.</p>
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
                                        <button type="button" onClick={() => onUpload(item)} className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                                            {item.noticePdfUrl ? 'Replace PDF' : 'Upload PDF'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onPublish(item)}
                                            disabled={item.isPublished || publishingRecruitmentId === item.id || !item.noticePdfUrl}
                                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:opacity-60"
                                        >
                                            {publishingRecruitmentId === item.id ? 'Publishing...' : item.isPublished ? 'Published' : 'Publish'}
                                        </button>
                                    </div>
                                    {!item.noticePdfUrl && !item.isPublished ? (
                                        <p className="mt-2 text-xs text-slate-500">Upload the notice PDF before publishing.</p>
                                    ) : null}
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
