'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AttendanceRow {
  studentId: string;
  studentName: string;
  nisn: string;
  attendanceId: string | null;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';
  notes: string;
}

interface StudentOption {
  id: string;
  name: string;
  userId?: string;
  email?: string;
  class?: { name: string };
}

interface AttendanceRecord {
  id: string;
  date: string;
  day: number;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';
  notes: string;
}

interface ClassOption {
  id: string;
  name: string;
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const selectCls = "w-full bg-surface-container-lowest border border-surface-border rounded-lg py-2.5 px-4 text-[14px] leading-[20px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-all";
const labelCls = "text-[11px] leading-[14px] font-bold text-on-surface-variant uppercase tracking-wider";
const selectClsSmall = "w-full bg-surface-container-lowest border border-surface-border rounded py-2 px-3 text-[12px] leading-[18px] text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary appearance-none transition-all";

const statusConfig = {
  HADIR: { active: 'bg-success text-on-primary', icon: 'check_circle' },
  SAKIT: { active: 'bg-warning text-white', icon: 'medical_services' },
  IZIN:  { active: 'bg-secondary text-on-secondary', icon: 'description' },
  ALPA:  { active: 'bg-danger text-white', icon: 'close' },
} as const;

const INDONESIAN_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function AttendancePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const canEdit = userRole === 'ADMIN' || userRole === 'GURU';

