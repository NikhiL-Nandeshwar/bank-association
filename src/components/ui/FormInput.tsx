'use client';

// React
import type { InputHTMLAttributes } from 'react';

// Constants
import { FORM_STYLES } from '@/constants/ui.constants';

// Utils
import { cn } from '@/utils/classnames';

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label: string;
};

export default function FormInput({ error, id, label, className, ...inputProps }: FormInputProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className={FORM_STYLES.label}>{label}</span>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(FORM_STYLES.input, error && FORM_STYLES.inputInvalid, className)}
        {...inputProps}
      />
      {error ? (
        <span id={`${id}-error`} className="mt-1 block text-sm text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
