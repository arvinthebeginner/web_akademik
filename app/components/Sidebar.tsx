'use client';

import { UserRole } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdClose } from 'react-icons/md';

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  { label: 'Dashboard', href: '/', roles: ['ADMIN', 'KEPALA_SEKOLAH', 'GURU', 'SISWA', 'ORANG_TUA'] },
  { label: 'Siswa', href: '/siswa', roles: ['ADMIN', 'GURU', 'KEPALA_SEKOLAH'] },
  { label: 'Guru', href: '/guru', roles: ['ADMIN', 'KEPALA_SEKOLAH'] },
  { label: 'Kelas', href: '/kelas', roles: ['ADMIN', 'GURU', 'KEPALA_SEKOLAH'] },
  { label: 'Nilai', href: '/nilai', roles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'] },
  { label: 'Absensi', href: '/absensi', roles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'] },
  { label: 'Pesan', href: '/pesan', roles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'] },
  { label: 'Laporan', href: '/laporan', roles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'] },
];

interface SidebarProps {
  userRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole = 'SISWA' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const filteredItems = navigationItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <MdClose size={24} /> : <GiHamburgerMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static left-0 top-0 h-screen w-64 bg-gray-900 text-white p-4 transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-400">Akademik</h1>
          <p className="text-sm text-gray-400">Manajemen Akademik</p>
        </div>

        <nav className="space-y-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
