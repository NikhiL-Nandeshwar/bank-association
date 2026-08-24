/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { createAuthorService, updateAuthorService } from '@/actions/api/admin.actions';
import { createAuthorSchema } from '@/schemas/author.schema';
import { getZodFieldErrors } from '@/utils/validation';
import { ADMIN_DASHBOARD_MESSAGES } from '@/app/admin/dashboard/messages';
import { toast } from 'sonner';

export const emptyAuthorForm = {
  authorName: '',
  bio: '',
  photoUrl: '',
};

export interface CreateAuthorResponse {
  authorId: number;
}

export function useAuthorForm(authors: any[], setAuthors: any, onUpdateSuccess?: () => void) {
  const [form, setForm] = useState(emptyAuthorForm);
  const [errors, setErrors] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const submit = async () => {
    const parsed = createAuthorSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(getZodFieldErrors(parsed.error));
      toast.error(ADMIN_DASHBOARD_MESSAGES.author?.validationError ?? 'Please fix the highlighted fields.');
      return;
    }

    setErrors({});
    setIsSaving(true);

    if (editingId) {
      try {
        await updateAuthorService({ authorId: editingId, ...parsed.data });

        const next = authors.map((item: any) =>
          item.authorId === editingId ? { ...item, ...parsed.data, authorId: editingId } : item,
        );

        setAuthors(next);
        toast.success(ADMIN_DASHBOARD_MESSAGES.author?.saveSuccess ?? 'Author updated successfully.');
        onUpdateSuccess?.();
      } catch {
        toast.error(ADMIN_DASHBOARD_MESSAGES.author?.saveFailed ?? 'Failed to update author.');
      } finally {
        setForm(emptyAuthorForm);
        setEditingId(null);
        setIsSaving(false);
      }
      return;
    }

    const local = { authorId: Date.now(), ...parsed.data };

    try {
      const data = (await createAuthorService(parsed.data)) as {
        authorId?: number;
      };

      local.authorId = data.authorId ?? local.authorId;
      toast.success(ADMIN_DASHBOARD_MESSAGES.author?.saveSuccess ?? 'Author added.');
    } catch {
      toast.error(ADMIN_DASHBOARD_MESSAGES.author?.saveFailed ?? 'Failed to add author.');
    } finally {
      setAuthors([local, ...authors]);
      setForm(emptyAuthorForm);
      setEditingId(null);
      setIsSaving(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.authorId);
    setForm({
      authorName: item.authorName ?? '',
      bio: item.bio ?? '',
      photoUrl: item.photoUrl ?? '',
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyAuthorForm);
    setErrors({});
  };

  return { form, setForm, errors, isSaving, submit, editingId, startEdit, cancelEdit };
}
