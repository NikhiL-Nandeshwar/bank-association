/* eslint-disable @typescript-eslint/no-explicit-any */
import { createVacancy, getVacancies, updateVacancy } from "./vacancy.actions";
import { formatApiBank, formatApiRecruitment, getBankItems, getVacancyItems } from "@/utils/adminDashboardHelper";
import { createBank, getBanks } from "./bank.actions";
import { createNews, updateNews, getNews } from "./news.actions";

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

export async function fetchNewsService() {
    const response = await getNews();
    
    // Handle both array and paginated response
    const items = Array.isArray(response.data) ? response.data : response.data.items || [];
    
    return items.map((item: any) => ({
        id: item.id || item.newsId || Date.now(),
        newsEng: item.newsEng || '',
        newsMrt: item.newsMrt || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
    }));
}

export async function createNewsService(payload: any) {
    const response = await createNews(payload);
    return response.data;
}

export async function updateNewsService(payload: any) {
    const response = await updateNews(payload);
    return response.data;
}
