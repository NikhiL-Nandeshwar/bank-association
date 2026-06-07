// hooks/useRecruitmentForm.ts

import { saveRecruitmentService } from "@/actions/api/admin.actions";
import { ADMIN_DASHBOARD_MESSAGES } from "@/app/admin/dashboard/messages";
import { emptyRecruitmentForm } from "@/constants/adminDashboard";
import { createVacancySchema } from "@/schemas/vacancy.schema";
import { AdminRecruitment, RecruitmentFormErrors } from "@/types/adminDashboard";
import { getDateInputValue } from "@/utils/adminDashboardHelper";
import { getErrorMessage } from "@/utils/api-error";
import { useState } from "react";
import { toast } from "sonner";
import { getZodFieldErrors } from "@/utils/validation";

export function useRecruitmentForm(loadRecruitments: () => Promise<void>) {
  const [form, setForm] = useState(emptyRecruitmentForm);
  const [errors, setErrors] = useState<RecruitmentFormErrors>({});
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const submit = async () => {
    setMessage('');

    if (!form.bankId) {
      setErrors({ bankId: ADMIN_DASHBOARD_MESSAGES.recruitment.bankRequired });
      toast.error(ADMIN_DASHBOARD_MESSAGES.recruitment.bankRequired);
      return;
    }

    const parsed = createVacancySchema.safeParse({
      ...form,
      requiredCityDistrict: form.requiredCityDistrict || undefined,
      eligibilityCriteria: form.eligibilityCriteria?.length ? form.eligibilityCriteria : undefined,
    });

    if (!parsed.success) {
      setErrors(getZodFieldErrors(parsed.error));
      toast.error(ADMIN_DASHBOARD_MESSAGES.recruitment.validationError);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      await saveRecruitmentService(parsed.data, editingId);
      await loadRecruitments();

      const msg = editingId
        ? ADMIN_DASHBOARD_MESSAGES.recruitment.updateSuccess
        : ADMIN_DASHBOARD_MESSAGES.recruitment.saveSuccess;

      setMessage(msg);
      toast.success(msg);

      setForm(emptyRecruitmentForm);
      setEditingId(null);

    } catch (error) {
      const msg = getErrorMessage(
        error,
        editingId
          ? ADMIN_DASHBOARD_MESSAGES.recruitment.updateFailed
          : ADMIN_DASHBOARD_MESSAGES.recruitment.saveFailed
      );

      setMessage(msg);
      toast.error(msg);

    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (item: AdminRecruitment) => {
    setEditingId(item.id);

    setForm({
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
      eligibilityCriteria: item.eligibilityCriteria ?? [],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyRecruitmentForm);
    setErrors({});
    setMessage('');
  };

  return {
    form,
    setForm,
    errors,
    message,
    isSaving,
    editingId,
    submit,
    startEdit,
    cancelEdit,
  };
}