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
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar userRole={user.role as UserRole} />
        <div className="flex-1 md:ml-0">
          <Header user={user} />
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
