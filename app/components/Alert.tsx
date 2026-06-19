'use client';

import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const typeStyles = {
    success: 'bg-success/10 text-success border-success/20',
    error: 'bg-error-container text-on-error-container border-error/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    info: 'bg-secondary/10 text-secondary border-secondary/20',
  };

  const iconMap = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 flex items-center gap-3 ${typeStyles[type]}`}
    >
      <span className="material-symbols-outlined text-[20px] shrink-0">
        {iconMap[type]}
      </span>
      <span className="flex-1 text-[14px] leading-[20px]">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  );
};
