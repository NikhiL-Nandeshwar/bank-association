import { useState } from 'react';
import { createAuthorService } from '@/actions/api/admin.actions';
import { createAuthorSchema } from '@/schemas/author.schema';
import { getZodFieldErrors } from '@/utils/validation';
import { ADMIN_DASHBOARD_MESSAGES } from '@/app/admin/dashboard/messages';
import { toast } from 'sonner';

export const emptyAuthorForm = {
  authorName: '',
  bio: '',
  photoUrl: '',
};

export function useAuthorForm(authors: any[], setAuthors: any) {
  const [form, setForm] = useState(emptyAuthorForm);
  const [errors, setErrors] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    const parsed = createAuthorSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(getZodFieldErrors(parsed.error));
      toast.error(ADMIN_DASHBOARD_MESSAGES.author?.validationError ?? 'Please fix the highlighted fields.');
      return;
    }

    setErrors({});
    setIsSaving(true);

    const local = { authorId: Date.now(), ...parsed.data };

    try {
      const data = await createAuthorService(parsed.data);
      local.authorId = data.authorId ?? local.authorId;
      toast.success(ADMIN_DASHBOARD_MESSAGES.author?.saveSuccess ?? 'Author added.');
    } catch {
      toast.error(ADMIN_DASHBOARD_MESSAGES.author?.saveFailed ?? 'Failed to add author.');
    } finally {
      setAuthors([local, ...authors]);
      setForm(emptyAuthorForm);
      setIsSaving(false);
    }
  };

  return { form, setForm, errors, isSaving, submit };
}
