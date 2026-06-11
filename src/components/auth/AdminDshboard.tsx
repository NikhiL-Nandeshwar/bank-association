/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes.constants';
import { useEffect, useState } from 'react';
import { AdminBank, AdminRecruitment, AdminNews } from '@/types/adminDashboard';
import { formatDate } from '@/utils/adminDashboardHelper';
import { fetchBanksService, fetchRecruitmentsService, fetchNewsService } from '@/actions/api/admin.actions';
import { useBankForm } from '@/hooks/useBankForm';
import { useRecruitmentForm } from '@/hooks/useRecruitmentForm';
import { useNewsForm } from '@/hooks/useNewsForm';
import { useRecruitmentActions } from '@/hooks/useRecruitmentActions';
import { toast } from 'sonner';
import { documentTypeOptions } from '@/constants/vacancy.constants';
import { MasterOption } from '@/types/applicationSteps';
import { getStates } from '@/actions/api';
import { toMasterOptions } from '../recruitment/helper/applicationStepsHelper';

const ELIGIBILITY_CRITERIA_TYPES = ['EDUCATION', 'COURSE'] as const;
const ELIGIBILITY_CRITERIA_VALUES = {
    EDUCATION: [
        'SSC_10TH',
        'HSC_12TH',
        'GRADUATION',
    ] as const,
    COURSE: [
        'MSCIT',
        'CCC',
    ] as const,
};

const ELIGIBILITY_CRITERIA_DEFAULT_DECLARATIONS: Record<string, { declarationEng: string; declarationMrt: string }> = {
    SSC_10TH: {
        declarationEng: 'I have passed Secondary School Certificate (10th) examination.',
        declarationMrt: 'मी माध्यमिक शालान्त प्रमाणपत्र (१०वी) परीक्षा उत्तीर्ण केली आहे.',
    },
    HSC_12TH: {
        declarationEng: 'I have passed Higher Secondary Certificate (12th) examination.',
        declarationMrt: 'मी उच्च माध्यमिक शालान्त प्रमाणपत्र (१२वी) परीक्षा उत्तीर्ण केली आहे.',
    },
    GRADUATION: {
        declarationEng: 'I have completed Graduation from a recognized university.',
        declarationMrt: 'मी मान्यताप्राप्त विद्यापीठातून पदवी पूर्ण केली आहे.',
    },
    MSCIT: {
        declarationEng: 'I have completed MS-CIT or equivalent computer course.',
        declarationMrt: 'मी एमएस-सीआयटी किंवा समकक्ष संगणक अभ्यासक्रम पूर्ण केला आहे.',
    },
    CCC: {
        declarationEng: 'I have completed CCC (Course on Computer Concepts).',
        declarationMrt: 'मी सीसीसी (कोर्स ऑन कंप्यूटर कॉन्सेप्ट्स) पूर्ण केला आहे.',
    },
};

/**
 * Admin dashboard page component for managing banks and recruitment notices.
 * Only accessible to users with admin privileges. Provides forms for 
 * adding/editing banks and recruitments,
 * @returns 
 */
