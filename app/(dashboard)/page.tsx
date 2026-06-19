'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

interface DashboardStats {
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  activeSemester?: string;
  averageGrade?: number;
  attendanceToday?: string;
  classesTaught?: number;
  pendingGrading?: number;
  averageGradeClass?: number;
  gpa?: string;
  attendanceRate?: string;
  pendingAssignments?: number;
  childGrades?: string;
  teacherMessages?: number;
  sppStatus?: string;
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

          // Fetch statistics
          const statsResponse = await fetch('/api/reports');
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user or stats:', error);
      }
    };

    fetchUserData();
  }, []);

  const getDashboardContent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'ADMIN':
        return <AdminDashboard stats={stats} />;
      case 'KEPALA_SEKOLAH':
        return <KepalaSekolahDashboard stats={stats} />;
      case 'GURU':
        return <GuruDashboard stats={stats} />;
      case 'SISWA':
        return <SiswaDashboard stats={stats} />;
      case 'ORANG_TUA':
        return <OrangTuaDashboard stats={stats} />;
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

function AdminDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Siswa"
        value={stats.totalStudents ?? '...'}
        icon="👥"
        color="bg-blue-500"
      />
      <StatCard
        title="Total Guru"
        value={stats.totalTeachers ?? '...'}
        icon="👨‍🏫"
        color="bg-green-500"
      />
      <StatCard
        title="Total Kelas"
        value={stats.totalClasses ?? '...'}
        icon="🏫"
        color="bg-purple-500"
      />
      <StatCard
        title="Semester Aktif"
        value={stats.activeSemester ?? '...'}
        icon="📅"
        color="bg-orange-500"
      />
    </div>
  );
}

function KepalaSekolahDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Siswa"
        value={stats.totalStudents ?? '...'}
        icon="👥"
        color="bg-blue-500"
      />
      <StatCard
        title="Total Guru"
        value={stats.totalTeachers ?? '...'}
        icon="👨‍🏫"
        color="bg-green-500"
      />
      <StatCard
        title="Rata-rata Nilai"
        value={stats.averageGrade ?? '...'}
        icon="📊"
        color="bg-purple-500"
      />
      <StatCard
        title="Absensi Hari Ini"
        value={stats.attendanceToday ?? '...'}
        icon="✅"
        color="bg-orange-500"
      />
    </div>
  );
}

function GuruDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Kelas Diajar"
        value={stats.classesTaught ?? '...'}
        icon="📚"
        color="bg-blue-500"
      />
      <StatCard
        title="Total Siswa"
        value={stats.totalStudents ?? '...'}
        icon="👥"
        color="bg-green-500"
      />
      <StatCard
        title="Tugas Belum Dinilai"
        value={stats.pendingGrading ?? '...'}
        icon="📝"
        color="bg-red-500"
      />
      <StatCard
        title="Rata-rata Nilai Kelas"
        value={stats.averageGradeClass ?? '...'}
        icon="📊"
        color="bg-purple-500"
      />
    </div>
  );
}

function SiswaDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="GPA"
        value={stats.gpa ?? '...'}
        icon="⭐"
        color="bg-blue-500"
      />
      <StatCard
        title="Kehadiran"
        value={stats.attendanceRate ?? '...'}
        icon="✅"
        color="bg-green-500"
      />
      <StatCard
        title="Tugas Tertunda"
        value={stats.pendingAssignments ?? '...'}
        icon="📝"
        color="bg-orange-500"
      />
      <StatCard
        title="Rata-rata Nilai"
        value={stats.averageGrade ?? '...'}
        icon="📊"
        color="bg-purple-500"
      />
    </div>
  );
}

function OrangTuaDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Nilai Anak"
        value={stats.childGrades ?? '...'}
        icon="📊"
        color="bg-blue-500"
      />
      <StatCard
        title="Kehadiran"
        value={stats.attendanceRate ?? '...'}
        icon="✅"
        color="bg-green-500"
      />
      <StatCard
        title="Pesan Guru"
        value={stats.teacherMessages ?? '...'}
        icon="💬"
        color="bg-orange-500"
      />
      <StatCard
        title="Status SPP"
        value={stats.sppStatus ?? '...'}
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
