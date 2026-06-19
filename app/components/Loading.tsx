'use client';

import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-surface-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-surface-border border-t-secondary rounded-full animate-spin" />
        <p className="text-[14px] text-on-surface-variant">Memuat data...</p>
      </div>
    </div>
  );
};
