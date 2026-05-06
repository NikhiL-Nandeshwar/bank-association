/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useBankForm.ts

import { createBankService } from "@/actions/api/admin.actions";
import { ADMIN_DASHBOARD_MESSAGES } from "@/app/admin/dashboard/messages";
import { emptyBankForm } from "@/constants/adminDashboard";
import { STORAGE_KEYS } from "@/constants/storage.constants";
import { createBankSchema } from "@/schemas/bank.schema";
import { AdminBank, BankFormErrors } from "@/types/adminDashboard";
import { writeStoredList } from "@/utils/adminDashboardHelper";
import { getZodFieldErrors } from "@/utils/validation";
import { useState } from "react";
import { toast } from "sonner";

export function useBankForm(banks: AdminBank[], setBanks: any) {
    const [form, setForm] = useState(emptyBankForm);
    const [errors, setErrors] = useState<BankFormErrors>({});
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const submit = async () => {
        setMessage('');

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

    return { form, setForm, errors, message, isSaving, submit };
}