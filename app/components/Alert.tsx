'use client';

import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const typeStyles = {
    success: 'bg-green-100 text-green-800 border-green-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  return (
    <div
      className={`border rounded-lg p-4 mb-4 ${typeStyles[type]} flex justify-between items-center`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg font-bold cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  );
};
