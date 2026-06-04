// UI Components
import React from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

// Utils
import { REGEXP_ONLY_DIGITS } from 'input-otp';

interface OtpInputControllerProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function OtpInputController({
  value,
  onChange,
  onKeyDown,
  disabled = false,
  maxLength = 6,
  autoFocus = true,
  className = '',
  ariaLabel = 'OTP Input',
}: OtpInputControllerProps) {
  return (
    <InputOTP
      maxLength={maxLength}
      pattern={REGEXP_ONLY_DIGITS}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <InputOTPGroup
        className={`flex w-full flex-wrap justify-center gap-2 md:flex-nowrap ${className}`}
      >
        {Array.from({ length: maxLength }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            autoFocus={autoFocus && index === 0}
            onKeyDown={onKeyDown}
            className="
              h-11
              w-10
              rounded-md
              border
              border-slate-300
              text-base
              shadow-sm
              transition-colors
              focus:border-emerald-600
            "
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}