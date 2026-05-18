/* eslint-disable @typescript-eslint/no-explicit-any */
import { createVacancy, getVacancies, updateVacancy } from "./vacancy.actions";
import { formatApiBank, formatApiRecruitment, getBankItems, getVacancyItems } from "@/utils/adminDashboardHelper";
import { createBank, getBanks } from "./bank.actions";

export async function fetchBanksService() {
    const response = await getBanks();

    return getBankItems(response.data).map(formatApiBank);
}

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
