'use client'
import { useState, useRef } from 'react';
import { createBookService } from '@/actions/api/admin.actions';
import { toast } from 'sonner';

type Props = {
  categories: any[];
  authors: any[];
  onSaved?: (book: any) => void;
};

const inputClass = 'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-amber-100';

export default function BookForm({ categories, authors, onSaved }: Props) {
  const [form, setForm] = useState({
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
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const pdfRef = useRef<HTMLInputElement | null>(null);
  const coverRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('CategoryId', String(form.categoryId));
    fd.append('AuthorId', String(form.authorId));
    fd.append('Title', form.title);
    fd.append('Description', form.description);
    fd.append('Language', form.language);
    fd.append('TotalPages', form.totalPages);
    fd.append('PublishedYear', form.publishedYear);
    fd.append('Isbn', form.isbn);
    fd.append('Price', form.price);
    fd.append('IsFeatured', String(form.isFeatured));
    fd.append('TagsRaw', form.tagsRaw);
    if (pdfFile) fd.append('PdfFile', pdfFile);
    if (coverFile) fd.append('CoverFile', coverFile);

    try {
      setIsSaving(true);
      const data = await createBookService(fd as any);
      toast.success('Book created');
      onSaved?.(data);
      setForm({ categoryId: '', authorId: '', title: '', description: '', language: '', totalPages: '', publishedYear: '', isbn: '', price: '', isFeatured: false, tagsRaw: '' });
      setPdfFile(null);
      setCoverFile(null);
      if (pdfRef.current) pdfRef.current.value = '';
      if (coverRef.current) coverRef.current.value = '';
    } catch (err) {
      toast.error('Failed to create book');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Category</span>
        <select value={form.categoryId} onChange={(e) => setForm(p => ({ ...p, categoryId: e.target.value }))} className={inputClass}>
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Author</span>
        <select value={form.authorId} onChange={(e) => setForm(p => ({ ...p, authorId: e.target.value }))} className={inputClass}>
          <option value="">Select author</option>
          {authors.map((a) => <option key={a.authorId} value={a.authorId}>{a.authorName}</option>)}
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Title</span>
        <input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className={inputClass} />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Description</span>
        <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className={`${inputClass} h-32`} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Language</span>
          <input value={form.language} onChange={(e) => setForm(p => ({ ...p, language: e.target.value }))} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Total Pages</span>
          <input value={form.totalPages} onChange={(e) => setForm(p => ({ ...p, totalPages: e.target.value }))} className={inputClass} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Published Year</span>
          <input value={form.publishedYear} onChange={(e) => setForm(p => ({ ...p, publishedYear: e.target.value }))} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">ISBN</span>
          <input value={form.isbn} onChange={(e) => setForm(p => ({ ...p, isbn: e.target.value }))} className={inputClass} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Price</span>
          <input value={form.price} onChange={(e) => setForm(p => ({ ...p, price: e.target.value }))} className={inputClass} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Is Featured</span>
          <select value={String(form.isFeatured)} onChange={(e) => setForm(p => ({ ...p, isFeatured: e.target.value === 'true' }))} className={inputClass}>
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-semibold text-slate-800">Tags (comma separated)</span>
        <input value={form.tagsRaw} onChange={(e) => setForm(p => ({ ...p, tagsRaw: e.target.value }))} className={inputClass} />
      </label>

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
        </div>
      </div>

      <div>
        <button type="submit" disabled={isSaving} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">{isSaving ? 'Saving...' : 'Create book'}</button>
      </div>
    </form>
  );
}
