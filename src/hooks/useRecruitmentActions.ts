// hooks/useRecruitmentActions.ts

import { publishVacancy, uploadNoticePdf } from "@/actions/api/vacancy.actions";
import { getErrorMessage } from "@/utils/api-error";
import { useState } from "react";
import { toast } from "sonner";

export function useRecruitmentActions(loadRecruitments: () => Promise<void>) {
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const publish = async (id: number) => {
    setPublishingId(id);

    try {
      await publishVacancy(id);
      await loadRecruitments();
      toast.success('Notice pdf published successfully');
    } catch (e) {
      toast.error(getErrorMessage(e, 'Notice pdf publish failed'));
    } finally {
      setPublishingId(null);
    }
  };

  const upload = async () => {
    if (!file || !uploadId) return;

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('VacancyId', String(uploadId));
      fd.append('File', file);

      await uploadNoticePdf(fd);
      await loadRecruitments();
      toast.success('Notice PDF uploaded successfully');
    } catch (e) {
      setError(getErrorMessage(e, 'Notice PDF upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return {
    publishingId,
    uploadId,
    setUploadId,
    file,
    setFile,
    uploading,
    error,
    publish,
    upload,
  };
}