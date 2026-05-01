'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Constants
import { ROUTES } from '@/constants/routes.constants';

// UI components
import FormError from '@/components/ui/FormError';
import FormInput from '@/components/ui/FormInput';
import SubmitButton from '@/components/ui/SubmitButton';

// Hooks
import { useAuth } from '@/lib/useAuth';

// Utils
import { getErrorMessage } from '@/utils/api-error';
import { Button } from './button';

type ChangePasswordModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const { changePassword, logout } = useAuth();
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        let passwordChanged = false;
        try {
            setIsSubmitting(true);
            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });
            passwordChanged = true;
            onClose();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (caughtError) {
            const errorMessage = getErrorMessage(caughtError, 'Unable to change password. Please try again.');
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }

        if (passwordChanged) {
            try {
                await logout();
            } catch {
                // Ignore logout failures after successful password change.
            }
            try {
                router.replace(ROUTES.login);
            } catch {
                // Ignore navigation failures after logout.
            }
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-slate-950">Change Password</h2>
                    <p className="mt-1 text-sm text-slate-600">Enter your current password and choose a new one.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        id="currentPassword"
                        type="password"
                        label="Current Password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    <FormInput
                        id="newPassword"
                        type="password"
                        label="New Password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                    />

                    <FormInput
                        id="confirmPassword"
                        type="password"
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        autoComplete="new-password"
                        required
                    />

                    <FormError message={error} />

                    <div className="flex gap-3 w-full">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-10 text-black"
                            variant='outline'
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="flex-1 h-10 bg-[#fcd62e]! text-slate-950 hover:bg-yellow-300! hover:cursor-pointer! disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isSubmitting ? 'Changing...' : 'Change Password'}
                        </Button>

                        {/* <SubmitButton
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 h-10"
                        >
                            {isSubmitting ? 'Changing...' : 'Change Password'}
                        </SubmitButton> */}
                    </div>
                </form>
            </div>
        </div>
    );
}