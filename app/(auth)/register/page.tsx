'use client';

import { Alert, Button } from '@/components';
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
  const [showPassword, setShowPassword] = useState(false);

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

  const inputBase = "block w-full pl-10 pr-3 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow";
  const labelBase = "block text-[12px] font-semibold leading-[16px] text-on-surface";

  return (
    <div className="flex w-full min-h-screen bg-surface-background">
      {/* Left Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-container-high overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/80 z-10 mix-blend-multiply"></div>
        <Image
          src="https://plus.unsplash.com/premium_photo-1680157071110-d7f5b00708f6?q=80&w=682&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
            Bergabung Bersama School.id
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
              School.id
            </h2>
            <p className="text-[14px] leading-[20px] text-on-surface-variant">
              Daftar Akun Baru — Sistem Manajemen Akademik
            </p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div className="space-y-2">
              <label className={labelBase}>Nama Lengkap</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">person</span>
                </div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Masukkan nama lengkap" className={inputBase} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className={labelBase}>Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="nama@institusi.ac.id" className={inputBase} />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className={labelBase}>Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">badge</span>
                </div>
                <select name="role" value={formData.role} onChange={handleChange} className="block w-full pl-10 pr-8 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow appearance-none">
                  <option value="SISWA">Siswa</option>
                  <option value="GURU">Guru</option>
                  <option value="ORANG_TUA">Orang Tua</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[18px]">expand_more</span>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className={labelBase}>Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                </div>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required placeholder="Minimal 6 karakter" className={`${inputBase} pr-10`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface focus:outline-none">
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-2">
              <label className={labelBase}>Konfirmasi Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">lock_reset</span>
                </div>
                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Konfirmasi password" className={inputBase} />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-2.5"
              loading={loading}
              disabled={loading}
            >
              Daftar Sekarang
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
