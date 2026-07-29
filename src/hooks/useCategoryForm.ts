/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { createCategoryService, updateCategoryService } from '@/actions/api/admin.actions';
import { createCategorySchema } from '@/schemas/category.schema';
import { getZodFieldErrors } from '@/utils/validation';
import { ADMIN_DASHBOARD_MESSAGES } from '@/app/admin/dashboard/messages';
import { toast } from 'sonner';

export const emptyCategoryForm = {
  categoryName: '',
  description: '',
  thumbnailUrl: '',
  sortOrder: 0,
};

export function useCategoryForm(categories: any[], setCategories: any) {
  const [form, setForm] = useState(emptyCategoryForm);
  const [errors, setErrors] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const submit = async () => {
    const parsed = createCategorySchema.safeParse(form);
    if (!parsed.success) {
      setErrors(getZodFieldErrors(parsed.error));
      toast.error(ADMIN_DASHBOARD_MESSAGES.category?.validationError ?? 'Please fix the highlighted fields.');
      return;
    }

    setErrors({});
    setIsSaving(true);

    if (editingId) {
      try {
        const data = await updateCategoryService({ categoryId: editingId, ...parsed.data });

        const next = categories.map((item: any) =>
          item.categoryId === editingId ? { ...item, ...parsed.data, categoryId: editingId } : item,
        );

        setCategories(next);
        toast.success(ADMIN_DASHBOARD_MESSAGES.category?.saveSuccess ?? 'Category updated successfully.');
      } catch {
        toast.error(ADMIN_DASHBOARD_MESSAGES.category?.saveFailed ?? 'Failed to update category.');
      } finally {
        setForm(emptyCategoryForm);
        setEditingId(null);
        setIsSaving(false);
      }
      return;
    }

    const local = { categoryId: Date.now(), ...parsed.data };

    try {
      const data = (await createCategoryService(parsed.data)) as {
        categoryId?: number;
      };

      local.categoryId = data.categoryId ?? local.categoryId;

      toast.success(ADMIN_DASHBOARD_MESSAGES.category?.saveSuccess ?? 'Category added.');
    } catch {
      toast.error(ADMIN_DASHBOARD_MESSAGES.category?.saveFailed ?? 'Failed to add category.');
    } finally {
      setCategories([local, ...categories]);
      setForm(emptyCategoryForm);
      setEditingId(null);
      setIsSaving(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.categoryId);
    setForm({
      categoryName: item.categoryName ?? '',
      description: item.description ?? '',
      thumbnailUrl: item.thumbnailUrl ?? '',
      sortOrder: item.sortOrder ?? 0,
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyCategoryForm);
    setErrors({});
  };

  return { form, setForm, errors, isSaving, submit, editingId, startEdit, cancelEdit };
}
