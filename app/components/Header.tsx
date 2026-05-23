'use client';

import { User } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FiLogOut } from 'react-icons/fi';
import { getInitials } from '@/lib/helpers';

interface HeaderProps {
  user?: User;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              {getInitials(user.name)}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800 p-2"
          title="Logout"
        >
          <FiLogOut size={20} />
        </button>
      </div>
    </header>
  );
};
