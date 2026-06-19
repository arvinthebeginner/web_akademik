'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

/* ── Types ──────────────────────────────────────────────── */

interface GradeDistItem { grade: string; count: number }
interface AttendanceDistItem { status: string; count: number }
interface SubjectAvgItem { subject: string; average: number }
interface StudentsPerClassItem { className: string; count: number }
interface SubjectGradeItem { subject: string; score: number }

interface ClassAvgItem { className: string; average: number }

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
  // Chart data
  gradeDistribution?: GradeDistItem[];
  attendanceDistribution?: AttendanceDistItem[];
  subjectAverages?: SubjectAvgItem[];
  studentsPerClass?: StudentsPerClassItem[];
  subjectGrades?: SubjectGradeItem[];
  attendanceBreakdown?: AttendanceDistItem[];
  classAverages?: ClassAvgItem[];
  // Guru dashboard data
  schedule?: unknown;
  pendingItems?: unknown;
  messages?: unknown;
  attendance?: unknown;
  unreadCount?: number;
  // Siswa dashboard data
  className?: string;
  recentGrades?: unknown;
  announcements?: unknown;
}

/* ── MD3 Chart Palette ─────────────────────────────────── */

const CHART_COLORS = ['#4A6CF7', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const GRADE_COLORS: Record<string, string> = { A: '#22C55E', B: '#4A6CF7', C: '#F59E0B', D: '#F97316', E: '#EF4444' };
const ATTENDANCE_COLORS: Record<string, string> = { HADIR: '#22C55E', SAKIT: '#F59E0B', IZIN: '#06B6D4', ALPA: '#EF4444' };

const cardCls = 'bg-surface-container-lowest border border-surface-border rounded-xl p-5 shadow-sm';
const titleCls = 'text-[14px] font-semibold leading-[20px] text-on-surface mb-4';

/* ── Main Page ─────────────────────────────────────────── */

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

  return <div className="animate-fade-in">{getDashboardContent()}</div>;
}

/* ── Admin Dashboard ───────────────────────────────────── */

