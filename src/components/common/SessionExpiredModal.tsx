'use client';

import { ShieldAlert } from 'lucide-react';

interface Props {
    open: boolean;
    onLogin: () => void;
}

export default function SessionExpiredModal({
    open,
    onLogin,
}: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex flex-col items-center px-6 pt-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                        <ShieldAlert className="h-8 w-8 text-amber-600" />
                    </div>

                    <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
                        Session Expired
                    </h2>

                    <p className="mt-3 text-center text-sm leading-6 text-slate-600">
                        For security reasons, your session has expired due to inactivity.
                        Please sign in again to continue using the portal.
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-8 border-t border-slate-100 px-6 py-5">
                    <button
                        onClick={onLogin}
                        className="h-11 w-full rounded-lg bg-violet-700 text-sm font-medium text-white transition hover:bg-violet-800"
                    >
                        Go to Login
                    </button>

                    <p className="mt-4 text-center text-xs text-slate-400">
                        KOP Bank Association Portal
                    </p>
                </div>
            </div>
        </div>
    );
}