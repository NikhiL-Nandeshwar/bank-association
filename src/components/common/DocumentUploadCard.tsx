import { useEffect, useMemo, useState } from "react";
import { ExistingDocument } from "../recruitment/helper/applicationStepsHelper";
import { toast } from "sonner";
import { CheckCircle2, FileText, Trash2, Upload } from "lucide-react";
import { getAuthToken } from "@/lib/auth-storage";

async function getAuthenticatedFileUrl(
    fileUrl: string,
): Promise<string> {
    const token = getAuthToken();

    const response = await fetch(fileUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to load file');
    }

    const blob = await response.blob();

    return URL.createObjectURL(blob);
}

export function DocumentUploadCard({
    label,
    file,
    existingDocument,
    onChange,
    required = false,
}: {
    label: string;
    file: File | null;
    existingDocument?: ExistingDocument;
    onChange: (file: File | null) => void;
    required?: boolean;
}) {

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const MAX_FILE_SIZE = 2 * 1024 * 1024;

    const selectedFilePreview = useMemo(() => {
        if (!file || !file.type.startsWith('image/')) {
            return null;
        }

        return URL.createObjectURL(file);
    }, [file]);

    useEffect(() => {
        return () => {
            if (selectedFilePreview) {
                URL.revokeObjectURL(selectedFilePreview);
            }
        };
    }, [selectedFilePreview]);

    const imagePreview =
        selectedFilePreview || previewUrl;

    const isWidePreview =
        label === 'Signature'

    useEffect(() => {
        if (!existingDocument?.fileUrl) {
            return;
        }

        let mounted = true;

        getAuthenticatedFileUrl(existingDocument.fileUrl)
            .then((url) => {
                if (mounted) {
                    setPreviewUrl(url);
                }
            })
            .catch(console.error);

        return () => {
            mounted = false;
        };
    }, [existingDocument?.fileUrl]);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error('File size must not exceed 2 MB');
            return;
        }

        onChange(selectedFile);
    };

    // Replace handleViewDocument:
    const handleViewDocument = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!existingDocument?.fileUrl) return;

        try {
            const url = await getAuthenticatedFileUrl(existingDocument.fileUrl);
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // Revoke after a short delay to let the tab open
            setTimeout(() => URL.revokeObjectURL(url), 10_000);
        } catch {
            alert('Unable to open document.');
        }
    };

    return (
        <div
            className={`
        rounded-2xl border-2 border-dashed p-5 transition-all
       ${file || existingDocument
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                }
      `}
        >
            <label className="flex cursor-pointer flex-col items-center text-center">
                <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.avif,.pdf"
                    onChange={handleFileChange}
                />

                {file ? (
                    <>
                        <div
                            className={`mb-3 flex items-center justify-center overflow-hidden rounded-lg border bg-white ${isWidePreview
                                ? 'h-20 w-full'
                                : 'h-24 w-24'
                                }`}>
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt={label}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <FileText className="h-10 w-10 text-slate-500" />
                            )}
                        </div>

                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    Ready to Upload
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onChange(null);
                                }}
                                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                                <Trash2 className="h-3 w-3" />
                                Remove
                            </button>
                        </div>

                        <p className="font-medium text-slate-800">
                            {label}
                            {required && (
                                <span className="ml-1 text-rose-500">*</span>
                            )}
                        </p>

                        <p
                            className="mt-2 max-w-full truncate text-xs text-slate-600"
                            title={file.name}
                        >
                            {file.name}
                        </p>

                        <span className="mt-2 text-xs text-slate-500">
                            Selected file will be uploaded on next step
                        </span>
                    </>
                ) : existingDocument ? (
                    <>
                        <div
                            className={`mb-3 flex items-center justify-center overflow-hidden rounded-lg border bg-white ${isWidePreview
                                ? 'h-20 w-full'
                                : 'h-24 w-24'
                                }`}>
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt={label}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <FileText className="h-10 w-10 text-slate-500" />
                            )}
                        </div>

                        <div className="mb-2 flex items-center gap-1 text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Already Uploaded
                            </span>
                        </div>

                        <p className="font-medium text-slate-800">
                            {label}
                            {required && (
                                <span className="ml-1 text-rose-500">*</span>
                            )}
                        </p>

                        <p
                            className="mt-2 max-w-full truncate text-xs text-slate-600"
                            title={existingDocument.documentName}
                        >
                            {existingDocument.documentName}
                        </p>

                        <button
                            type="button"
                            onClick={handleViewDocument}
                            className="mt-2 text-xs font-medium text-blue-600 underline"
                        >
                            View Document
                        </button>

                        <span className="mt-2 text-xs text-slate-500">
                            Click to replace document
                        </span>
                    </>
                ) : (
                    <>
                        <Upload className="mb-3 h-10 w-10 text-slate-400" />

                        <p className="font-medium text-slate-800">
                            {label}
                            {required && (
                                <span className="ml-1 text-rose-500">*</span>
                            )}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                            Click to upload document
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            JPG, PNG, PDF (Max 2 MB)
                        </p>
                    </>
                )}
            </label>
        </div>
    );
}