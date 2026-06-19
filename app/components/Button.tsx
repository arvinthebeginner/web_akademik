'use client';

import { cn } from '@/lib/helpers';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2';

    const variantStyles = {
      primary:
        'bg-primary text-on-primary hover:bg-primary-container focus:ring-primary shadow-sm',
      secondary:
        'bg-transparent text-secondary border border-secondary hover:bg-secondary/5 focus:ring-secondary',
      danger:
        'bg-danger text-white hover:bg-danger/90 focus:ring-danger shadow-sm',
      ghost:
        'bg-transparent text-on-surface-variant hover:bg-surface-border/50 focus:ring-surface-border',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-[12px] leading-[16px]',
      md: 'px-4 py-2 text-[14px] leading-[20px]',
      lg: 'px-6 py-2.5 text-[16px] leading-[24px]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
