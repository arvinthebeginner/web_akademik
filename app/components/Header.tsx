'use client';

import { User } from '@/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getInitials } from '@/lib/helpers';

interface HeaderProps {
  user?: User;
}

interface NotificationItem {
  id: string;
  type: 'message' | 'announcement';
  title: string;
  preview: string;
  time: string;
  read: boolean;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setNotifLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifItems(data.data?.items || []);
        setUnreadCount(data.data?.unreadCount || 0);
      }
    } catch { /* skip */ }
    finally { setNotifLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

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
        {/* Notification Bell + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadNotifications(); }}
            className="text-on-surface-variant hover:text-primary transition-colors relative p-2 rounded-full hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[360px] bg-surface-container-lowest border border-surface-border rounded-xl shadow-lg overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
                <h3 className="text-[14px] font-semibold text-on-surface">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">
                    {unreadCount} baru
                  </span>
                )}
              </div>

              {/* Items */}
              <div className="max-h-[360px] overflow-y-auto divide-y divide-surface-border">
                {notifLoading && notifItems.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-surface-border border-t-primary rounded-full animate-spin" />
                  </div>
                ) : notifItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_off</span>
                    <p className="text-[12px] text-on-surface-variant">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  notifItems.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer flex gap-3 ${!item.read ? 'bg-primary-container/5' : ''}`}
                      onClick={() => {
                        if (item.type === 'message') {
                          window.location.href = '/pesan';
                        }
                        setNotifOpen(false);
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === 'message'
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}>
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {item.type === 'message' ? 'mail' : 'campaign'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[12px] leading-[16px] truncate ${!item.read ? 'font-bold text-on-surface' : 'font-semibold text-on-surface'}`}>
                            {item.title}
                          </span>
                          {!item.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="text-[11px] leading-[16px] text-on-surface-variant mt-0.5 truncate">{item.preview}</p>
                        <span className="text-[10px] text-on-surface-variant mt-1 block">{timeAgo(item.time)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-surface-border text-center">
                <button
                  onClick={() => { window.location.href = '/pesan'; setNotifOpen(false); }}
                  className="text-[12px] font-semibold text-primary hover:text-on-primary-fixed-variant transition-colors"
                >
                  Lihat Semua Pesan
                </button>
              </div>
            </div>
          )}
        </div>

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
