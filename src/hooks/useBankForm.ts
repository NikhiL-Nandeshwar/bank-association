/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useBankForm.ts

import { createBankService, updateBankService } from "@/actions/api/admin.actions";
import { ADMIN_DASHBOARD_MESSAGES } from "@/app/admin/dashboard/messages";
import { emptyBankForm } from "@/constants/adminDashboard";
import { STORAGE_KEYS } from "@/constants/storage.constants";
import { createBankSchema, updateBankSchema } from "@/schemas/bank.schema";
import { AdminBank, BankFormErrors, BankFormField } from "@/types/adminDashboard";
import { writeStoredList } from "@/utils/adminDashboardHelper";
import { getZodFieldErrors } from "@/utils/validation";
import { useState } from "react";
import { toast } from "sonner";

export function useBankForm(banks: AdminBank[], setBanks: any) {
    const [form, setForm] = useState(emptyBankForm);
    const [errors, setErrors] = useState<BankFormErrors>({});
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const startEdit = (item: any) => {
        setEditingId(item.bankId);
        setForm({
            bankName: item.bankName ?? '',
            bankNameMarathi: item.bankNameMarathi ?? '',
            bankCode: item.bankCode ?? '',
            address: item.address ?? '',
            contactEmail: item.contactEmail ?? '',
            contactPhone: item.contactPhone ?? '',
            logoUrl: item.logoUrl ?? '',
        });
        setErrors({});
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(emptyBankForm);
        setErrors({});
    };

    const clearError = (field: BankFormField) => {
        setErrors((previous) => ({ ...previous, [field]: undefined }));
    };

    const submit = async () => {
        setMessage('');

        if (editingId) {
            const parsed = updateBankSchema.safeParse({ bankId: editingId, ...form });

            if (!parsed.success) {
                setErrors(getZodFieldErrors(parsed.error));
                toast.error(ADMIN_DASHBOARD_MESSAGES.bank.validationError);
                return;
            }

            setErrors({});
            setIsSaving(true);

            try {
                await updateBankService(parsed.data);

                const next = banks.map((bank) =>
                    bank.bankId === editingId ? { ...bank, ...parsed.data } : bank,
                );

                setBanks(next);
                writeStoredList(STORAGE_KEYS.adminBanks, next);

                setMessage(ADMIN_DASHBOARD_MESSAGES.bank.updateSuccess);
                toast.success(ADMIN_DASHBOARD_MESSAGES.bank.updateSuccess);
            } catch {
                toast.error(ADMIN_DASHBOARD_MESSAGES.bank.updateFailed);
            } finally {
                setForm(emptyBankForm);
                setEditingId(null);
                setIsSaving(false);
            }
            return;
        }

        const parsed = createBankSchema.safeParse(form);

        if (!parsed.success) {
            setErrors(getZodFieldErrors(parsed.error));
            toast.error(ADMIN_DASHBOARD_MESSAGES.bank.validationError);
            return;
        }

        setErrors({});
        setIsSaving(true);

        const localBank: AdminBank = {
            bankId: Date.now(),
            ...parsed.data,
        };

        try {
            const data = await createBankService(parsed.data);
            localBank.bankId = data.bankId;

            setMessage(ADMIN_DASHBOARD_MESSAGES.bank.saveSuccess);
            toast.success(ADMIN_DASHBOARD_MESSAGES.bank.saveSuccess);
        } catch {
            setMessage(ADMIN_DASHBOARD_MESSAGES.bank.localSaveFallback);
            toast.error(ADMIN_DASHBOARD_MESSAGES.bank.saveFailed);
        } finally {
            const next = [localBank, ...banks];
            setBanks(next);
            writeStoredList(STORAGE_KEYS.adminBanks, next);

            setForm(emptyBankForm);
            setIsSaving(false);
        }
    };

    return { form, setForm, errors, message, isSaving, editingId, submit, startEdit, cancelEdit, clearError };
}
