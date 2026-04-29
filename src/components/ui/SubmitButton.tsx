'use client';

// React
import type { ButtonHTMLAttributes, ReactNode } from 'react';

// Constants
import { FORM_STYLES } from '@/constants/ui.constants';

// Utils
import { cn } from '@/utils/classnames';

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function SubmitButton({ children, className, type = 'submit', ...buttonProps }: SubmitButtonProps) {
  return (
    <button type={type} className={cn(FORM_STYLES.submitButton, className)} {...buttonProps}>
      {children}
    </button>
  );
}
