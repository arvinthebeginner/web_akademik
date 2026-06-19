'use client';

import { Header, Sidebar, Loading } from '@/components';
import { User, UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-screen bg-surface-background">
      <Sidebar userRole={user.role as UserRole} />
      <div className="flex-1 ml-sidebar-width min-h-screen flex flex-col">
        <Header user={user} />
        <main className="flex-1 mt-header-height p-container-padding pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