  // Riwayat (student view) state
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [myStudentName, setMyStudentName] = useState('');
  const [myStudentClass, setMyStudentClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Management (edit view) state
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Redirect unauthorized users
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const role = data.data?.role || '';
          setUserRole(role);
          if (role !== 'ADMIN' && role !== 'GURU' && role !== 'SISWA' && role !== 'ORANG_TUA') {
            router.push('/');
          }
        }
      } catch { /* skip */ }
    };
    fetchUser();
  }, [router]);

  // Load initial data
  useEffect(() => {
    const loadInit = async () => {
      try {
        const [studentsRes, classesRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/classes'),
        ]);
        if (studentsRes.ok) {
          const data = await studentsRes.json();
          setStudents(data.data);
        }
        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(data.data);
          if (data.data.length > 0) setSelectedClass(data.data[0].id);
        }
        // Auto-select own student for SISWA
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          const role = meData.data?.role || '';
          setUserRole(role);
          if (role === 'SISWA' && studentsRes.ok) {
            const cloned = studentsRes.clone();
            const studentsData = await cloned.json();
            // Match by userId (User.id === Student.userId) for reliable matching
            const myStudent = studentsData.data.find((s: StudentOption) => s.userId === meData.data?.id)
              || studentsData.data.find((s: StudentOption) => s.email === meData.data?.email);
            if (myStudent) {
              setSelectedStudentId(myStudent.id);
              setMyStudentName(myStudent.name);
              setMyStudentClass(myStudent.class?.name || '');
              // Filter students to only self
              setStudents([myStudent]);
            } else if (studentsData.data.length > 0) {
              setSelectedStudentId(studentsData.data[0].id);
            }
          } else if (studentsRes.ok) {
            const cloned = studentsRes.clone();
            const studentsData = await cloned.json();
            if (studentsData.data.length > 0) setSelectedStudentId(studentsData.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load init data:', error);
      }
    };
    loadInit();
  }, []);

  // Load student attendance history (riwayat view)
  const loadHistory = useCallback(async () => {
    if (!selectedStudentId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/attendance?studentId=${selectedStudentId}&month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceRecords(data.data);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, selectedMonth, selectedYear]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory();
  }, [loadHistory]);

  // Load daily attendance sheet (management view)
  const loadAttendanceSheet = useCallback(async () => {
    if (!selectedClass || !selectedDate || !canEdit) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/attendance?classId=${selectedClass}&date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRows(data.data);
      } else {
        setAttendanceRows([]);
      }
    } catch (error) {
      toast.error('Gagal memuat lembar absensi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedDate, canEdit]);

  useEffect(() => {
    if (canEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadAttendanceSheet();
    }
  }, [loadAttendanceSheet, canEdit]);

  // Management handlers
  const handleStatusChange = (studentId: string, status: AttendanceRow['status']) => {
    setAttendanceRows((prev) => prev.map((row) => (row.studentId === studentId ? { ...row, status } : row)));
  };
  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceRows((prev) => prev.map((row) => (row.studentId === studentId ? { ...row, notes } : row)));
  };
  const handleSaveAttendance = async () => {
    if (attendanceRows.length === 0) return;
    try {
      setSaving(true);
      const payload = {
        classId: selectedClass, date: selectedDate,
        records: attendanceRows.map((row) => ({ studentId: row.studentId, status: row.status, notes: row.notes || null })),
      };
      const response = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) { toast.success('Kehadiran berhasil disimpan'); loadAttendanceSheet(); }
      else { const d = await response.json(); toast.error(d.error || 'Gagal menyimpan'); }
    } catch { toast.error('Terjadi kesalahan jaringan'); }
    finally { setSaving(false); }
  };

  // Calendar calculations
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7;
  const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();
  const getRecordForDay = (day: number) => attendanceRecords.find((r) => r.day === day);
  const totalDays = attendanceRecords.length;
  const hadirCount = attendanceRecords.filter((r) => r.status === 'HADIR').length;
  const sakitCount = attendanceRecords.filter((r) => r.status === 'SAKIT').length;
  const izinCount = attendanceRecords.filter((r) => r.status === 'IZIN').length;
  const alpaCount = attendanceRecords.filter((r) => r.status === 'ALPA').length;
  const attendancePercent = totalDays > 0 ? Math.round((hadirCount / totalDays) * 100) : 0;
  const absenceLogs = attendanceRecords.filter((r) => r.status !== 'HADIR');
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const mgmtTotal = attendanceRows.length;
  const mgmtHadir = attendanceRows.filter(r => r.status === 'HADIR').length;
  const mgmtSakit = attendanceRows.filter(r => r.status === 'SAKIT').length;
  const mgmtIzin = attendanceRows.filter(r => r.status === 'IZIN').length;
  const mgmtAlpa = attendanceRows.filter(r => r.status === 'ALPA').length;

  // ==================== RIWAYAT ABSENSI VIEW (SISWA / ORANG_TUA) ====================
  if (!canEdit) {
    return (
      <div>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
          <div>
            <h1 className="text-[24px] font-semibold leading-[32px] tracking-[-0.01em] text-on-surface">Riwayat Absensi Siswa</h1>
            <p className="text-[12px] leading-[18px] text-on-surface-variant mt-1">Pantau dan kelola kehadiran siswa secara detail.</p>
          </div>
          <button className="px-4 py-2 bg-surface-container-lowest border border-surface-border rounded-lg text-primary text-[12px] font-semibold hover:bg-surface-container transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export PDF
          </button>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-6 mb-stack-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className={labelCls}>{userRole === 'SISWA' ? 'Siswa' : 'Pilih Siswa'}</label>
              {userRole === 'SISWA' ? (
                <div className="flex items-center gap-3 pl-4 pr-4 py-2.5 bg-primary-container/10 rounded-lg border border-primary/20">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-[12px] font-bold shrink-0">
                    {myStudentName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-on-surface truncate">{myStudentName}</p>
                    <p className="text-[11px] text-on-surface-variant">Kelas {myStudentClass || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">person_search</span>
                  <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-surface rounded-lg border border-surface-border text-[14px] leading-[20px] text-on-surface focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-all">
                    {students.map((s) => <option key={s.id} value={s.id}>{s.name}{s.class ? ` - ${s.class.name}` : ''}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[18px]">arrow_drop_down</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Bulan</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className={selectCls}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelCls}>Tahun</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={selectCls}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-stack-md">
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] leading-[18px] text-on-surface-variant mb-1">Persentase Kehadiran</span>
            <span className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-success">{attendancePercent}%</span>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] leading-[18px] text-on-surface-variant mb-1">Total Hadir</span>
            <span className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-surface">{hadirCount}</span>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] leading-[18px] text-on-surface-variant mb-1">Total Sakit</span>
            <span className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-warning">{sakitCount}</span>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] leading-[18px] text-on-surface-variant mb-1">Total Izin</span>
            <span className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-primary">{izinCount}</span>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-4 flex flex-col justify-center items-center text-center">
            <span className="text-[12px] leading-[18px] text-on-surface-variant mb-1">Total Alpa</span>
            <span className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-danger">{alpaCount}</span>
          </div>
        </div>

        {/* Calendar + Absence Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-surface-border rounded-xl p-6 flex flex-col">
            <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface mb-6">
              Kalender Kehadiran - {MONTHS[selectedMonth]} {selectedYear}
            </h3>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAY_LABELS.map((d, i) => (
                <div key={d} className={`text-center text-[11px] font-bold uppercase tracking-wider py-2 ${i === 6 ? 'text-danger' : 'text-on-surface-variant'}`}>{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-3 border-surface-border border-t-secondary rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2 flex-1">
                {/* Previous month trailing days */}
                {Array.from({ length: firstDayOfWeek }, (_, i) => (
                  <div key={`prev-${i}`} className="aspect-square rounded-lg bg-surface flex items-center justify-center opacity-50">
                    <span className="text-[12px] text-on-surface-variant">{prevMonthDays - firstDayOfWeek + 1 + i}</span>
                  </div>
                ))}
                {/* Current month days */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const record = getRecordForDay(day);
                  const dayOfWeek = (firstDayOfWeek + i) % 7;
                  const isSunday = dayOfWeek === 6;

                  if (isSunday && !record) {
                    return (
                      <div key={day} className="aspect-square rounded-lg bg-surface-variant flex items-center justify-center text-danger">
                        <span className="text-[12px]">{day}</span>
                      </div>
                    );
                  }
                  if (!record) {
                    return (
                      <div key={day} className="aspect-square rounded-lg bg-surface flex items-center justify-center">
                        <span className="text-[12px] text-on-surface-variant">{day}</span>
                      </div>
                    );
                  }
                  if (record.status === 'HADIR') {
                    return (
                      <div key={day} className="aspect-square rounded-lg border border-success/20 bg-success/10 flex flex-col items-center justify-center text-success relative group cursor-default">
                        <span className="text-[14px] font-semibold">{day}</span>
                        <div className="absolute inset-0 ring-2 ring-success/50 rounded-lg hidden group-hover:block transition-all"></div>
                      </div>
                    );
                  }
                  if (record.status === 'SAKIT') {
                    return (
                      <div key={day} className="aspect-square rounded-lg border border-warning/30 bg-warning/10 flex flex-col items-center justify-center text-warning relative group cursor-help" title={record.notes || 'Sakit'}>
                        <span className="text-[14px] font-bold">{day}</span>
                        <div className="w-1.5 h-1.5 bg-warning rounded-full mt-1"></div>
                      </div>
                    );
                  }
                  if (record.status === 'IZIN') {
                    return (
                      <div key={day} className="aspect-square rounded-lg border border-secondary/30 bg-secondary/10 flex flex-col items-center justify-center text-secondary relative group cursor-help" title={record.notes || 'Izin'}>
                        <span className="text-[14px] font-bold">{day}</span>
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-1"></div>
                      </div>
                    );
                  }
                  // ALPA
                  return (
                    <div key={day} className="aspect-square rounded-lg border border-danger/30 bg-danger/10 flex flex-col items-center justify-center text-danger relative group cursor-help" title={record.notes || 'Alpa'}>
                      <span className="text-[14px] font-bold">{day}</span>
                      <div className="w-1.5 h-1.5 bg-danger rounded-full mt-1"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Absence Log */}
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-6 flex flex-col">
            <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface mb-6">Log Ketidakhadiran</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {absenceLogs.length === 0 && !loading ? (
                <div className="mt-8 flex flex-col items-center justify-center text-center opacity-60">
                  <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
                  <p className="text-[12px] text-on-surface-variant">Tidak ada catatan ketidakhadiran di bulan ini.</p>
                </div>
              ) : (
                absenceLogs.map((log) => {
                  const colorMap: Record<string, string> = { SAKIT: 'bg-warning', IZIN: 'bg-secondary', ALPA: 'bg-danger' };
                  const badgeMap: Record<string, string> = { SAKIT: 'bg-warning/10 text-warning', IZIN: 'bg-secondary/10 text-secondary', ALPA: 'bg-danger/10 text-danger' };
                  return (
                    <div key={log.id} className="p-4 border border-surface-border rounded-lg bg-surface relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorMap[log.status]}`}></div>
                      <div className="flex justify-between items-start mb-2 pl-2">
                        <span className={`px-2 py-1 ${badgeMap[log.status]} text-[10px] font-bold rounded uppercase tracking-wider`}>{log.status}</span>
                        <span className="text-[12px] text-on-surface-variant">{log.day} {INDONESIAN_MONTHS_SHORT[selectedMonth]} {selectedYear}</span>
                      </div>
                      {log.notes && <p className="text-[14px] text-on-surface pl-2 mt-2">{log.notes}</p>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MANAJEMEN ABSENSI VIEW (ADMIN / GURU) ====================
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">Manajemen Absensi</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1">Catat dan kelola kehadiran harian siswa per kelas.</p>
        </div>
      </div>

      <div className="bg-surface border border-surface-border rounded-xl p-4 mb-stack-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap w-full gap-3 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className={labelCls}>Kelas</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={selectClsSmall}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className={labelCls}>Tanggal</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-surface-container-lowest border border-surface-border rounded py-2 px-3 text-[12px] leading-[18px] text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all" />
          </div>
          <button onClick={loadAttendanceSheet}
            className="bg-primary hover:bg-primary-container text-on-primary text-[12px] leading-[16px] font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm h-[36px]">
            <span className="material-symbols-outlined text-[16px]">search</span>Tampilkan
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-surface-border border-t-secondary"></div>
          </div>
        ) : attendanceRows.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-warning text-[28px]">warning</span>
            </div>
            <h3 className="text-[20px] font-semibold leading-[28px] text-on-background">Tidak Ada Siswa Terdaftar</h3>
            <p className="text-[12px] leading-[18px] text-on-surface-variant mt-1 max-w-md">Pastikan kelas yang dipilih memiliki siswa terdaftar.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1 bg-surface-container-lowest p-0">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-surface-background border-b border-surface-border">
                    <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[60px]">No</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[120px]">NISN</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Nama Siswa</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[320px] text-center">Status Kehadiran</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[220px]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {attendanceRows.map((row, idx) => (
                    <tr key={row.studentId} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="py-2.5 px-4 text-[12px] text-on-surface-variant">{idx + 1}</td>
                      <td className="py-2.5 px-4 text-[12px] text-on-surface-variant">{row.nisn}</td>
                      <td className="py-2.5 px-4 text-[12px] font-semibold text-primary">{row.studentName}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex justify-center gap-1 bg-surface-background p-1 rounded">
                          {(['HADIR', 'SAKIT', 'IZIN', 'ALPA'] as const).map((status) => (
                            <button key={status} type="button" onClick={() => handleStatusChange(row.studentId, status)}
                              className={`flex-1 px-2 py-1.5 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${row.status === status ? statusConfig[status].active + ' shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
                              <span className="material-symbols-outlined text-[14px]">{statusConfig[status].icon}</span>{status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <input type="text" placeholder="Keterangan tambahan..."
                          className="w-full bg-surface-container-lowest border border-surface-border rounded px-3 py-1.5 text-[12px] text-on-surface-variant opacity-70 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                          value={row.notes} onChange={(e) => handleNotesChange(row.studentId, e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-surface-border bg-surface-background flex justify-end gap-3 mt-auto">
              <button onClick={() => loadAttendanceSheet()}
                className="px-5 py-2 bg-transparent text-on-surface-variant hover:bg-surface-border/50 rounded text-[12px] font-semibold transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">refresh</span>Reset
              </button>
              <button onClick={handleSaveAttendance} disabled={saving}
                className="px-5 py-2 bg-secondary text-on-secondary hover:bg-primary rounded text-[12px] font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">save</span>{saving ? 'Menyimpan...' : 'Simpan Kehadiran'}
              </button>
            </div>
          </>
        )}
      </div>

      {!loading && attendanceRows.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-gutter">
          {[
            { label: 'Total', value: mgmtTotal, icon: 'group', bg: 'bg-surface-container-low', color: 'text-secondary' },
            { label: 'Hadir', value: mgmtHadir, icon: 'check_circle', bg: 'bg-success/10', color: 'text-success' },
            { label: 'Sakit', value: mgmtSakit, icon: 'medical_services', bg: 'bg-warning/10', color: 'text-warning' },
            { label: 'Izin', value: mgmtIzin, icon: 'description', bg: 'bg-secondary/10', color: 'text-secondary' },
            { label: 'Alpa', value: mgmtAlpa, icon: 'cancel', bg: 'bg-danger/10', color: 'text-danger' },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
              <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
                <p className="text-[20px] font-semibold leading-[28px] text-on-background">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
