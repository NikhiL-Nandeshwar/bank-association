'use client'
import { FormEvent, useEffect, useState, useRef } from 'react';
import { createBookService, updateBookService } from '@/actions/api/admin.actions';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/api-error';
import { fixPdfUrl } from '@/lib/utils';

type BookFormValues = {
  categoryId: string;
  authorId: string;
  title: string;
  description: string;
  language: string;
  totalPages: string;
  publishedYear: string;
  isbn: string;
  price: string;
  isFeatured: boolean;
  tagsRaw: string;
};

type Props = {
  categories: any[];
  authors: any[];
  editingBook?: any;
  onSaved?: (book: any) => void;
  onCancel?: () => void;
};

const inputClass = 'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-amber-100';

const initialForm: BookFormValues = {
  categoryId: '',
  authorId: '',
  title: '',
  description: '',
  language: '',
  totalPages: '',
  publishedYear: '',
  isbn: '',
  price: '',
  isFeatured: false,
  tagsRaw: '',
};

export default function BookForm({ categories, authors, editingBook, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<BookFormValues>(initialForm);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [existingBookPdfUrl, setExistingBookPdfUrl] = useState('');
  const [existingCoverImageUrl, setExistingCoverImageUrl] = useState('');
  const pdfRef = useRef<HTMLInputElement | null>(null);
  const coverRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editingBook) {
      setForm(initialForm);
      setPdfFile(null);
      setCoverFile(null);
      setExistingBookPdfUrl('');
      setExistingCoverImageUrl('');
      if (pdfRef.current) pdfRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
      return;
    }

    setForm({
      categoryId: String(editingBook.categoryId ?? ''),
      authorId: String(editingBook.authorId ?? ''),
      title: editingBook.title ?? '',
      description: editingBook.description ?? '',
      language: editingBook.language ?? '',
      totalPages: String(editingBook.totalPages ?? ''),
      publishedYear: String(editingBook.publishedYear ?? 0),
      isbn: editingBook.isbn ?? '',
      price: String(editingBook.price ?? ''),
      isFeatured: Boolean(editingBook.isFeatured),
      tagsRaw: editingBook.tagsRaw ?? '',
    });
    setPdfFile(null);
    setCoverFile(null);
    if (pdfRef.current) pdfRef.current.value = '';
    if (coverRef.current) coverRef.current.value = '';

    const getFileUrl = (book: any, type: 'pdf' | 'cover'): string => {
      const record = book?.data && typeof book.data === 'object' ? book.data : book;
      const candidates = type === 'pdf'
        ? [record?.bookPdfUrl, record?.pdfUrl, record?.pdfFileUrl, record?.pdfPath, record?.newPdfFile]
        : [record?.coverImageUrl, record?.coverUrl, record?.coverFileUrl, record?.coverPath, record?.newCoverFile];
      return candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim() ?? '';
    };
    // Keep existing files as backend references. They are only replaced when
    // the administrator explicitly selects a new file.
    setExistingBookPdfUrl(getFileUrl(editingBook, 'pdf'));
    setExistingCoverImageUrl(getFileUrl(editingBook, 'cover'));
    console.debug('[Book edit] selected book:', editingBook);
    console.debug('[Book edit] existing PDF URL:', getFileUrl(editingBook, 'pdf'));
    console.debug('[Book edit] existing cover URL:', getFileUrl(editingBook, 'cover'));
  }, [editingBook]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const hasPdf = Boolean(pdfFile || existingBookPdfUrl);
    const hasCover = Boolean(coverFile || existingCoverImageUrl);
    console.debug('[Book edit] validation:', { hasPdf, hasCover, existingBookPdfUrl, existingCoverImageUrl, pdfFile, coverFile });
    if (!hasPdf || !hasCover) {
      toast.error(`A ${!hasPdf ? 'PDF' : 'cover image'} is required.`);
      return;
    }

    const payload = {
      categoryId: form.categoryId,
      authorId: form.authorId,
      title: form.title,
      description: form.description,
      language: form.language,
      totalPages: form.totalPages,
      publishedYear: form.publishedYear || new Date().getFullYear(),
      isbn: form.isbn,
      price: form.price,
      isFeatured: form.isFeatured,
      tagsRaw: form.tagsRaw,
      pdfFile,
      coverFile,
    };

    try {
      setIsSaving(true);
      const data = editingBook
        ? await updateBookService({ ...payload, isActive: editingBook.isActive ?? true, bookId: editingBook.bookId })
        : await createBookService(payload);
      toast.success(editingBook ? 'Book updated' : 'Book created');
      onSaved?.(data);
      if (!editingBook) {
        setForm(initialForm);
        setPdfFile(null);
        setCoverFile(null);
        if (pdfRef.current) pdfRef.current.value = '';
        if (coverRef.current) coverRef.current.value = '';
      }
      if (editingBook) {
        onCancel?.();
      }
    } catch (err) {
      toast.error(getErrorMessage(err, editingBook ? 'Failed to update book' : 'Failed to create book'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Category*</span>
          <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} className={inputClass}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Author*</span>
          <select value={form.authorId} onChange={(e) => setForm(p => ({ ...p, authorId: e.target.value }))} className={inputClass}>
            <option value="">Select author</option>
            {authors.map((a) => <option key={a.authorId} value={a.authorId}>{a.authorName}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Book Title*</span>
          <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Language</span>
          <input value={form.language} onChange={(e) => setForm(p => ({ ...p, language: e.target.value }))} className={inputClass} />
        </label>
      </div>


      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Description*</span>
        <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className={`${inputClass} h-32`} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Total Pages</span>
          <input type='number' value={form.totalPages} onChange={(e) => setForm(p => ({ ...p, totalPages: e.target.value }))} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Price*</span>
          <input value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} className={inputClass} />
        </label>
      </div>
      {/*
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Published Year</span>
          <input value={form.publishedYear} onChange={(e) => setForm(p => ({ ...p, publishedYear: e.target.value }))} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">ISBN</span>
          <input value={form.isbn} onChange={(e) => setForm(p => ({ ...p, isbn: e.target.value }))} className={inputClass} />
        </label>
      </div> */}

      <div className="grid grid-cols-2 gap-4">

        {/* <label className="block">
          <span className="text-sm font-semibold text-slate-800">Is Featured</span>
          <select value={String(form.isFeatured)} onChange={(e) => setForm(p => ({ ...p, isFeatured: e.target.value === 'true' }))} className={inputClass}>
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        </label> */}
      </div>

      {/* <label className="block">
        <span className="text-sm font-semibold text-slate-800">Tags (comma separated)</span>
        <input value={form.tagsRaw} onChange={(e) => setForm(p => ({ ...p, tagsRaw: e.target.value }))} className={inputClass} />
      </label> */}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-sm font-semibold text-slate-800">Pdf File</span>
          <div className="mt-2 flex items-center gap-3">
            <label className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
              Choose file
              <input ref={pdfRef} type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)} className="sr-only" />
            </label>
            <div className="text-sm text-slate-600 truncate">{pdfFile ? pdfFile.name : 'No file chosen'}</div>
            {pdfFile ? (
              <button type="button" onClick={() => { setPdfFile(null); if (pdfRef.current) pdfRef.current.value = ''; }} className="text-sm text-rose-600">Remove</button>
            ) : null}
          </div>
          {existingBookPdfUrl ? (
            <a href={fixPdfUrl(existingBookPdfUrl)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-sky-700 hover:underline">
              View attached PDF
            </a>
          ) : null}
        </div>

        <div>
          <span className="text-sm font-semibold text-slate-800">Cover Image</span>
          <div className="mt-2 flex items-center gap-3">
            <label className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer">
              Choose file
              <input ref={coverRef} type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className="sr-only" />
            </label>
            <div className="text-sm text-slate-600 truncate">{coverFile ? coverFile.name : 'No file chosen'}</div>
            {coverFile ? (
              <button type="button" onClick={() => { setCoverFile(null); if (coverRef.current) coverRef.current.value = ''; }} className="text-sm text-rose-600">Remove</button>
            ) : null}
          </div>
          {existingCoverImageUrl ? (
            <div className="mt-2 flex items-center gap-3">
              <img src={fixPdfUrl(existingCoverImageUrl)} alt="Current book cover" className="h-12 w-9 rounded border border-slate-200 object-cover" />
              <a href={fixPdfUrl(existingCoverImageUrl)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-sky-700 hover:underline">
                View attached cover image
              </a>
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <button type="submit" disabled={isSaving} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{isSaving ? 'Saving...' : editingBook ? 'Update book' : 'Create book'}</button>
      </div>
    </form>
  );
}
