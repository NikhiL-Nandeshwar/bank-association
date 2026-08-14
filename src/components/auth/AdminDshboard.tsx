/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes.constants';
import { forwardRef, useEffect, useRef, useState, type ReactNode } from 'react';
import { AdminBank, AdminRecruitment, AdminNews } from '@/types/adminDashboard';
import { formatDate, isRecruitmentActive } from '@/utils/adminDashboardHelper';
import { fetchBanksService, fetchRecruitmentsService, fetchNewsService, createBookService, deleteBankService, deleteCategoryService, deleteAuthorService, deleteBookService, deleteRecruitmentService, deleteNewsService, fetchBooksService } from '@/actions/api/admin.actions';
import { getCategories } from '@/actions/api/category.actions';
import { getAuthors } from '@/actions/api/author.actions';
import { useBankForm } from '@/hooks/useBankForm';
import { useRecruitmentForm } from '@/hooks/useRecruitmentForm';
import { useNewsForm } from '@/hooks/useNewsForm';
import { useCategoryForm } from '@/hooks/useCategoryForm';
import { useAuthorForm } from '@/hooks/useAuthorForm';
import BookForm from '@/components/admin/BookForm';
import DeleteConfirmationDialog from '@/components/ui/DeleteConfirmationDialog';
import { useRecruitmentActions } from '@/hooks/useRecruitmentActions';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/api-error';
import { documentTypeOptions } from '@/constants/vacancy.constants';
import { MasterOption } from '@/types/applicationSteps';
import { getStates } from '@/actions/api';
import { toMasterOptions } from '../recruitment/helper/applicationStepsHelper';
import { BookOpen, BriefcaseBusiness, Building2, ChevronDown, Newspaper, Tags, Users } from 'lucide-react';

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
    const [activeSection, setActiveSection] = useState<'overview' | 'banks' | 'recruitments' | 'news' | 'categories' | 'authors' | 'books'>('overview');
    const [masterView, setMasterView] = useState<'list' | 'form'>('list');
    const [banks, setBanks] = useState<AdminBank[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);
    const [books, setBooks] = useState<any[]>([]);
    const [editingBook, setEditingBook] = useState<any | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        confirmText: string;
        action: (() => Promise<void>) | null;
    }>({
        isOpen: false,
        title: '',
        description: '',
        confirmText: 'Delete',
        action: null,
    });
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

    async function loadBooks() {
        try {
            const data = await fetchBooksService();
            setBooks(data);
        } catch {
            toast.error('Failed to load books');
        }
    }

    async function handleConfirmDelete() {
        if (!deleteDialog.action) return;

        try {
            await deleteDialog.action();
        } finally {
            setDeleteDialog((prev) => ({
                ...prev,
                isOpen: false,
                action: null,
            }));
        }
    }

    function openDeleteDialog(
        title: string,
        description: string,
        action: () => Promise<void>,
        confirmText = 'Delete'
    ) {
        setDeleteDialog({
            isOpen: true,
            title,
            description,
            confirmText,
            action,
        });
    }

    async function handleDeleteBank(bankId: number, bankName: string) {
        openDeleteDialog(
            'Delete bank',
            `Are you sure you want to delete ${bankName}? This action cannot be undone.`,
            async () => {
                await deleteBankService(bankId);
                setBanks((prev) => prev.filter((bank) => bank.bankId !== bankId));
                toast.success('Bank deleted successfully.');
            }
        );
    }

    function handleEditBank(item: AdminBank) {
        setActiveSection('banks');
        setMasterView('form');
        bank.startEdit(item);
    }

    async function handleDeleteCategory(categoryId: number, categoryName: string) {
        openDeleteDialog(
            'Delete category',
            `Are you sure you want to delete ${categoryName}? This action cannot be undone.`,
            async () => {
                await deleteCategoryService(categoryId);
                setCategories((prev) => prev.filter((item) => item.categoryId !== categoryId));
                toast.success('Category deleted successfully.');
            }
        );
    }

    function handleEditCategory(item: any) {
        setActiveSection('categories');
        setMasterView('form');
        categoryForm.startEdit(item);
    }

    async function handleDeleteAuthor(authorId: number, authorName: string) {
        openDeleteDialog(
            'Delete author',
            `Are you sure you want to delete ${authorName}? This action cannot be undone.`,
            async () => {
                await deleteAuthorService(authorId);
                setAuthors((prev) => prev.filter((item) => item.authorId !== authorId));
                toast.success('Author deleted successfully.');
            }
        );
    }

    function handleEditAuthor(item: any) {
        setActiveSection('authors');
        setMasterView('form');
        authorForm.startEdit(item);
    }

    async function handleDeleteBook(bookId: number, bookTitle: string) {
        openDeleteDialog(
            'Delete book',
            `Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`,
            async () => {
                await deleteBookService(bookId);
                setBooks((prev) => prev.filter((item) => item.bookId !== bookId));
                toast.success('Book deleted successfully.');
            }
        );
    }

    function handleEditBook(item: any) {
        setActiveSection('books');
        setMasterView('form');
        setEditingBook(item);
    }

    function handleCancelBookEdit() {
        setEditingBook(null);
    }

    async function handleDeleteRecruitment(item: AdminRecruitment) {
        if (isRecruitmentActive(item)) {
            toast.error('Active recruitment cannot be deleted.');
            return;
        }

        openDeleteDialog(
            'Delete recruitment',
            `Are you sure you want to delete recruitment ${item.code}? This action cannot be undone.`,
            async () => {
                await deleteRecruitmentService(item.id);
                setRecruitments((prev) => prev.filter((record) => record.id !== item.id));
                toast.success('Recruitment deleted successfully.');
            }
        );
    }

    async function handleDeleteNews(newsId: number, previewText: string) {
        openDeleteDialog(
            'Delete news item',
            `Are you sure you want to delete this news item? ${previewText}`,
            async () => {
                await deleteNewsService(newsId);
                setNews((prev) => prev.filter((item) => item.id !== newsId));
                toast.success('News deleted successfully.');
            }
        );
    }

    const recruitment = useRecruitmentForm(loadRecruitments);
    const actions = useRecruitmentActions(loadRecruitments);
    const newsForm = useNewsForm(news, setNews);
    const categoryForm = useCategoryForm(categories, setCategories);
    const authorForm = useAuthorForm(authors, setAuthors);
    const newsFormRef = useRef<HTMLDivElement>(null);
    const newsEngInputRef = useRef<HTMLInputElement>(null);

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
        async function loadCatsAndAuthors() {
            try {
                const resp = await getCategories();
                const items = Array.isArray(resp.data) ? resp.data : resp.data.items || [];
                setCategories(items);
            } catch {
                setCategories([]);
            }

            try {
                const resp = await getAuthors();
                const items = Array.isArray(resp.data) ? resp.data : resp.data.items || [];
                setAuthors(items);
            } catch {
                setAuthors([]);
            }
        }

        loadCatsAndAuthors();
    }, []);

    useEffect(() => {
        if (status !== 'authenticated' || !isAdmin) return;

        loadBanks();
        loadRecruitments();
        loadNews();
        loadBooks();
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

    useEffect(() => {
        if (activeSection !== 'news' || !newsForm.editingId) return;

        newsFormRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });

        const timer = window.setTimeout(() => {
            newsEngInputRef.current?.focus();
            newsEngInputRef.current?.select();
        }, 150);

        return () => window.clearTimeout(timer);
    }, [activeSection, newsForm.editingId]);

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
            <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:self-start">
                    <div className="border-b border-slate-100 pb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A2E92]">Admin</p>
                        <h1 className="mt-2 text-xl font-semibold text-slate-950">Dashboard</h1>
                    </div>

                    <nav className="mt-4 space-y-2">
                        <SidebarButton label="Overview" active={activeSection === 'overview'} onClick={() => setActiveSection('overview')} />
                        <SidebarMenuGroup label="Recruitment">
                            <SidebarButton label="Bank Master" active={activeSection === 'banks'} onClick={() => { setMasterView('list'); setActiveSection('banks'); }} nested />
                            <SidebarButton label="Recruitment" active={activeSection === 'recruitments'} onClick={() => { setMasterView('list'); setActiveSection('recruitments'); }} nested />
                            <SidebarButton label="News" active={activeSection === 'news'} onClick={() => { setMasterView('list'); setActiveSection('news'); }} nested />
                        </SidebarMenuGroup>
                        <SidebarMenuGroup label="E-Book">
                            <SidebarButton label="Book Master" active={activeSection === 'books'} onClick={() => { setMasterView('list'); setActiveSection('books'); }} nested />
                            <SidebarButton label="Author" active={activeSection === 'authors'} onClick={() => { setMasterView('list'); setActiveSection('authors'); }} nested />
                            <SidebarButton label="Category" active={activeSection === 'categories'} onClick={() => { setMasterView('list'); setActiveSection('categories'); }} nested />
                        </SidebarMenuGroup>
                    </nav>
                </aside>

                <div className="min-w-0 space-y-6">
                    {activeSection === 'overview' ? (
                        <div className="space-y-8">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A2E92]">Dashboard overview</p>
                                <h2 className="mt-2 text-3xl font-semibold text-slate-950">Manage recruitment and e-book content</h2>
                                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                                    Review your recruitment records and e-book library at a glance.
                                </p>
                            </div>

                            <section aria-labelledby="recruitment-summary-heading">
                                <div className="mb-4 flex items-center gap-3">
                                    <h3 id="recruitment-summary-heading" className="text-lg font-semibold text-slate-900">Recruitment</h3>
                                    <span className="h-px flex-1 bg-slate-200" />
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <DashboardCard title="Banks added" value={banks.length} detail="Member banks available for recruitment mapping." />
                                    <DashboardCard title="Recruitments added" value={recruitments.length} detail="Recruitment records created in the portal." />
                                    <DashboardCard title="News added" value={news.length} detail="News items shown on the latest news ticker." />
                                </div>
                            </section>

                            <section aria-labelledby="ebook-summary-heading">
                                <div className="mb-4 flex items-center gap-3">
                                    <h3 id="ebook-summary-heading" className="text-lg font-semibold text-slate-900">E-Book</h3>
                                    <span className="h-px flex-1 bg-slate-200" />
                                </div>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <DashboardCard title="Books added" value={books.length} detail="Books available in the e-book library." />
                                    <DashboardCard title="Authors added" value={authors.length} detail="Author records linked to the library." />
                                    <DashboardCard title="Categories added" value={categories.length} detail="Categories used to organize e-books." />
                                </div>
                            </section>
                        </div>
                    ) : null}

                    {activeSection === 'banks' ? (
                        <div className="space-y-6">
                            <MasterViewToggle view={masterView} onChange={setMasterView} addLabel="Add New Bank" />
                            <div className={`${masterView === 'form' ? '' : 'hidden'} rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:mx-auto xl:w-full xl:max-w-2xl`}>
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

                                    <div className="flex flex-col gap-3">
                                        {bank.editingId && (
                                            <button
                                                type="button"
                                                onClick={bank.cancelEdit}
                                                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Cancel edit
                                            </button>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={bank.isSaving}
                                            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                                        >
                                            {bank.isSaving ? 'Saving...' : bank.editingId ? 'Update bank' : 'Save bank'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className={masterView === 'list' ? 'min-w-0' : 'hidden'}>
                                <RecentlyAddedBanks banks={banks} onEdit={handleEditBank} onDelete={(item) => handleDeleteBank(item.bankId, item.bankName)} />
                            </div>
                        </div>
                    ) : null}

                    {activeSection === 'categories' ? (
                        <div className="space-y-6">
                            <MasterViewToggle view={masterView} onChange={setMasterView} addLabel="Add New Category" />
                            <div className={`${masterView === 'form' ? '' : 'hidden'} rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:mx-auto xl:w-full xl:max-w-2xl`}>
                                <h2 className="text-xl font-semibold text-slate-900 mb-6">Category Master</h2>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        categoryForm.submit();
                                    }}
                                    className="space-y-4"
                                >
                                    <AdminInput label="Category name" value={categoryForm.form.categoryName} onChange={(v) => categoryForm.setForm((p:any) => ({ ...p, categoryName: v }))} error={categoryForm.errors.categoryName} />

                                    <AdminInput label="Description" value={categoryForm.form.description} onChange={(v) => categoryForm.setForm((p:any) => ({ ...p, description: v }))} />

                                    <AdminInput label="Thumbnail URL" value={categoryForm.form.thumbnailUrl} onChange={(v) => categoryForm.setForm((p:any) => ({ ...p, thumbnailUrl: v }))} />

                                    <div className="space-y-3">
                                    {categoryForm.editingId && (
                                        <button
                                            type="button"
                                            onClick={categoryForm.cancelEdit}
                                            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel edit
                                        </button>
                                    )}

                                    <button type="submit" disabled={categoryForm.isSaving} className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{categoryForm.isSaving ? 'Saving...' : categoryForm.editingId ? 'Update category' : 'Save category'}</button>
                                </div>
                                </form>
                            </div>

                            <div className={`${masterView === 'list' ? 'min-w-0' : 'hidden'} rounded-lg border border-slate-200 bg-white p-6 shadow-sm`}>
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <h3 className="text-lg font-semibold">Recently added categories</h3>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{categories.length} total</span>
                                </div>
                                <MasterTableScroll className="max-h-[520px] overflow-x-scroll overflow-y-auto">
                                    <table className="min-w-[680px] w-full text-sm">
                                        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
                                            <tr>
                                                <th className="px-3 py-3 text-left">Name</th>
                                                <th className="px-3 py-3 text-left">Description</th>
                                                <th className="px-3 py-3 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map((item) => (
                                                <tr key={item.categoryId} className="border-t">
                                                    <td className="px-3 py-3 font-semibold text-slate-900">{item.categoryName}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.description || '—'}</td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditCategory(item)}
                                                                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteCategory(item.categoryId, item.categoryName)}
                                                                className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {categories.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-3 py-6 text-center text-slate-500">No categories added yet.</td>
                                                </tr>
                                            ) : null}
                                        </tbody>
                                    </table>
                                </MasterTableScroll>
                            </div>
                        </div>
                    ) : null}

                    {activeSection === 'authors' ? (
                        <div className="space-y-6">
                            <MasterViewToggle view={masterView} onChange={setMasterView} addLabel="Add New Author" />
                            <div className={`${masterView === 'form' ? '' : 'hidden'} rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:mx-auto xl:w-full xl:max-w-2xl`}>
                                <h2 className="text-xl font-semibold text-slate-900 mb-6">Author Master</h2>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        authorForm.submit();
                                    }}
                                    className="space-y-4"
                                >
                                    <AdminInput label="Author name" value={authorForm.form.authorName} onChange={(v) => authorForm.setForm((p:any) => ({ ...p, authorName: v }))} error={authorForm.errors.authorName} />

                                    <AdminInput label="Bio" value={authorForm.form.bio} onChange={(v) => authorForm.setForm((p:any) => ({ ...p, bio: v }))} />

                                    <AdminInput label="Photo URL" value={authorForm.form.photoUrl} onChange={(v) => authorForm.setForm((p:any) => ({ ...p, photoUrl: v }))} />

                                    <div className="space-y-3">
                                        {authorForm.editingId && (
                                            <button
                                                type="button"
                                                onClick={authorForm.cancelEdit}
                                                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                Cancel edit
                                            </button>
                                        )}

                                        <button type="submit" disabled={authorForm.isSaving} className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{authorForm.isSaving ? 'Saving...' : authorForm.editingId ? 'Update author' : 'Save author'}</button>
                                    </div>
                                </form>
                            </div>

                            <div className={`${masterView === 'list' ? 'min-w-0' : 'hidden'} rounded-lg border border-slate-200 bg-white p-6 shadow-sm`}>
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <h3 className="text-lg font-semibold">Recently added authors</h3>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{authors.length} total</span>
                                </div>
                                <MasterTableScroll className="max-h-[520px] overflow-x-scroll overflow-y-auto">
                                    <table className="min-w-[680px] w-full text-sm">
                                        <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
                                            <tr>
                                                <th className="px-3 py-3 text-left">Author</th>
                                                <th className="px-3 py-3 text-left">Bio</th>
                                                <th className="px-3 py-3 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {authors.map((item) => (
                                                <tr key={item.authorId} className="border-t">
                                                    <td className="px-3 py-3 font-semibold text-slate-900">{item.authorName}</td>
                                                    <td className="px-3 py-3 text-slate-600">{item.bio || '—'}</td>
                                                    <td className="px-3 py-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEditAuthor(item)}
                                                                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteAuthor(item.authorId, item.authorName)}
                                                                className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {authors.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-3 py-6 text-center text-slate-500">No authors added yet.</td>
                                                </tr>
                                            ) : null}
                                        </tbody>
                                    </table>
                                </MasterTableScroll>
                            </div>
                        </div>
                    ) : null}

                    {activeSection === 'books' ? (
                        <div className="space-y-6">
                            <MasterViewToggle view={masterView} onChange={setMasterView} addLabel="Add New Book" />
                            <div className={`${masterView === 'form' ? '' : 'hidden'} rounded-lg border border-slate-200 bg-white p-6 shadow-sm xl:mx-auto xl:w-full xl:max-w-5xl`}>
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                                    <h2 className="text-xl font-semibold text-slate-900">{editingBook ? 'Edit Book' : 'Add Book'}</h2>
                                    {editingBook ? (
                                        <button
                                            type="button"
                                            onClick={handleCancelBookEdit}
                                            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel edit
                                        </button>
                                    ) : null}
                                </div>

                                <BookForm
                                    categories={categories}
                                    authors={authors}
                                    editingBook={editingBook ?? undefined}
                                    onSaved={(book) => {
                                        if (editingBook) {
                                            setBooks((prev) => prev.map((item) => (item.bookId === book.bookId ? book : item)));
                                        } else {
                                            setBooks((prev) => [book, ...prev]);
                                        }
                                    }}
                                    onCancel={handleCancelBookEdit}
                                />
                            </div>

                            <div className={masterView === 'list' ? 'min-w-0' : 'hidden'}>
                                <RecentlyAddedBooks books={books} onEdit={handleEditBook} onDelete={(item) => handleDeleteBook(item.bookId, item.title)} />
                            </div>
                        </div>
                    ) : null}

                    {activeSection === 'recruitments' ? (
                        <div className="space-y-6">
                            <MasterViewToggle view={masterView} onChange={setMasterView} addLabel="Add New Recruitment" />
                            <div className={`${masterView === 'form' ? '' : 'hidden'} rounded-lg border border-slate-200 bg-white p-6 shadow-sm`}>
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

                            <div className={masterView === 'list' ? 'min-w-0' : 'hidden'}>
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
                        </div>
                    ) : null}

                    {activeSection === 'news' ? (
                        <div className="space-y-6">
                            <MasterViewToggle view={masterView} onChange={setMasterView} addLabel="Add New News" />
                            <div ref={newsFormRef} className={(masterView === 'form' ? '' : 'hidden ') + "rounded-lg border bg-white p-6 shadow-sm transition " + (newsForm.editingId ? "border-amber-300 ring-2 ring-amber-100 shadow-lg shadow-amber-50" : "border-slate-200")}>
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
                                        ref={newsEngInputRef}
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

                            <div className={masterView === 'list' ? 'min-w-0' : 'hidden'}>
                            <RecentlyAddedNews
                                news={news}
                                onEdit={(item) => {
                                    setActiveSection('news');
                                    setMasterView('form');
                                    newsForm.startEdit(item);
                                }}
                                onDelete={(item) => handleDeleteNews(item.id, item.newsEng || item.newsMrt || '')}
                            />
                            </div>
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

            <DeleteConfirmationDialog
                isOpen={deleteDialog.isOpen}
                title={deleteDialog.title}
                description={deleteDialog.description}
                confirmText={deleteDialog.confirmText}
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false, action: null }))}
            />
        </section>
    );
}

