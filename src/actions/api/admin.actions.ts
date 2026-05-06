/* eslint-disable @typescript-eslint/no-explicit-any */
import { getErrorMessage } from "@/utils/api-error";
import { createVacancy, getVacancies, updateVacancy } from "./vacancy.actions";
import { formatApiRecruitment, getVacancyItems } from "@/utils/adminDashboardHelper";
import { ADMIN_DASHBOARD_MESSAGES } from "@/app/admin/dashboard/messages";
import { createBank } from "./bank.actions";

export async function fetchRecruitmentsService() {
    const response = await getVacancies();

    return getVacancyItems(response.data).map(formatApiRecruitment);
}

export async function createBankService(payload: any) {
    const response = await createBank(payload);
    return response.data;
}

export async function saveRecruitmentService(
    payload: any,
    editingId?: number | null
) {
    if (editingId) {
        return updateVacancy({
            vacancyId: editingId,
            ...payload,
        });
    }

    return createVacancy(payload);
}