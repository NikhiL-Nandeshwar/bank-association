'use client';

// React
import { InputHTMLAttributes, ReactNode } from 'react';

// Utils
import { cn } from '@/utils/classnames';

// Constants
import { FORM_STYLES } from '@/constants/ui.constants';

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
};

export default function FormInput({
  id,
  label,
  error,
  className,
  rightIcon,
  onRightIconClick,
  ...props
}: FormInputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className={FORM_STYLES.label}>
          {label}
        </label>
      )}

      <div className="relative mt-2">
        <input
          id={id}
          className={cn(
            FORM_STYLES.input,
            rightIcon ? 'pr-10' : undefined,
            error && FORM_STYLES.inputInvalid,
            className
          )}
          {...props}
        />

        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute inset-y-0 right-2 top-1.5 flex items-center text-slate-500 hover:text-slate-800"
          >
            {rightIcon}
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}