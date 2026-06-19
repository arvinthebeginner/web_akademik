'use client';

import { Alert, Button, Input } from '@/components';
import Image from 'next/image';
import { apiPost } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SISWA',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak sama');
      return;
    }

    setLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = formData;
      const response = await apiPost('/api/auth/register', registerData) as { success: boolean; error?: string };

      if (response.success) {
        router.push('/login?registered=true');
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80"
          alt="Academic Campus"
          fill
          className="absolute inset-0 w-full h-full object-cover z-0"
          unoptimized
          priority
        />
        <div className="relative z-20 p-12 text-center text-on-primary">
          <span className="material-symbols-outlined icon-fill text-6xl mb-6">how_to_reg</span>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-primary mb-4">
            Bergabung Bersama Kami
          </h1>
          <p className="text-[16px] leading-[24px] text-primary-fixed-dim max-w-md mx-auto">
            Daftarkan diri Anda dan mulai akses sistem akademik terpadu untuk pengalaman belajar yang lebih baik.
          </p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-surface-background">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-surface-border p-8 sm:p-10 shadow-sm relative z-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-surface-container mb-4">
              <span className="material-symbols-outlined icon-fill text-primary text-2xl">account_balance</span>
            </div>
            <h2 className="text-[24px] font-semibold leading-[32px] tracking-[-0.01em] text-primary mb-2">
              Daftar Akun Baru
            </h2>
            <p className="text-[14px] leading-[20px] text-on-surface-variant">
              Sistem Manajemen Akademik
            </p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nama Lengkap"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@institusi.ac.id"
              required
            />

            <div className="w-full">
              <label className="block text-[12px] font-semibold leading-[16px] text-on-surface mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="SISWA">Siswa</option>
                <option value="GURU">Guru</option>
                <option value="ORANG_TUA">Orang Tua</option>
              </select>
            </div>

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              required
            />

            <Input
              label="Konfirmasi Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Konfirmasi password"
              required
            />

            <Button
              type="submit"
              className="w-full py-2.5"
              loading={loading}
              disabled={loading}
            >
              Daftar
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-[12px] leading-[18px] text-on-surface-variant">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="text-[12px] font-semibold text-secondary hover:text-primary transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
