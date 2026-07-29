/* eslint-disable @typescript-eslint/no-explicit-any */
import { createVacancy, getVacancies, updateVacancy, deleteVacancy } from "./vacancy.actions";
import { formatApiBank, formatApiRecruitment, getBankItems, getVacancyItems } from "@/utils/adminDashboardHelper";
import { createBank, getBanks, updateBank, deleteBank } from "./bank.actions";
import { createNews, updateNews, getNews, deleteNews } from "./news.actions";
import { createCategory, updateCategory, deleteCategory } from './category.actions';
import { createAuthor, updateAuthor, deleteAuthor } from './author.actions';
import { createBook, getBooks, updateBook, deleteBook } from './books.actions';

export async function fetchBanksService() {
    const response = await getBanks();
    return getBankItems(response.data).map(formatApiBank);
}

export async function fetchRecruitmentsService() {
    const response = await getVacancies();
    return getVacancyItems(response.data).map(formatApiRecruitment);
}

export async function fetchNewsService() {
    const response = await getNews();
    const items = Array.isArray(response.data) ? response.data : response.data.items || [];
    return items.map((item: any) => ({
        id: item.id || item.newsId || Date.now(),
        newsEng: item.newsEng || '',
        newsMrt: item.newsMrt || '',
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
    }));
}

export async function fetchBooksService(page = 1, pageSize = 50) {
    const response = await getBooks(page, pageSize);
    return Array.isArray(response.data) ? response.data : response.data.items;
}

export async function createBankService(payload: any) {
    const response = await createBank(payload);
    return response.data;
}

export async function updateBankService(payload: any) {
    return updateBank(payload);
}

export async function deleteBankService(bankId: number) {
    return deleteBank(bankId);
}

export async function createCategoryService(payload: any) {
    const response = await createCategory(payload);
    return response.data;
}

export async function updateCategoryService(payload: any) {
    return updateCategory(payload);
}

export async function deleteCategoryService(categoryId: number) {
    return deleteCategory(categoryId);
}

export async function createAuthorService(payload: any) {
    const response = await createAuthor(payload);
    return response.data;
}

export async function updateAuthorService(payload: any) {
    return updateAuthor(payload);
}

export async function deleteAuthorService(authorId: number) {
    return deleteAuthor(authorId);
}

export async function createBookService(formData: FormData) {
    const response = await createBook(formData as any);
    return response.data;
}

export async function updateBookService(formData: FormData) {
    const response = await updateBook(formData as any);
    return response.data;
}

export async function deleteBookService(bookId: number) {
    return deleteBook(bookId);
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

export async function deleteRecruitmentService(recruitmentId: number) {
    return deleteVacancy(recruitmentId);
}

export async function createNewsService(payload: any) {
    const response = await createNews(payload);
    return response.data;
}

export async function updateNewsService(payload: any) {
    const response = await updateNews(payload);
    return response.data;
}

export async function deleteNewsService(newsId: number) {
    return deleteNews(newsId);
}