function AdminDashboard({ stats }: { stats: DashboardStats }) {
  // Compute attendance percentages for donut center + legend
  const attDist = stats.attendanceDistribution || [];
  const totalAtt = attDist.reduce((sum, a) => sum + a.count, 0);
  const hadirCount = attDist.find((a) => a.status === 'HADIR')?.count || 0;
  const izinSakitCount = (attDist.find((a) => a.status === 'SAKIT')?.count || 0) + (attDist.find((a) => a.status === 'IZIN')?.count || 0);
  const alpaCount = attDist.find((a) => a.status === 'ALPA')?.count || 0;
  const hadirPct = totalAtt > 0 ? Math.round((hadirCount / totalAtt) * 100) : 0;
  const izinSakitPct = totalAtt > 0 ? Math.round((izinSakitCount / totalAtt) * 100) : 0;
  const alpaPct = totalAtt > 0 ? Math.round((alpaCount / totalAtt) * 100) : 0;

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter mb-8">
        <StatCard title="Total Siswa" value={stats.totalStudents ?? '...'} icon="person" color="bg-primary/10 text-primary" />
        <StatCard title="Total Guru" value={stats.totalTeachers ?? '...'} icon="school" color="bg-secondary/10 text-secondary" />
        <StatCard title="Total Kelas" value={stats.totalClasses ?? '...'} icon="groups" color="bg-success/10 text-success" />
        <StatCard title="Kehadiran Hari Ini" value={stats.attendanceToday ?? '...'} icon="event_available" color="bg-warning/10 text-warning" />
      </div>

      {/* Charts: Performa Nilai Per Kelas + Rekap Absensi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-8">
        {/* Bar Chart: Performa Nilai Per Kelas */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface">Performa Nilai Per Kelas</h3>
            <select className="bg-surface-background border border-surface-border text-[12px] leading-[18px] rounded px-3 py-1 text-on-surface-variant focus:ring-secondary focus:border-secondary focus:outline-none">
              <option>Semester Ganjil</option>
              <option>Semester Genap</option>
            </select>
          </div>
          <ChartWrapper>
            <BarChart data={stats.classAverages}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
              <XAxis dataKey="className" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b1c30', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                cursor={{ fill: 'rgba(0,88,190,0.05)' }}
              />
              <Bar dataKey="average" fill="#0058be" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartWrapper>
        </div>

        {/* Donut Chart: Rekap Absensi Bulan Ini */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 flex flex-col">
          <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface mb-6">Rekap Absensi Bulan Ini</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Donut */}
            <div
              className="w-40 h-40 rounded-full relative"
              style={{
                background: `conic-gradient(#10b981 0% ${hadirPct}%, #f59e0b ${hadirPct}% ${hadirPct + izinSakitPct}%, #ef4444 ${hadirPct + izinSakitPct}% 100%)`,
              }}
            >
              <div className="absolute inset-4 bg-surface-container-lowest rounded-full flex items-center justify-center">
                <div className="text-center">
                  <span className="block text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-surface">{hadirPct}%</span>
                  <span className="block text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Hadir</span>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="w-full mt-8 space-y-3">
              <div className="flex items-center justify-between text-[12px] leading-[18px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-on-surface">Hadir</span>
                </div>
                <span className="font-semibold text-[12px] leading-[16px]">{hadirPct}%</span>
              </div>
              <div className="flex items-center justify-between text-[12px] leading-[18px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-on-surface">Izin/Sakit</span>
                </div>
                <span className="font-semibold text-[12px] leading-[16px]">{izinSakitPct}%</span>
              </div>
              <div className="flex items-center justify-between text-[12px] leading-[18px]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-danger" />
                  <span className="text-on-surface">Alpa</span>
                </div>
                <span className="font-semibold text-[12px] leading-[16px]">{alpaPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Kepala Sekolah Dashboard ──────────────────────────── */

function KepalaSekolahDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter mb-8">
        <StatCard title="Total Siswa" value={stats.totalStudents ?? '...'} icon="person" color="bg-primary/10 text-primary" />
        <StatCard title="Total Guru" value={stats.totalTeachers ?? '...'} icon="school" color="bg-secondary/10 text-secondary" />
        <StatCard title="Rata-rata Nilai" value={stats.averageGrade ?? '...'} icon="monitoring" color="bg-success/10 text-success" />
        <StatCard title="Absensi Hari Ini" value={stats.attendanceToday ?? '...'} icon="event_available" color="bg-warning/10 text-warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-8">
        <div className={cardCls}>
          <h3 className={titleCls}>Distribusi Nilai</h3>
          <ChartWrapper>
            <PieChart>
              <Pie data={stats.gradeDistribution} dataKey="count" nameKey="grade" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} label={({ name, value }) => `${name}: ${value}`}>
                {stats.gradeDistribution?.map((entry) => (
                  <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] || CHART_COLORS[0]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ChartWrapper>
        </div>
        <div className={cardCls}>
          <h3 className={titleCls}>Distribusi Kehadiran (30 Hari)</h3>
          <ChartWrapper>
            <BarChart data={stats.attendanceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.attendanceDistribution?.map((entry) => (
                  <Cell key={entry.status} fill={ATTENDANCE_COLORS[entry.status] || CHART_COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ChartWrapper>
        </div>
      </div>

      <div className={cardCls}>
        <h3 className={titleCls}>Rata-rata Nilai per Mata Pelajaran</h3>
        <ChartWrapper>
          <BarChart data={stats.subjectAverages}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-surface-border)" />
            <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="average" fill="#4A6CF7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartWrapper>
      </div>
    </>
  );
}

/* ── Guru Dashboard ────────────────────────────────────── */

function GuruDashboard({ stats }: { stats: DashboardStats }) {
  const schedule = (stats.schedule as Array<{ timeStart: string; timeEnd: string; subject: string; className: string; room: string; status: string }>) || [];
  const pendingItems = (stats.pendingItems as Array<{ title: string; deadline: string; urgent: boolean }>) || [];
  const messages = (stats.messages as Array<{ sender: string; preview: string; time: string; unread: boolean }>) || [];
  const att = (stats.attendance as { className: string; hadir: number; sakitIzin: number; alpa: number }) || { className: '10A', hadir: 28, sakitIzin: 2, alpa: 0 };
  const totalAtt = att.hadir + att.sakitIzin + att.alpa;
  const hadirPct = totalAtt > 0 ? Math.round((att.hadir / totalAtt) * 100) : 0;
  const sakitIzinPct = totalAtt > 0 ? Math.round((att.sakitIzin / totalAtt) * 100) : 0;

  return (
    <>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-surface">Selamat Datang, Guru</h2>
          <p className="text-[16px] leading-[24px] text-on-surface-variant mt-1">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[14px] font-semibold leading-[20px] hover:bg-primary-container transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Buat Tugas Baru
        </button>
      </div>

      {/* Stats: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-6">
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[24px]">groups</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[16px] text-on-surface-variant uppercase tracking-wider">Kelas Saya</p>
            <p className="text-[30px] font-bold leading-[38px] text-on-surface mt-1">{stats.classesTaught ?? '...'}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-secondary text-[24px]">person</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[16px] text-on-surface-variant uppercase tracking-wider">Siswa Diampu</p>
            <p className="text-[30px] font-bold leading-[38px] text-on-surface mt-1">{stats.totalStudents ?? '...'}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-success text-[24px]">analytics</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-[16px] text-on-surface-variant uppercase tracking-wider">Rata-rata Nilai</p>
            <p className="text-[30px] font-bold leading-[38px] text-on-surface mt-1">{stats.averageGradeClass ?? '...'}</p>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Jadwal Mengajar (span 2) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface">Jadwal Mengajar Hari Ini</h3>
            <a href="#" className="text-primary text-[12px] font-semibold leading-[16px] hover:underline">Lihat Semua</a>
          </div>
          <div className="space-y-4">
            {schedule.map((item, idx) => (
              <div key={idx} className={`flex gap-4 items-start p-4 border rounded-lg ${idx === 0 ? 'bg-surface-background border-l-4 border-l-primary border-surface-border' : 'border-surface-border hover:bg-surface-container-low transition-colors'}`}>
                <div className="flex flex-col items-center justify-center min-w-[60px] border-r border-surface-border pr-4">
                  <span className="text-[24px] font-semibold leading-[32px] text-on-surface">{item.timeStart}</span>
                  <span className="text-[11px] font-bold leading-[14px] text-on-surface-variant">{item.timeEnd}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-semibold leading-[20px] text-on-surface">{item.subject}</h4>
                  <p className="text-[12px] leading-[18px] text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[16px]">room</span> {item.className}
                  </p>
                </div>
                <div className="hidden sm:block">
                  {item.status === 'ongoing' ? (
                    <span className="px-2 py-1 bg-success/10 text-success text-[11px] font-bold leading-[14px] rounded">Berlangsung</span>
                  ) : (
                    <span className="px-2 py-1 bg-surface-container text-on-surface-variant text-[11px] font-bold leading-[14px] rounded">Akan Datang</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Action (span 1) */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-warning">warning</span>
              Pending Action
            </h3>
          </div>
          <div className="space-y-3">
            {pendingItems.map((item, idx) => (
              <div key={idx} className={`p-3 border rounded-lg flex items-start gap-3 ${item.urgent ? 'bg-error-container/30 border-error-container' : 'bg-surface-container border-surface-border'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${item.urgent ? 'bg-error-container text-on-error-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[18px]">{item.urgent ? 'assignment_late' : 'assignment_turned_in'}</span>
                </div>
                <div>
                  <h4 className="text-[12px] font-semibold leading-[16px] text-on-surface">{item.title}</h4>
                  <p className="text-[12px] leading-[18px] text-on-surface-variant">Tenggat: {item.deadline}</p>
                  <button className="mt-2 text-primary text-[11px] font-bold leading-[14px] hover:underline">Input Nilai</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Absensi (span 1) */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6">
          <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface mb-4">Absensi Kelas {att.className}</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[14px] leading-[20px] text-on-surface-variant flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success" /> Hadir</span>
              <span className="text-[14px] font-semibold leading-[20px] text-on-surface">{att.hadir} Siswa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] leading-[20px] text-on-surface-variant flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning" /> Sakit/Izin</span>
              <span className="text-[14px] font-semibold leading-[20px] text-on-surface">{att.sakitIzin} Siswa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] leading-[20px] text-on-surface-variant flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-danger" /> Alpa</span>
              <span className="text-[14px] font-semibold leading-[20px] text-on-surface">{att.alpa} Siswa</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-2 mt-4 overflow-hidden flex">
              <div className="bg-success h-full" style={{ width: `${hadirPct}%` }} />
              <div className="bg-warning h-full" style={{ width: `${sakitIzinPct}%` }} />
            </div>
          </div>
          <button className="w-full mt-6 py-2 border border-surface-border rounded-lg text-primary text-[12px] font-semibold leading-[16px] hover:bg-surface-container-low transition-colors">Lihat Detail Absensi</button>
        </div>

        {/* Pesan Masuk (span 2) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface">Pesan Masuk Terbaru</h3>
            <span className="px-2 py-1 bg-primary-container/10 text-primary rounded-full text-[11px] font-bold leading-[14px]">{stats.unreadCount ?? 0} Unread</span>
          </div>
          <div className="divide-y divide-surface-border">
            {messages.map((msg, idx) => (
              <div key={idx} className="py-3 flex gap-3 items-start hover:bg-surface-background transition-colors -mx-2 px-2 rounded cursor-pointer">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.unread ? 'bg-tertiary-container/20 text-tertiary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className={`text-[12px] font-semibold leading-[16px] truncate ${msg.unread ? 'text-on-surface font-bold' : 'text-on-surface'}`}>{msg.sender}</h4>
                    <span className={`text-[11px] font-bold leading-[14px] ${msg.unread ? 'text-primary' : 'text-on-surface-variant'}`}>{msg.time}</span>
                  </div>
                  <p className={`text-[12px] leading-[18px] text-on-surface-variant truncate ${msg.unread ? 'font-semibold' : ''}`}>{msg.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Siswa Dashboard ───────────────────────────────────── */

function SiswaDashboard({ stats }: { stats: DashboardStats }) {
  const schedule = [
    { time: '07:00', subject: 'Matematika Lanjut', room: 'Ruang 10A-1', teacher: 'Bpk. Susanto', active: true },
    { time: '08:30', subject: 'Bahasa Indonesia', room: 'Ruang 10A-1', teacher: 'Ibu Ratna', active: false },
    { time: '10:00', subject: 'Istirahat', room: '', teacher: '', active: false, isBreak: true },
    { time: '10:30', subject: 'Fisika Terapan', room: 'Lab Fisika', teacher: 'Bpk. Ridwan', active: false },
  ];
  const recentGrades = (stats.recentGrades as Array<{ subject: string; type: string; score: number; grade: string }>) || [];
  const announcements = (stats.announcements as Array<{ tag: string; tagColor: string; time: string; title: string; description: string }>) || [];
  const attBreakdown = stats.attendanceBreakdown || [];
  const hadirCount = attBreakdown.find((a) => a.status === 'HADIR')?.count || 0;
  const totalAtt = attBreakdown.reduce((sum, a) => sum + a.count, 0);
  const _attPct = totalAtt > 0 ? Math.round((hadirCount / totalAtt) * 100) : 0;

  return (
    <>
      {/* Welcome Banner */}
      <div className="bg-primary-container rounded-xl p-6 relative overflow-hidden flex items-center justify-between mb-6">
        <div className="relative z-10">
          <h2 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-primary-container mb-1">
            Halo, Siswa! 👋
          </h2>
          <p className="text-[16px] leading-[24px] text-inverse-primary">
            Selamat datang kembali di Dashboard Siswa. Kelas <strong>{stats.className || '10A - MIPA'}</strong>.
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
        <span className="material-symbols-outlined absolute -right-4 -bottom-8 text-9xl text-primary/10 select-none">school</span>
      </div>

      {/* Stats: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-6">
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 flex items-center gap-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[24px]">menu_book</span>
          </div>
          <div>
            <p className="text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider mb-1">Rata-rata IPK</p>
            <p className="text-[30px] font-bold leading-[38px] text-on-surface">{stats.gpa ?? '...'}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 flex items-center gap-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-success text-[24px]">check_circle</span>
          </div>
          <div>
            <p className="text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider mb-1">Kehadiran</p>
            <p className="text-[30px] font-bold leading-[38px] text-on-surface">{stats.attendanceRate ?? '...'}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 flex items-center gap-4 hover:shadow-sm transition-shadow">
          <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-warning text-[24px]">assignment_late</span>
          </div>
          <div>
            <p className="text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider mb-1">Tugas Belum Selesai</p>
            <p className="text-[30px] font-bold leading-[38px] text-on-surface">{stats.pendingAssignments ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Left Column (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jadwal Pelajaran Hari Ini */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-border overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-surface-bright">
              <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface">Jadwal Pelajaran Hari Ini</h3>
              <span className="text-[11px] font-bold leading-[14px] text-primary bg-primary-fixed px-2 py-1 rounded">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-surface-border ml-3 space-y-6">
                {schedule.map((item, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-surface ${item.active ? 'bg-primary' : 'bg-surface-border'}`} />
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-1">
                      <span className={`text-[12px] font-semibold leading-[16px] w-16 shrink-0 ${item.active ? 'text-primary' : 'text-on-surface-variant'}`}>{item.time}</span>
                      <h4 className={`text-[14px] font-semibold leading-[20px] ${(item as { isBreak?: boolean }).isBreak ? 'text-on-surface-variant italic' : 'text-on-surface'}`}>{item.subject}</h4>
                    </div>
                    {!((item as { isBreak?: boolean }).isBreak) && item.room && (
                      <p className="text-[12px] leading-[18px] text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">meeting_room</span> {item.room} &bull; {item.teacher}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Nilai Terbaru */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-border overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-border flex justify-between items-center bg-surface-bright">
              <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface">Nilai Terbaru</h3>
              <button className="text-[12px] font-semibold leading-[16px] text-primary hover:text-primary-container transition-colors">Lihat Semua</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-surface-border">
                    <th className="py-3 px-6 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Mata Pelajaran</th>
                    <th className="py-3 px-6 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Jenis Ujian</th>
                    <th className="py-3 px-6 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider text-right">Nilai</th>
                    <th className="py-3 px-6 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] leading-[18px] divide-y divide-surface-border">
                  {recentGrades.map((g, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-6 text-[12px] font-semibold leading-[16px] text-on-surface">{g.subject}</td>
                      <td className="py-3 px-6 text-on-surface-variant">{g.type}</td>
                      <td className="py-3 px-6 text-right text-[12px] font-semibold leading-[16px] text-on-surface">{g.score}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold ${
                          g.grade === 'A' ? 'bg-primary/10 text-primary' :
                          g.grade === 'B' ? 'bg-success/10 text-success' :
                          g.grade === 'C' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                        }`}>{g.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column (span 1) */}
        <div className="space-y-6">
          {/* Pengumuman Sekolah */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-border overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-surface-border bg-surface-bright flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">campaign</span>
              <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface">Pengumuman Sekolah</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-4">
              {announcements.map((a, idx) => (
                <div key={idx} className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 hover:border-primary-fixed transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[11px] font-bold leading-[14px] px-2 py-0.5 rounded ${
                      a.tagColor === 'primary' ? 'text-primary bg-primary-fixed' : 'text-on-surface-variant bg-surface-container-high'
                    }`}>{a.tag}</span>
                    <span className="text-[12px] leading-[18px] text-on-surface-variant">{a.time}</span>
                  </div>
                  <h4 className="text-[12px] font-semibold leading-[16px] text-on-surface group-hover:text-primary transition-colors mb-1">{a.title}</h4>
                  <p className="text-[12px] leading-[18px] text-on-surface-variant line-clamp-2">{a.description}</p>
                </div>
              ))}
              <button className="mt-auto w-full py-2.5 rounded-lg border border-surface-border text-[12px] font-semibold leading-[16px] text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
                Lihat Semua Pengumuman
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

/* ── Orang Tua Dashboard ───────────────────────────────── */

function OrangTuaDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
      <StatCard title="Nilai Anak" value={stats.childGrades ?? '...'} icon="monitoring" color="bg-success/10 text-success" />
      <StatCard title="Kehadiran" value={stats.attendanceRate ?? '...'} icon="event_available" color="bg-primary/10 text-primary" />
      <StatCard title="Pesan Guru" value={stats.teacherMessages ?? '...'} icon="mail" color="bg-secondary/10 text-secondary" />
      <StatCard title="Status SPP" value={stats.sppStatus ?? '...'} icon="payments" color="bg-warning/10 text-warning" />
    </div>
  );
}

/* ── Shared Components ─────────────────────────────────── */

function ChartWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}

function StatCard({ title, value, icon, color = 'bg-surface-container-low text-secondary' }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 flex flex-col justify-between hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div>
        <p className="text-on-surface-variant text-[12px] font-semibold leading-[16px] mb-1 uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-surface">
          {value}
        </h3>
      </div>
    </div>
  );
}