const adminInputClassName =
    'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-amber-100';

function SidebarMenuGroup({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="pt-2">
            <p className="px-3 pb-1  font-semibold uppercase tracking-[0.14em] text-[#7A2E92]">{label}</p>
            <div className="space-y-1">{children}</div>
        </div>
    );
}

function SidebarButton({ label, active, onClick, nested = false }: { label: string; active: boolean; onClick: () => void; nested?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full px-3 py-2.5 text-left font-semibold transition
                 ${nested ? 'pl-6' : ''} ${active ? 'text-[#7A2E92] underline decoration-2 decoration-[#7A2E92] underline-offset-8' : 'text-slate-600 hover:text-[#7A2E92]'
                }`}
        >
            {label}
        </button>
    );
}

function MasterViewToggle({ view, onChange, addLabel }: { view: 'list' | 'form'; onChange: (view: 'list' | 'form') => void; addLabel: string }) {
    return (
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <button
                type="button"
                onClick={() => onChange('list')}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${view === 'list' ? 'bg-[#7A2E92] text-white shadow-sm' : 'text-slate-600 hover:text-[#7A2E92]'}`}
            >
                List
            </button>
            <button
                type="button"
                onClick={() => onChange('form')}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${view === 'form' ? 'bg-[#7A2E92] text-white shadow-sm' : 'text-slate-600 hover:text-[#7A2E92]'}`}
            >
                {addLabel}
            </button>
        </div>
    );
}

function MasterTableScroll({ children, className = '' }: { children: ReactNode; className?: string }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollState, setScrollState] = useState({ position: 0, max: 0 });

    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;

        const updateScrollState = () => {
            setScrollState({
                position: element.scrollLeft,
                max: Math.max(0, element.scrollWidth - element.clientWidth),
            });
        };

        updateScrollState();
        const observer = new ResizeObserver(updateScrollState);
        observer.observe(element);
        Array.from(element.children).forEach((child) => observer.observe(child));
        const contentObserver = new MutationObserver(updateScrollState);
        contentObserver.observe(element, { childList: true, subtree: true });
        const visibilityObserver = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    updateScrollState();
                    window.requestAnimationFrame(updateScrollState);
                }
            },
            { threshold: 0 },
        );
        visibilityObserver.observe(element);
        const animationFrame = window.requestAnimationFrame(updateScrollState);
        const delayedUpdate = window.setTimeout(updateScrollState, 150);
        window.addEventListener('resize', updateScrollState);

        return () => {
            observer.disconnect();
            contentObserver.disconnect();
            visibilityObserver.disconnect();
            window.cancelAnimationFrame(animationFrame);
            window.clearTimeout(delayedUpdate);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [children]);

    return (
        <div className="min-w-0">
            <div
                ref={scrollRef}
                onScroll={() => {
                    const element = scrollRef.current;
                    if (element) setScrollState((current) => ({ ...current, position: element.scrollLeft }));
                }}
                className={`master-table-scroll ${className}`}
            >
                {children}
            </div>
            {scrollState.max > 0 ? (
                <div className="mt-2 flex min-w-0 items-center gap-2 md:hidden">
                    <span className="shrink-0 text-xs text-slate-500">Scroll table</span>
                    <input
                        aria-label="Scroll table horizontally"
                        type="range"
                        min="0"
                        max={scrollState.max}
                        value={Math.min(scrollState.position, scrollState.max)}
                        onChange={(event) => {
                            const element = scrollRef.current;
                            if (element) element.scrollLeft = Number(event.target.value);
                        }}
                        className="h-2 min-w-0 flex-1 cursor-pointer accent-[#7A2E92]"
                    />
                </div>
            ) : null}
        </div>
    );
}

function DashboardCard({ title, value, detail }: { title: string; value: number; detail: string }) {
    const cardVisuals = {
        'Banks added': { Icon: Building2, iconClass: 'bg-[#e8f4f5] text-[#2d6f78]', accentClass: 'border-l-[#75aeb5]' },
        'Recruitments added': { Icon: BriefcaseBusiness, iconClass: 'bg-[#e8f4f5] text-[#2d6f78]', accentClass: 'border-l-[#75aeb5]' },
        'News added': { Icon: Newspaper, iconClass: 'bg-[#e8f4f5] text-[#2d6f78]', accentClass: 'border-l-[#75aeb5]' },
        'Books added': { Icon: BookOpen, iconClass: 'bg-[#e8f4f5] text-[#2d6f78]', accentClass: 'border-l-[#75aeb5]' },
        'Authors added': { Icon: Users, iconClass: 'bg-[#e8f4f5] text-[#2d6f78]', accentClass: 'border-l-[#75aeb5]' },
        'Categories added': { Icon: Tags, iconClass: 'bg-[#e8f4f5] text-[#2d6f78]', accentClass: 'border-l-[#75aeb5]' },
    } as const;
    const visual = cardVisuals[title as keyof typeof cardVisuals] ?? cardVisuals['Banks added'];
    const Icon = visual.Icon;

    return (
        <div className={`rounded-xl border border-slate-200 border-l-4 ${visual.accentClass} bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-base font-semibold text-slate-600">{title}</p>
                    <p className="mt-2 text-[2.75rem] font-bold leading-none tracking-tight text-slate-950">{value}</p>
                </div>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${visual.iconClass} shadow-sm`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-3">
                <p className="text-[15px] leading-6 text-slate-500">{detail}</p>
            </div>
        </div>
    );
}

function RecentlyAddedBanks({ banks, onEdit, onDelete }: { banks: AdminBank[]; onEdit?: (item: AdminBank) => void; onDelete?: (item: AdminBank) => void }) {
    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">Recently added banks</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{banks.length} total</span>
            </div>
            <MasterTableScroll className="mt-4 max-h-[520px] overflow-x-scroll overflow-y-auto">
                <table className="min-w-[760px] w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-3 py-3 text-left">Bank</th>
                            <th className="px-3 py-3 text-left">Code</th>
                            <th className="px-3 py-3 text-left">Contact</th>
                            <th className="px-3 py-3 text-left">Phone</th>
                            {(onEdit || onDelete) && <th className="px-3 py-3 text-left">Actions</th>}
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
                                {(onEdit || onDelete) && (
                                    <td className="px-3 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {onEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(bank)}
                                                    className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(bank)}
                                                    className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {banks.length === 0 ? (
                            <tr>
                                <td colSpan={onEdit || onDelete ? 5 : 4} className="px-3 py-6 text-center text-slate-500">No bank added yet.</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </MasterTableScroll>
        </div>
    );
}

function RecentlyAddedBooks({ books, onEdit, onDelete }: { books: any[]; onEdit?: (item: any) => void; onDelete?: (item: any) => void }) {
    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">Recently added books</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{books.length} total</span>
            </div>
            <MasterTableScroll className="mt-4 max-h-[520px] overflow-x-scroll overflow-y-auto">
                <table className="min-w-[760px] w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-3 py-3 text-left">Title</th>
                            <th className="px-3 py-3 text-left">Author</th>
                            <th className="px-3 py-3 text-left">Category</th>
                            <th className="px-3 py-3 text-left">Price</th>
                            {(onEdit || onDelete) && <th className="px-3 py-3 text-left">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {books.map((book) => (
                            <tr key={book.bookId} className="border-t">
                                <td className="px-3 py-3 font-semibold text-slate-900">{book.title}</td>
                                <td className="px-3 py-3 text-slate-600">{book.authorName}</td>
                                <td className="px-3 py-3 text-slate-600">{book.categoryName}</td>
                                <td className="px-3 py-3 text-slate-600">{book.price}</td>
                                {(onEdit || onDelete) && (
                                    <td className="px-3 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            {onEdit && (
                                                <button
                                                    type="button"
                                                    onClick={() => onEdit(book)}
                                                    className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(book)}
                                                    className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {books.length === 0 ? (
                            <tr>
                                <td colSpan={onEdit || onDelete ? 5 : 4} className="px-3 py-6 text-center text-slate-500">No books added yet.</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </MasterTableScroll>
        </div>
    );
}

function RecentlyAddedRecruitments({
    recruitments,
    onEdit,
    onUpload,
    onPublish,
    onDelete,
    publishingRecruitmentId,
}: {
    recruitments: AdminRecruitment[];
    onEdit: (item: AdminRecruitment) => void;
    onUpload: (item: AdminRecruitment) => void;
    onPublish: (item: AdminRecruitment) => void;
    onDelete?: (item: AdminRecruitment) => void;
    publishingRecruitmentId: number | null;
}) {
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'published' | 'expired'>('all');
    const getStatus = (item: AdminRecruitment) => {
        if (item.isPublished) return 'published';
        if (item.applicationEndDate && new Date(item.applicationEndDate) < new Date()) return 'expired';
        return 'active';
    };
    const visibleRecruitments = recruitments.filter((item) => statusFilter === 'all' || getStatus(item) === statusFilter);

    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Recruitment list</h2>
                    <p className="mt-1 text-sm text-slate-500">Upload a vacancy notice PDF before you publish each recruitment listing.</p>
                </div>
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-slate-600" htmlFor="recruitment-status-filter">Status</label>
                    <div className="relative">
                        <select
                            id="recruitment-status-filter"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm font-semibold text-slate-700 outline-none focus:border-[#7A2E92] focus:ring-2 focus:ring-[#7A2E92]/30"
                        >
                            <option value="all">All statuses</option>
                            <option value="active">Active</option>
                            <option value="published">Published</option>
                            <option value="expired">Expired</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" aria-hidden="true" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{visibleRecruitments.length} of {recruitments.length}</span>
                </div>
            </div>
            <MasterTableScroll className="mt-4 max-h-[560px] overflow-x-scroll overflow-y-auto">
                <table className="min-w-[980px] w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
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
                        {visibleRecruitments.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="px-3 py-3 font-semibold">{item.code}</td>
                                <td className="px-3 py-3">{item.bankName}</td>
                                <td className="px-3 py-3">{item.postName}</td>
                                <td className="px-3 py-3 whitespace-nowrap">{formatDate(item.applicationStartDate) || 'To be announced'}</td>
                                <td className="px-3 py-3 whitespace-nowrap">{formatDate(item.applicationEndDate) || 'To be announced'}</td>
                                <td className="px-3 py-3">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatus(item) === 'published' ? 'bg-emerald-50 text-emerald-700' : getStatus(item) === 'expired' ? 'bg-rose-50 text-rose-700' : 'bg-violet-50 text-[#7A2E92]'}`}>
                                        {getStatus(item).charAt(0).toUpperCase() + getStatus(item).slice(1)}
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
                                        {onDelete && (
                                            <button
                                                type="button"
                                                onClick={() => onDelete(item)}
                                                className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    {!item.noticePdfUrl && !item.isPublished ? (
                                        <p className="mt-2 text-xs text-slate-500">Upload the notice PDF before publishing.</p>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                        {visibleRecruitments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-3 py-6 text-center text-slate-500">No recruitments match this status.</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </MasterTableScroll>
        </div>
    );
}

function RecentlyAddedNews({ news, onEdit, onDelete }: { news: AdminNews[]; onEdit?: (item: AdminNews) => void; onDelete?: (item: AdminNews) => void }) {
    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">Recently added news</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{news.length} total</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">News items displayed on the home page latest news ticker section.</p>
            <MasterTableScroll className="mt-4 max-h-[520px] overflow-x-scroll overflow-y-auto">
                <table className="min-w-[860px] w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
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
                                    <div className="flex flex-wrap gap-2">
                                        {onEdit && (
                                            <button
                                                type="button"
                                                onClick={() => onEdit(item)}
                                                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                type="button"
                                                onClick={() => onDelete(item)}
                                                className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
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
            </MasterTableScroll>
        </div>
    );
}

type AdminInputProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    required?: boolean;
    error?: string;
};

const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(function AdminInput(
    {
        label,
        value,
        onChange,
        type = 'text',
        required = false,
        error,
    },
    ref,
) {
    return (
        <label className="block">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            <input
                ref={ref}
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
});
