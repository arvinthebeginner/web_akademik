'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  name: string;
  nisn: string;
  className: string;
  status: string;
}

interface GradeRecord {
  id: string;
  studentName: string;
  subject: string;
  score: number;
  grade: string;
  type: string;
}

interface AttendanceSummary {
  HADIR: number;
  SAKIT: number;
  IZIN: number;
  ALPA: number;
  total: number;
}

interface AssignmentRecord {
  id: string;
  assignmentTitle: string;
  subjectName: string;
  grade: number | null;
  submittedAt: string;
  dueDate: string;
}

export default function PortalOrtuPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary>({ HADIR: 0, SAKIT: 0, IZIN: 0, ALPA: 0, total: 0 });
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'nilai' | 'absensi' | 'tugas'>('nilai');

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        const formatted = (data.data || []).map((s: Record<string, unknown>) => ({
          id: s.id,
          name: s.name,
          nisn: s.nisn || '',
          className: s.className || '',
          status: s.status || 'AKTIF',
        }));
        setStudents(formatted);
        if (formatted.length > 0) setSelectedStudent(formatted[0].id);
      }
    } catch (error) {
      toast.error('Gagal memuat data siswa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStudents();
  }, [loadStudents]);

  const loadChildData = useCallback(async () => {
    if (!selectedStudent) return;
    try {
      // Load grades
      const resGrades = await fetch('/api/grades');
      if (resGrades.ok) {
        const data = await resGrades.json();
        const childGrades = (data.data || []).filter((g: GradeRecord & { studentId?: string }) => g.studentName === students.find(s => s.id === selectedStudent)?.name);
        setGrades(childGrades);
      }

      // Load attendance (mock summary from student's class)
      const student = students.find(s => s.id === selectedStudent);
      if (student) {
        // For now, create a placeholder summary
        setAttendance({ HADIR: 85, SAKIT: 3, IZIN: 2, ALPA: 1, total: 91 });
      }

      // Load assignments/submissions
      const resSubs = await fetch(`/api/submissions?studentId=${selectedStudent}`);
      if (resSubs.ok) {
        const data = await resSubs.json();
        setAssignments(data.data || []);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error(error);
    }
  }, [selectedStudent, students]);

  useEffect(() => {
    if (selectedStudent) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadChildData();
    }
  }, [loadChildData, selectedStudent]);

  const currentStudent = students.find(s => s.id === selectedStudent);
  const avgScore = grades.length > 0 ? Math.round(grades.reduce((s, g) => s + g.score, 0) / grades.length) : 0;
  const attendancePercent = attendance.total > 0 ? Math.round((attendance.HADIR / attendance.total) * 100) : 0;

  const tabCls = (tab: string) => `px-4 py-2.5 text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-2 ${
    activeTab === tab
      ? 'bg-primary-container text-on-primary-container'
      : 'text-on-surface-variant hover:bg-surface-container-low'
  }`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">Portal Orang Tua</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1\">Pantau perkembangan akademik dan kehadiran anak Anda.</p>
        </div>
      </div>

      {/* Student Selector */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 mb-stack-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>family_restroom</span>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Pilih Anak</label>
            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
              className="bg-white border border-surface-border rounded-lg px-3 py-1.5 text-[14px] leading-[20px] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[200px]">
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.className}</option>)}
            </select>
          </div>
        </div>
        {currentStudent && (
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              currentStudent.status === 'AKTIF'
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-warning/10 text-warning border-warning/20'
            }`}>{currentStudent.status}</span>
            <span className="text-[12px] text-on-surface-variant">NISN: {currentStudent.nisn}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-surface-border border-t-secondary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-stack-md">
            <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">school</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Kelas</p>
                <p className="text-[20px] font-semibold leading-[28px] text-on-background\">{currentStudent?.className || '-'}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                <span className="material-symbols-outlined">grade</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Rata-rata Nilai</p>
                <p className="text-[20px] font-semibold leading-[28px] text-on-background\">{avgScore}</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider\">Kehadiran</p>
                <p className="text-[20px] font-semibold leading-[28px] text-on-background\">{attendancePercent}%</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                <span className="material-symbols-outlined">assignment_turned_in</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Tugas Selesai</p>
                <p className="text-[20px] font-semibold leading-[28px] text-on-background">{assignments.length}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-stack-md">
            <button className={tabCls('nilai')} onClick={() => setActiveTab('nilai')}>
              <span className="material-symbols-outlined text-[18px]">grade</span> Nilai
            </button>
            <button className={tabCls('absensi')} onClick={() => setActiveTab('absensi')}>
              <span className="material-symbols-outlined text-[18px]">event_available</span> Absensi
            </button>
            <button className={tabCls('tugas')} onClick={() => setActiveTab('tugas')}>
              <span className="material-symbols-outlined text-[18px]">assignment</span> Tugas
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm overflow-hidden">
            {activeTab === 'nilai' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-background border-b border-surface-border">
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[60px]">No</th>
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Mata Pelajaran</th>
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[120px]">Tipe</th>
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[100px] text-center">Nilai</th>
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[80px] text-center">Predikat</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] leading-[20px] text-on-background divide-y divide-surface-border">
                    {grades.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-[14px]">Belum ada data nilai</td></tr>
                    ) : (
                      grades.map((g, idx) => (
                        <tr key={g.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-6 py-3 text-on-surface-variant">{idx + 1}</td>
                          <td className="px-6 py-3 font-semibold">{g.subject}</td>
                          <td className="px-6 py-3">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant border border-surface-border">{g.type}</span>
                          </td>
                          <td className="px-6 py-3 text-center font-mono font-bold">{g.score}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              g.grade === 'A' || g.grade === 'B' ? 'bg-success/10 text-success border-success/20' :
                              g.grade === 'C' ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-danger/10 text-danger border-danger/20'
                            }`}>{g.grade || '-'}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'absensi' && (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-surface-container-low border border-surface-border rounded-lg p-4 text-center">
                    <span className="material-symbols-outlined text-[32px] text-secondary mb-2 block">event_available</span>
                    <p className="text-[24px] font-bold text-on-background">{attendance.HADIR}</p>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Hadir</p>
                  </div>
                  <div className="bg-surface-container-low border border-surface-border rounded-lg p-4 text-center">
                    <span className="material-symbols-outlined text-[32px] text-warning mb-2 block">medical_services</span>
                    <p className="text-[24px] font-bold text-on-background">{attendance.SAKIT}</p>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Sakit</p>
                  </div>
                  <div className="bg-surface-container-low border border-surface-border rounded-lg p-4 text-center">
                    <span className="material-symbols-outlined text-[32px] text-primary mb-2 block">description</span>
                    <p className="text-[24px] font-bold text-on-background">{attendance.IZIN}</p>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Izin</p>
                  </div>
                  <div className="bg-surface-container-low border border-surface-border rounded-lg p-4 text-center">
                    <span className="material-symbols-outlined text-[32px] text-danger mb-2 block">cancel</span>
                    <p className="text-[24px] font-bold text-on-background">{attendance.ALPA}</p>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Alpa</p>
                  </div>
                  <div className="bg-surface-container-low border border-surface-border rounded-lg p-4 text-center">
                    <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-2 block">pie_chart</span>
                    <p className="text-[24px] font-bold text-on-background">{attendancePercent}%</p>
                    <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Persentase</p>
                  </div>
                </div>
                <div className="mt-6 bg-surface-background rounded-lg p-4 border border-surface-border">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-[13px] font-semibold text-on-surface">Ringkasan Kehadiran</p>
                  </div>
                  <div className="w-full bg-surface-container-low rounded-full h-3 overflow-hidden">
                    <div className="bg-success h-3 rounded-full transition-all" style={{ width: `${attendancePercent}%` }} />
                  </div>
                  <p className="text-[12px] text-on-surface-variant mt-2">
                    Dari total {attendance.total} hari, anak Anda hadir {attendance.HADIR} hari ({attendancePercent}%).
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'tugas' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-background border-b border-surface-border">
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[60px]">No</th>
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Judul Tugas</th>
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[140px]">Mata Pelajaran</th>
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[120px]">Dikumpulkan</th>
                      <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[80px] text-center">Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="text-[14px] leading-[20px] text-on-background divide-y divide-surface-border">
                    {assignments.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant text-[14px]">Belum ada tugas yang dikumpulkan</td></tr>
                    ) : (
                      assignments.map((a, idx) => (
                        <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-6 py-3 text-on-surface-variant">{idx + 1}</td>
                          <td className="px-6 py-3 font-semibold">{a.assignmentTitle}</td>
                          <td className="px-6 py-3">{a.subjectName}</td>
                          <td className="px-6 py-3 text-on-surface-variant text-[12px]">{new Date(a.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td className="px-6 py-3 text-center font-mono font-bold">{a.grade ?? '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
