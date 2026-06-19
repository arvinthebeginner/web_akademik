'use client';

import { User } from '@/types';
import React from 'react';
import { getInitials } from '@/lib/helpers';

interface HeaderProps {
  user?: User;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="fixed top-0 right-0 h-header-height z-30 bg-surface border-b border-surface-border flex justify-between items-center px-container-padding"
      style={{ width: 'calc(100% - 240px)' }}
    >
      {/* Left: Search */}
      <div className="flex-1 flex items-center">
        <div className="relative w-64 hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-surface-background border border-surface-border rounded-lg text-[12px] leading-[18px] text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
            placeholder="Cari data..."
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-surface-border">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[12px] font-semibold">
              {getInitials(user.name)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[12px] font-semibold leading-[16px] text-primary">
                {user.name}
              </span>
              <span className="text-[12px] leading-[18px] text-on-surface-variant">
                {user.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
