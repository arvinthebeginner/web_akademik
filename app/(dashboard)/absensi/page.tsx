'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface AttendanceRow {
  studentId: string;
  studentName: string;
  nisn: string;
  attendanceId: string | null;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';
  notes: string;
}

interface ClassOption {
  id: string;
  name: string;
}

const selectCls = "w-full bg-surface-container-lowest border border-surface-border rounded py-2 px-3 text-[12px] leading-[18px] text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary appearance-none transition-all";
const labelCls = "text-[11px] leading-[14px] font-bold text-on-surface-variant uppercase tracking-wider";

const statusConfig = {
  HADIR: { active: 'bg-success text-on-primary', icon: 'check_circle' },
  SAKIT: { active: 'bg-warning text-white', icon: 'medical_services' },
  IZIN:  { active: 'bg-secondary text-on-secondary', icon: 'description' },
  ALPA:  { active: 'bg-danger text-white', icon: 'close' },
} as const;

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data.data);
          if (data.data.length > 0) setSelectedClass(data.data[0].id);
        }
      } catch (error) {
        toast.error('Gagal memuat daftar kelas');
        console.error(error);
      }
    };
    loadClasses();
  }, []);

  const loadAttendanceSheet = useCallback(async () => {
    if (!selectedClass || !selectedDate) return;
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
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAttendanceSheet();
  }, [loadAttendanceSheet]);

  const handleStatusChange = (studentId: string, status: AttendanceRow['status']) => {
    setAttendanceRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, status } : row))
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, notes } : row))
    );
  };

  const handleSaveAttendance = async () => {
    if (attendanceRows.length === 0) return;
    try {
      setSaving(true);
      const payload = {
        classId: selectedClass,
        date: selectedDate,
        records: attendanceRows.map((row) => ({
          studentId: row.studentId,
          status: row.status,
          notes: row.notes || null,
        })),
      };
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        toast.success('Kehadiran berhasil disimpan untuk kelas ini');
        loadAttendanceSheet();
      } else {
        const resData = await response.json();
        toast.error(resData.error || 'Gagal menyimpan absensi');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Quick stats
  const totalStudents = attendanceRows.length;
  const hadirCount = attendanceRows.filter(r => r.status === 'HADIR').length;
  const alpaCount = attendanceRows.filter(r => r.status === 'ALPA').length;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-gutter flex justify-between items-end">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background mb-1">Manajemen Absensi</h1>
          <p className="text-[12px] leading-[18px] text-on-surface-variant">Record and manage daily student attendance per class.</p>
        </div>
        {attendanceRows.length > 0 && (
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="px-5 py-2 bg-secondary text-on-secondary hover:bg-primary rounded text-[12px] leading-[16px] font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? 'Menyimpan...' : 'Simpan Kehadiran'}
          </button>
        )}
      </div>

      {/* Main Bento Card */}
      <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 border-b border-surface-border bg-surface-background flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className={labelCls}>Kelas</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={selectCls}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className={labelCls}>Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-surface-container-lowest border border-surface-border rounded py-2 px-3 text-[12px] leading-[18px] text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
            />
          </div>
        </div>

        {/* Table Section */}
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
            <p className="text-[12px] leading-[18px] text-on-surface-variant mt-1 max-w-md">
              Pastikan kelas yang dipilih memiliki siswa terdaftar yang aktif.
            </p>
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
                      <td className="py-2.5 px-4 text-[12px] leading-[18px] text-on-surface-variant">{idx + 1}</td>
                      <td className="py-2.5 px-4 text-[12px] leading-[18px] text-on-surface-variant">{row.nisn}</td>
                      <td className="py-2.5 px-4 text-[12px] leading-[16px] font-semibold text-primary">{row.studentName}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex justify-center gap-1 bg-surface-background p-1 rounded">
                          {(['HADIR', 'SAKIT', 'IZIN', 'ALPA'] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(row.studentId, status)}
                              className={`flex-1 px-2 py-1.5 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                row.status === status
                                  ? statusConfig[status].active + ' shadow-sm'
                                  : 'text-on-surface-variant hover:bg-surface-container-low'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">{statusConfig[status].icon}</span>
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="Keterangan tambahan..."
                          className="w-full bg-surface-container-lowest border border-surface-border rounded px-3 py-1.5 text-[12px] leading-[18px] text-on-surface-variant opacity-70 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                          value={row.notes}
                          onChange={(e) => handleNotesChange(row.studentId, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Action Footer */}
            <div className="p-4 border-t border-surface-border bg-surface-background flex justify-end gap-3 mt-auto">
              <button
                onClick={() => loadAttendanceSheet()}
                className="px-5 py-2 bg-transparent text-on-surface-variant hover:bg-surface-border/50 rounded text-[12px] leading-[16px] font-semibold transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Reset
              </button>
              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="px-5 py-2 bg-secondary text-on-secondary hover:bg-primary rounded text-[12px] leading-[16px] font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {saving ? 'Menyimpan...' : 'Simpan Kehadiran'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Quick Stats */}
      {!loading && attendanceRows.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-gutter">
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Siswa</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{totalStudents}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Hadir</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{hadirCount} <span className="text-[12px] text-outline font-normal">/ {totalStudents}</span></p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
              <span className="material-symbols-outlined">cancel</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Alpa</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{alpaCount} <span className="text-[12px] text-outline font-normal">/ {totalStudents}</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
