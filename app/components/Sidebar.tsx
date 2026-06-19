'use client';

import { UserRole } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  icon: string;
}

const navigationItems: NavItem[] = [
  { label: 'Dashboard', href: '/', roles: ['ADMIN', 'KEPALA_SEKOLAH', 'GURU', 'SISWA', 'ORANG_TUA'], icon: 'dashboard' },
  { label: 'Siswa', href: '/siswa', roles: ['ADMIN', 'GURU', 'KEPALA_SEKOLAH'], icon: 'person' },
  { label: 'Guru', href: '/guru', roles: ['ADMIN', 'KEPALA_SEKOLAH'], icon: 'school' },
  { label: 'Kelas', href: '/kelas', roles: ['ADMIN', 'GURU', 'KEPALA_SEKOLAH'], icon: 'groups' },
  { label: 'Nilai', href: '/nilai', roles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'], icon: 'grade' },
  { label: 'Tugas', href: '/tugas', roles: ['ADMIN', 'GURU', 'SISWA'], icon: 'assignment' },
  { label: 'Absensi', href: '/absensi', roles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'], icon: 'event_available' },
  { label: 'Pesan', href: '/pesan', roles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'], icon: 'mail' },
  { label: 'Laporan', href: '/laporan', roles: ['ADMIN', 'GURU', 'SISWA', 'ORANG_TUA'], icon: 'assessment' },
  { label: 'Portal Orang Tua', href: '/portal-ortu', roles: ['ORANG_TUA'], icon: 'family_restroom' },
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
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-on-primary p-2 rounded-lg shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="material-symbols-outlined">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-sidebar-width bg-surface border-r border-surface-border flex flex-col py-stack-lg z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="px-container-padding pb-container-padding mb-2 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div>
              <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.01em] text-primary">
                School.id
              </h1>
              <p className="text-[12px] font-normal leading-[18px] text-on-surface-variant">
                System Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-primary font-bold bg-surface-container'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-[14px] font-semibold leading-[20px]">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="px-4 pt-4 mt-auto border-t border-surface-border space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[14px] font-semibold leading-[20px]">Settings</span>
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-error-container transition-colors duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-[14px] font-semibold leading-[20px]">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-on-surface/20 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
