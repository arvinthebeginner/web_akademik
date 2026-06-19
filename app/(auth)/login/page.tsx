'use client';

import { Alert, Button } from '@/components';
import Image from 'next/image';
import { apiPost } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiPost('/api/auth/login', formData) as { success: boolean; error?: string };
      if (response.success) {
        router.push('/');
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-surface-background">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-high overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/80 z-10 mix-blend-multiply"></div>
        <Image
          src="https://images.unsplash.com/photo-1498243691581-b145c3f5b06a?w=1200&q=80"
          alt="Academic Campus"
          fill
          className="absolute inset-0 w-full h-full object-cover z-0"
          unoptimized
          priority
          sizes="(min-width: 1024px) 50vw, 0px"
        />
        <div className="relative z-20 p-12 text-center text-on-primary">
          <span className="material-symbols-outlined icon-fill text-6xl mb-6">school</span>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-primary mb-4">
            Masa Depan Dimulai di Sini
          </h1>
          <p className="text-[16px] leading-[24px] text-primary-fixed-dim max-w-md mx-auto">
            Sistem manajemen terpadu yang memudahkan administrasi akademik, menghemat waktu, dan meningkatkan efisiensi institusi pendidikan Anda.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface-background">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-surface-border p-8 sm:p-10 shadow-sm relative z-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container mb-4">
              <span className="material-symbols-outlined icon-fill text-primary text-2xl">account_balance</span>
            </div>
            <h2 className="text-[24px] font-semibold leading-[32px] tracking-[-0.01em] text-primary mb-2">
              School.id
            </h2>
            <p className="text-[14px] leading-[20px] text-on-surface-variant">
              Sistem Manajemen Akademik
            </p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-[12px] font-semibold leading-[16px] text-on-surface">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="nama@institusi.ac.id"
                  className="block w-full pl-10 pr-3 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-[12px] font-semibold leading-[16px] text-on-surface">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-2.5"
              loading={loading}
              disabled={loading}
            >
              Masuk ke Sistem
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-[12px] leading-[18px] text-on-surface-variant">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="text-[12px] font-semibold text-secondary hover:text-primary transition-colors"
              >
                Daftar di sini
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-surface-container-low rounded-lg text-[12px] text-on-surface-variant border border-surface-border">
            <p className="font-semibold text-on-surface mb-2">Demo Credentials:</p>
            <p className="font-mono bg-surface-container-lowest px-2 py-1 rounded inline-block mb-1 border border-surface-border">admin@test.com</p><br/>
            <p className="font-mono bg-surface-container-lowest px-2 py-1 rounded inline-block border border-surface-border">password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