export default function AdminDashboardPage() {
    const [activeSection, setActiveSection] = useState<'overview' | 'banks' | 'recruitments' | 'news'>('overview');
    const [banks, setBanks] = useState<AdminBank[]>([]);
    const bank = useBankForm(banks, setBanks);
    const [recruitments, setRecruitments] = useState<AdminRecruitment[]>([]);
    const [news, setNews] = useState<AdminNews[]>([]);
    const [stateOptions, setStateOptions] = useState<MasterOption[]>([]);
    const { user, status, sessionExpired } = useAuth();
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

    async function loadBanks() {
        try {
            const data = await fetchBanksService();
            setBanks(data);
        } catch {
            toast.error('Failed to load banks');
        }
    }

    async function loadNews() {
        try {
            const data = await fetchNewsService();
            setNews(data);
        } catch {
            toast.error('Failed to load news');
        }
    }

    const recruitment = useRecruitmentForm(loadRecruitments);
    const actions = useRecruitmentActions(loadRecruitments);
    const newsForm = useNewsForm(news, setNews);

    useEffect(() => {
        async function loadStates() {
            try {
                const response = await getStates({ countryId: 1 }); // India
                setStateOptions(toMasterOptions(response?.data));
            } catch {
                setStateOptions([]);
            }
        }

        loadStates();
    }, []);

    useEffect(() => {
        if (status !== 'authenticated' || !isAdmin) return;

        loadBanks();
        loadRecruitments();
        loadNews();
    }, [status, isAdmin, router]);

    // Redirect non-admin users to login page after auth state is determined
    useEffect(() => {
        if (status === 'loading') return;

        if (
            status === 'unauthenticated' &&
            !sessionExpired
        ) {
            router.replace(ROUTES.login);
            return;
        }

        if (
            status === 'authenticated' &&
            !isAdmin
        ) {
            router.replace(ROUTES.login);
        }
    }, [status, isAdmin, router, sessionExpired]);

    // Load initial data on mount
    if (status === 'loading') return null;

    if (
        !sessionExpired &&
        (!user || !isAdmin)
    ) {
        return null;
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
                        <SidebarButton label="News" active={activeSection === 'news'} onClick={() => setActiveSection('news')} />
                    </nav>
                </aside>

                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Recruitment management</p>
                        <h2 className="mt-2 text-3xl font-semibold text-slate-950">Manage banks, recruitment notices, and news</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                            Add member banks, publish recruitment entries, create news, and review the latest records from one workspace.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <DashboardCard title="Banks added" value={banks.length} detail="Bank master records available for recruitment mapping." />
                        <DashboardCard title="Recruitments added" value={recruitments.length} detail="Recruitment records loaded from the API." />
                        <DashboardCard title="News added" value={news.length} detail="News items displayed on the latest news ticker." />
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

                                    <div className="flex gap-2">
                                        <div className="flex-1">
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
                                        </div>

                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={recruitment.autoTranslate}
                                                disabled={
                                                    recruitment.isTranslating ||
                                                    !recruitment.form.postName.trim()
                                                }
                                                className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                            >
                                                {recruitment.isTranslating
                                                    ? 'Translating...'
                                                    : 'Auto Translate'}
                                            </button>
                                        </div>
                                    </div>
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
                                        label="Required city / district"
                                        value={String(recruitment.form.requiredCityDistrict)}
                                        onChange={(v) =>
                                            recruitment.setForm((p) => ({
                                                ...p,
                                                requiredCityDistrict: Number(v) || 0,
                                            }))
                                        }
                                    />

                                    <label className="block">
                                        <span className="text-sm font-semibold text-slate-800">
                                            Required State
                                        </span>

                                        <select
                                            value={recruitment.form.requiredStateId || ''}
                                            onChange={(e) =>
                                                recruitment.setForm((p) => ({
                                                    ...p,
                                                    requiredStateId: Number(e.target.value) || 0,
                                                }))
                                            }
                                            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                                        >
                                            <option value="">Select State</option>

                                            {stateOptions.map((state) => (
                                                <option key={state.value} value={state.value}>
                                                    {state.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

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

                                    <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <div className="mb-4 flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">Eligibility criteria</p>
                                                <p className="mt-1 text-sm text-slate-500">Add one or more eligibility conditions for this vacancy.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    recruitment.setForm((p) => ({
                                                        ...p,
                                                        eligibilityCriteria: [
                                                            ...p.eligibilityCriteria,
                                                            {
                                                                criteriaType: '',
                                                                criteriaValue: '',
                                                                groupTag: '',
                                                                isMandatory: false,
                                                                declarationEng: '',
                                                                declarationMrt: '',
                                                                sortOrder: 0,
                                                                requiredDocumentType: '',
                                                                requiredDocument: false,
                                                            }
                                                        ],
                                                    }))
                                                }
                                                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                            >
                                                Add criterion
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {recruitment.form.eligibilityCriteria.length === 0 ? (
                                                <p className="text-sm text-slate-500">No eligibility criteria added yet.</p>
                                            ) : null}

                                            {recruitment.form.eligibilityCriteria.map((criteria, criteriaIndex) => (
                                                <div key={criteriaIndex} className="rounded-xl border border-slate-200 bg-white p-4">
                                                    <div className="grid gap-4 md:grid-cols-2">
                                                        <label className="block">
                                                            <span className="text-sm font-semibold text-slate-800">Criteria type</span>
                                                            <select
                                                                value={criteria.criteriaType}
                                                                onChange={(event) =>
                                                                    recruitment.setForm((p) => {
                                                                        const type = event.target.value;
                                                                        const updated = [...p.eligibilityCriteria];
                                                                        updated[criteriaIndex] = {
                                                                            ...updated[criteriaIndex],
                                                                            criteriaType: type,
                                                                            criteriaValue: '',
                                                                            declarationEng: '',
                                                                            declarationMrt: '',
                                                                        };
                                                                        return { ...p, eligibilityCriteria: updated };
                                                                    })
                                                                }
                                                                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                                                            >
                                                                <option value="">Select criteria type</option>
                                                                {ELIGIBILITY_CRITERIA_TYPES.map((type) => (
                                                                    <option key={type} value={type}>
                                                                        {type}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </label>

                                                        <label className="block">
                                                            <span className="text-sm font-semibold text-slate-800">Criteria value</span>
                                                            <select
                                                                value={criteria.criteriaValue}
                                                                onChange={(event) => {
                                                                    const newValue = event.target.value;
                                                                    const defaultDeclaration = ELIGIBILITY_CRITERIA_DEFAULT_DECLARATIONS[newValue] ?? {
                                                                        declarationEng: '',
                                                                        declarationMrt: '',
                                                                    };
                                                                    recruitment.setForm((p) => {
                                                                        const updated = [...p.eligibilityCriteria];
                                                                        updated[criteriaIndex] = {
                                                                            ...updated[criteriaIndex],
                                                                            criteriaValue: newValue,
                                                                            declarationEng: defaultDeclaration.declarationEng,
                                                                            declarationMrt: defaultDeclaration.declarationMrt,
                                                                        };
                                                                        return { ...p, eligibilityCriteria: updated };
                                                                    });
                                                                }}
                                                                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                                                            >
                                                                <option value="">Select criteria value</option>
                                                                {(criteria.criteriaType
                                                                    ? ELIGIBILITY_CRITERIA_VALUES[criteria.criteriaType as keyof typeof ELIGIBILITY_CRITERIA_VALUES]
                                                                    : [...ELIGIBILITY_CRITERIA_VALUES.EDUCATION, ...ELIGIBILITY_CRITERIA_VALUES.COURSE]
                                                                ).map((value) => (
                                                                    <option key={value} value={value}>
                                                                        {value}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </label>

                                                        <AdminInput
                                                            label="Group tag"
                                                            value={criteria.groupTag}
                                                            onChange={(value) =>
                                                                recruitment.setForm((p) => {
                                                                    const updated = [...p.eligibilityCriteria];
                                                                    updated[criteriaIndex] = {
                                                                        ...updated[criteriaIndex],
                                                                        groupTag: value,
                                                                    };
                                                                    return { ...p, eligibilityCriteria: updated };
                                                                })
                                                            }
                                                        />

                                                        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={criteria.isMandatory}
                                                                onChange={(event) =>
                                                                    recruitment.setForm((p) => {
                                                                        const updated = [...p.eligibilityCriteria];
                                                                        updated[criteriaIndex] = {
                                                                            ...updated[criteriaIndex],
                                                                            isMandatory: event.target.checked,
                                                                        };
                                                                        return { ...p, eligibilityCriteria: updated };
                                                                    })
                                                                }
                                                                className="h-4 w-4"
                                                            />
                                                            <span className="text-sm text-slate-800">Mandatory</span>
                                                        </div>

                                                        <AdminInput
                                                            label="Declaration (English)"
                                                            value={criteria.declarationEng}
                                                            onChange={(value) =>
                                                                recruitment.setForm((p) => {
                                                                    const updated = [...p.eligibilityCriteria];
                                                                    updated[criteriaIndex] = {
                                                                        ...updated[criteriaIndex],
                                                                        declarationEng: value,
                                                                    };
                                                                    return { ...p, eligibilityCriteria: updated };
                                                                })
                                                            }
                                                        />

                                                        <AdminInput
                                                            label="Declaration (Marathi)"
                                                            value={criteria.declarationMrt}
                                                            onChange={(value) =>
                                                                recruitment.setForm((p) => {
                                                                    const updated = [...p.eligibilityCriteria];
                                                                    updated[criteriaIndex] = {
                                                                        ...updated[criteriaIndex],
                                                                        declarationMrt: value,
                                                                    };
                                                                    return { ...p, eligibilityCriteria: updated };
                                                                })
                                                            }
                                                        />

                                                        <AdminInput
                                                            label="Sort order"
                                                            value={String(criteria.sortOrder)}
                                                            onChange={(value) =>
                                                                recruitment.setForm((p) => {
                                                                    const updated = [...p.eligibilityCriteria];
                                                                    updated[criteriaIndex] = {
                                                                        ...updated[criteriaIndex],
                                                                        sortOrder: parseInt(value, 10) || 0,
                                                                    };
                                                                    return { ...p, eligibilityCriteria: updated };
                                                                })
                                                            }
                                                        />

                                                        <div></div>

                                                        <label className="block">
                                                            <span className="text-sm font-semibold text-slate-800">
                                                                Required Document Type
                                                            </span>

                                                            <select
                                                                value={criteria.requiredDocumentType || ''}
                                                                onChange={(e) =>
                                                                    recruitment.setForm((p) => {
                                                                        const updated = [...p.eligibilityCriteria];

                                                                        updated[criteriaIndex] = {
                                                                            ...updated[criteriaIndex],
                                                                            requiredDocumentType: e.target.value,
                                                                        };

                                                                        return {
                                                                            ...p,
                                                                            eligibilityCriteria: updated,
                                                                        };
                                                                    })
                                                                }
                                                                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                                                            >
                                                                <option value="">Select document type</option>

                                                                {documentTypeOptions.map((option) => (
                                                                    <option key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </label>

                                                        <div className="flex items-end">
                                                            <label className="flex items-center gap-2 text-sm text-slate-800 pb-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={recruitment.form.eligibilityCriteria[0]?.requiredDocument}
                                                                    onChange={(e) =>
                                                                        recruitment.setForm((p) => {
                                                                            const updated = [...p.eligibilityCriteria];
                                                                            updated[0] = {
                                                                                ...updated[0],
                                                                                requiredDocument: e.target.checked,
                                                                            };
                                                                            return { ...p, eligibilityCriteria: updated };
                                                                        })
                                                                    }
                                                                    className="h-4 w-4"
                                                                />
                                                                Required Document
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                recruitment.setForm((p) => {
                                                                    const updated = [...p.eligibilityCriteria];
                                                                    updated.splice(criteriaIndex, 1);
                                                                    return { ...p, eligibilityCriteria: updated };
                                                                })
                                                            }
                                                            className="rounded-md border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>


                                    </div>

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

                    {activeSection === 'news' ? (
                        <div className="space-y-6">
                            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-slate-900">
                                        {newsForm.editingId ? 'Edit News' : 'Add News'}
                                    </h2>
                                    {newsForm.editingId && (
                                        <button
                                            type="button"
                                            onClick={newsForm.clearForm}
                                            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        newsForm.submit();
                                    }}
                                    className="space-y-4"
                                >
                                    <AdminInput
                                        label="News (English)"
                                        value={newsForm.form.newsEng}
                                        onChange={(v) =>
                                            newsForm.setForm((p) => ({ ...p, newsEng: v }))
                                        }
                                        error={newsForm.errors.newsEng}
                                    />

                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <AdminInput
                                                label="News (Marathi)"
                                                value={newsForm.form.newsMrt}
                                                onChange={(v) =>
                                                    newsForm.setForm((p) => ({ ...p, newsMrt: v }))
                                                }
                                                error={newsForm.errors.newsMrt}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={newsForm.autoTranslate}
                                                disabled={newsForm.isTranslating || !newsForm.form.newsEng.trim()}
                                                className="rounded-md border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                                            >
                                                {newsForm.isTranslating ? 'Translating...' : 'Auto Translate'}
                                            </button>
                                        </div>
                                    </div>

                                    {newsForm.message && (
                                        <p className="text-sm text-emerald-600">{newsForm.message}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={newsForm.isSaving}
                                        className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                    >
                                        {newsForm.isSaving ? 'Saving...' : newsForm.editingId ? 'Update news' : 'Save news'}
                                    </button>
                                </form>
                            </div>

                            <RecentlyAddedNews news={news} onEdit={(item) => {
                                setActiveSection('news');
                                newsForm.startEdit(item);
                            }} />
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

function RecentlyAddedNews({ news, onEdit }: { news: AdminNews[]; onEdit?: (item: AdminNews) => void }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">Recently added news</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{news.length} total</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">News items displayed on the home page latest news ticker section.</p>
            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-3 py-3 text-left">English Text</th>
                            <th className="px-3 py-3 text-left">Marathi Text</th>
                            <th className="px-3 py-3 text-left">Created Date</th>
                            <th className="px-3 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="px-3 py-3 font-semibold max-w-xs truncate">{item.newsEng}</td>
                                <td className="px-3 py-3 max-w-xs truncate">{item.newsMrt}</td>
                                <td className="px-3 py-3 whitespace-nowrap text-slate-500">{formatDate(item.createdAt) || 'N/A'}</td>
                                <td className="px-3 py-3">
                                    {onEdit && (
                                        <button
                                            type="button"
                                            onClick={() => onEdit(item)}
                                            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {news.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">No news added yet.</td>
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
