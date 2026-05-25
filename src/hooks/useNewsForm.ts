/* eslint-disable @typescript-eslint/no-explicit-any */
import { createNewsService, updateNewsService } from "@/actions/api/admin.actions";
import { ADMIN_DASHBOARD_MESSAGES } from "@/app/admin/dashboard/messages";
import { emptyNewsForm } from "@/constants/adminDashboard";
import { STORAGE_KEYS } from "@/constants/storage.constants";
import { createNewsSchema } from "@/schemas/news.schema";
import { AdminNews, NewsFormErrors } from "@/types/adminDashboard";
import { translateToMarathi } from "@/utils/translation";
import { writeStoredList } from "@/utils/adminDashboardHelper";
import { getZodFieldErrors } from "@/utils/validation";
import { useState } from "react";
import { toast } from "sonner";

export function useNewsForm(news: AdminNews[], setNews: any) {
    const [form, setForm] = useState(emptyNewsForm);
    const [errors, setErrors] = useState<NewsFormErrors>({});
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const autoTranslate = async () => {
        if (!form.newsEng.trim()) {
            toast.error('Please enter English text first');
            return;
        }

        setIsTranslating(true);
        try {
            const translated = await translateToMarathi(form.newsEng);
            setForm(prev => ({ ...prev, newsMrt: translated }));
            toast.success('Translation suggestion provided. Please review and edit if needed.');
        } catch (error) {
            toast.error('Translation failed. Please enter Marathi text manually.');
            console.error('Translation error:', error);
        } finally {
            setIsTranslating(false);
        }
    };

    const startEdit = (item: AdminNews) => {
        setEditingId(item.id);
        setForm({
            newsEng: item.newsEng,
            newsMrt: item.newsMrt,
        });
        setMessage('');
        setErrors({});
    };

    const clearForm = () => {
        setForm(emptyNewsForm);
        setEditingId(null);
        setMessage('');
        setErrors({});
    };

    const submit = async () => {
        setMessage('');

        const parsed = createNewsSchema.safeParse(form);

        if (!parsed.success) {
            setErrors(getZodFieldErrors(parsed.error));
            toast.error(ADMIN_DASHBOARD_MESSAGES.news.validationError);
            return;
        }

        setErrors({});
        setIsSaving(true);

        try {
            if (editingId) {
                // Update existing news
                await updateNewsService({
                    id: editingId,
                    ...parsed.data,
                });
                
                setMessage('News updated successfully.');
                toast.success('News updated successfully.');
                
                // Update local state
                const updatedNews = news.map(item => 
                    item.id === editingId 
                        ? { ...item, ...parsed.data, updatedAt: new Date().toISOString() }
                        : item
                );
                setNews(updatedNews);
                writeStoredList(STORAGE_KEYS.adminNews, updatedNews);
            } else {
                // Create new news
                const localNews: AdminNews = {
                    id: Date.now(),
                    ...parsed.data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                const data = await createNewsService(parsed.data);
                localNews.id = data.id || data.newsId || localNews.id;

                setMessage(ADMIN_DASHBOARD_MESSAGES.news.saveSuccess);
                toast.success(ADMIN_DASHBOARD_MESSAGES.news.saveSuccess);

                const next = [localNews, ...news];
                setNews(next);
                writeStoredList(STORAGE_KEYS.adminNews, next);
            }
        } catch (error) {
            setMessage(editingId 
                ? 'Failed to update news.' 
                : ADMIN_DASHBOARD_MESSAGES.news.localSaveFallback
            );
            toast.error(editingId ? 'Failed to update news.' : ADMIN_DASHBOARD_MESSAGES.news.saveFailed);
        } finally {
            clearForm();
            setIsSaving(false);
        }
    };

    return { form, setForm, errors, message, isSaving, isTranslating, submit, autoTranslate, editingId, startEdit, clearForm };
}
