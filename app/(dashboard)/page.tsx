'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  averageGrade?: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUserData();
  }, []);

  const getDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'KEPALA_SEKOLAH':
        return <KepalaSekolahDashboard />;
      case 'GURU':
        return <GuruDashboard />;
      case 'SISWA':
        return <SiswaDashboard />;
      case 'ORANG_TUA':
        return <OrangTuaDashboard />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Dashboard {user && `- ${user.name}`}
      </h1>

      {getDashboardContent()}
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Siswa"
        value="150"
        icon="👥"
        color="bg-blue-500"
      />
      <StatCard
        title="Total Guru"
        value="25"
        icon="👨‍🏫"
        color="bg-green-500"
      />
      <StatCard
        title="Total Kelas"
        value="12"
        icon="🏫"
        color="bg-purple-500"
      />
      <StatCard
        title="Semester Aktif"
        value="2024/2025 - Sem 1"
        icon="📅"
        color="bg-orange-500"
      />
    </div>
  );
}

function KepalaSekolahDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Siswa"
        value="150"
        icon="👥"
        color="bg-blue-500"
      />
      <StatCard
        title="Total Guru"
        value="25"
        icon="👨‍🏫"
        color="bg-green-500"
      />
      <StatCard
        title="Rata-rata Nilai"
        value="78.5"
        icon="📊"
        color="bg-purple-500"
      />
      <StatCard
        title="Absensi Hari Ini"
        value="95%"
        icon="✅"
        color="bg-orange-500"
      />
    </div>
  );
}

function GuruDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Kelas Diajar"
        value="5"
        icon="📚"
        color="bg-blue-500"
      />
      <StatCard
        title="Total Siswa"
        value="125"
        icon="👥"
        color="bg-green-500"
      />
      <StatCard
        title="Tugas Belum Dinilai"
        value="8"
        icon="📝"
        color="bg-red-500"
      />
      <StatCard
        title="Rata-rata Nilai Kelas"
        value="79.3"
        icon="📊"
        color="bg-purple-500"
      />
    </div>
  );
}

function SiswaDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="GPA"
        value="3.75"
        icon="⭐"
        color="bg-blue-500"
      />
      <StatCard
        title="Kehadiran"
        value="96%"
        icon="✅"
        color="bg-green-500"
      />
      <StatCard
        title="Tugas Tertunda"
        value="2"
        icon="📝"
        color="bg-orange-500"
      />
      <StatCard
        title="Rata-rata Nilai"
        value="85"
        icon="📊"
        color="bg-purple-500"
      />
    </div>
  );
}

function OrangTuaDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Nilai Anak"
        value="Baik"
        icon="📊"
        color="bg-blue-500"
      />
      <StatCard
        title="Kehadiran"
        value="95%"
        icon="✅"
        color="bg-green-500"
      />
      <StatCard
        title="Pesan Guru"
        value="3"
        icon="💬"
        color="bg-orange-500"
      />
      <StatCard
        title="Status SPP"
        value="Lunas"
        icon="💰"
        color="bg-purple-500"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        <div className={`${color} text-white text-4xl p-4 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
