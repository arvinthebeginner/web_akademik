'use client';

import { Alert, Button, Input } from '@/components';
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const { confirmPassword, ...registerData } = formData;
      const response = await apiPost('/api/auth/register', registerData);

      if (response.success) {
        // Redirect to login
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">Akademik</h1>
            <p className="text-gray-600 mt-2">Daftar Akun Baru</p>
          </div>

          {error && (
            <Alert type="error" message={error} onClose={() => setError('')} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Masukkan email Anda"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Daftar
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
