'use client';

import { cn } from '@/lib/helpers';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[12px] font-semibold leading-[16px] text-on-surface mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface placeholder-outline transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            error
              ? 'border-danger focus:ring-danger focus:border-danger'
              : 'border-surface-border hover:border-outline',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[12px] text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
