'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface GradeRow {
  studentId: string;
  studentName: string;
  nisn: string;
  gradeId: string | null;
  score: number | null;
  letterGrade: string | null;
  notes: string;
  classSubjectId: string;
  semesterId: string;
}

interface ClassOption {
  id: string;
  name: string;
}

interface SubjectOption {
  id: string;
  name: string;
}

const selectCls = "w-full bg-surface-container-lowest border border-surface-border rounded py-2 px-3 text-[12px] leading-[18px] text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary appearance-none transition-all";
const labelCls = "text-[11px] leading-[14px] font-bold text-on-surface-variant uppercase tracking-wider";

function getGradeBadge(letter: string | null) {
  if (!letter) return 'bg-surface-border text-on-surface-variant';
  switch (letter) {
    case 'A': return 'bg-success/10 text-success border border-success/20';
    case 'B': return 'bg-secondary/10 text-secondary border border-secondary/20';
    case 'C': return 'bg-warning/10 text-warning border border-warning/20';
    default: return 'bg-danger/10 text-danger border border-danger/20';
  }
}

export default function GradePage() {
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userClassName, setUserClassName] = useState('');
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('UTS');
  const canEdit = userRole === 'ADMIN' || userRole === 'GURU';

  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const initFilters = async () => {
      try {
        const [resClasses, resSubjects, meRes, studentsRes] = await Promise.all([
          fetch('/api/classes'),
          fetch('/api/subjects'),
          fetch('/api/auth/me'),
          fetch('/api/students'),
        ]);
        let allClasses: ClassOption[] = [];
        if (resClasses.ok) {
          const data = await resClasses.json();
          allClasses = data.data;
          setClasses(data.data);
          if (data.data.length > 0) setSelectedClass(data.data[0].id);
        }
        if (resSubjects.ok) {
          const data = await resSubjects.json();
          setSubjects(data.data);
          if (data.data.length > 0) setSelectedSubject(data.data[0].id);
        }
        // For SISWA: auto-select own class
        if (meRes.ok && studentsRes.ok) {
          const meData = await meRes.json();
          const role = meData.data?.role || '';
          setUserRole(role);
          setUserName(meData.data?.name || '');
          if (role === 'SISWA') {
            const studentsData = await studentsRes.json();
            const myStudent = studentsData.data.find((s: { userId?: string; email?: string }) => s.userId === meData.data?.id)
              || studentsData.data.find((s: { userId?: string; email?: string }) => s.email === meData.data?.email);
            if (myStudent?.classId) {
              setSelectedClass(myStudent.classId);
              setClasses(allClasses.filter((c: ClassOption) => c.id === myStudent.classId));
              setUserClassName(myStudent.class?.name || '');
            }
          }
        }
      } catch (error) {
        toast.error('Gagal mengambil data filter');
        console.error(error);
      }
    };
    initFilters();
  }, []);

  useEffect(() => {
    const loadGradesSheet = async () => {
      if (!selectedClass || !selectedSubject || !selectedType) return;
      try {
        setLoading(true);
        const url = `/api/grades?classId=${selectedClass}&subjectId=${selectedSubject}&type=${selectedType}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setGradeRows(data.data);
        } else {
          setGradeRows([]);
        }
      } catch (error) {
        toast.error('Gagal memuat daftar nilai');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadGradesSheet();
  }, [selectedClass, selectedSubject, selectedType]);

  const handleScoreChange = (studentId: string, value: string) => {
    setGradeRows((prev) =>
      prev.map((row) => {
        if (row.studentId === studentId) {
          const scoreNum = value === '' ? null : parseFloat(value);
          let letter = null;
          if (scoreNum !== null) {
            if (scoreNum >= 85) letter = 'A';
            else if (scoreNum >= 75) letter = 'B';
            else if (scoreNum >= 65) letter = 'C';
            else if (scoreNum >= 55) letter = 'D';
            else letter = 'E';
          }
          return { ...row, score: scoreNum, letterGrade: letter };
        }
        return row;
      })
    );
  };

  const handleNotesChange = (studentId: string, value: string) => {
    setGradeRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, notes: value } : row))
    );
  };

  const _handleSaveGrade = async (row: GradeRow) => {
    if (row.score === null) {
      toast.error('Harap masukkan nilai numerik!');
      return;
    }
    if (row.score < 0 || row.score > 100) {
      toast.error('Nilai harus di antara 0 sampai 100!');
      return;
    }
    try {
      setSavingId(row.studentId);
      const payload = {
        studentId: row.studentId,
        classSubjectId: row.classSubjectId,
        semesterId: row.semesterId,
        score: row.score,
        type: selectedType,
        notes: row.notes || null,
      };
      const response = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        toast.success(`Nilai untuk ${row.studentName} berhasil disimpan`);
      } else {
        const resData = await response.json();
        toast.error(resData.error || 'Gagal menyimpan nilai');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan');
      console.error(error);
    } finally {
      setSavingId(null);
    }
  };

  // Quick stats
  const visibleRows = canEdit ? gradeRows : gradeRows.filter(r => r.studentName === userName);
  const totalStudents = visibleRows.length;
  const gradedCount = visibleRows.filter(r => r.score !== null).length;
  const avgScore = totalStudents > 0
    ? (visibleRows.reduce((sum, r) => sum + (r.score ?? 0), 0) / totalStudents).toFixed(1)
    : '0';

  return (
    <div>
      {/* Page Header */}
      <div className="mb-gutter flex justify-between items-end">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background mb-1">{canEdit ? 'Manajemen Nilai' : 'Nilai Saya'}</h1>
          <p className="text-[12px] leading-[18px] text-on-surface-variant">{canEdit ? 'Input and manage student grades for selected classes and subjects.' : 'Lihat daftar nilai Anda dari guru.'}</p>
        </div>
        {canEdit && (
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-transparent text-secondary border border-secondary hover:bg-secondary/5 rounded text-[12px] leading-[16px] font-semibold transition-colors">
              Import CSV
            </button>
          </div>
        )}
      </div>

      {/* Student Info Banner (SISWA only) */}
      {!canEdit && userName && (
        <div className="mb-stack-md bg-primary-container border border-primary/20 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center text-[16px] font-bold">
            {userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-on-primary-container">{userName}</p>
            <p className="text-[12px] text-on-primary-container/70">Kelas: {userClassName || '-'}</p>
          </div>
        </div>
      )}

      {/* Main Bento Card */}
      <div className="bg-surface-container-lowest border border-surface-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Filter Bar */}
        <div className="p-4 border-b border-surface-border bg-surface-background flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className={labelCls}>Kelas</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} disabled={!canEdit}
              className={`${selectCls} ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className={labelCls}>Mata Pelajaran</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className={selectCls}>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className={labelCls}>Tipe Penilaian</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className={selectCls}>
              <option value="FORMATIF">Formatif 1</option>
              <option value="SUMATIF">Formatif 2</option>
              <option value="SEMESTER">Sumatif Tengah Semester</option>
              <option value="UTS">Sumatif Akhir Semester</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <label className={labelCls}>Semester</label>
            <select className={selectCls}>
              <option>Semester 2 (Genap)</option>
              <option>Semester 1 (Ganjil)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="h-[38px] px-6 bg-secondary text-on-secondary rounded text-[12px] leading-[16px] font-semibold hover:bg-primary transition-colors flex items-center justify-center">
              Tampilkan
            </button>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-surface-border border-t-secondary"></div>
          </div>
        ) : gradeRows.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-warning text-[28px]">warning</span>
            </div>
            <h3 className="text-[20px] font-semibold leading-[28px] text-on-background">Tidak Ada Pembelajaran Tersedia</h3>
            <p className="text-[12px] leading-[18px] text-on-surface-variant mt-1 max-w-md">
              Pastikan mata pelajaran yang dipilih sudah dipetakan ke wali kelas/guru di kelas ini pada database.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 bg-surface-container-lowest p-0">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-background border-b border-surface-border">
                  <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[60px]">No</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[120px]">NISN</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Nama Siswa</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[120px]">Nilai (0-100)</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[100px] text-center">Grade</th>
                  <th className="py-3 px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider w-[250px]">Catatan / Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {visibleRows.map((row, idx) => (
                  <tr key={row.studentId} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="py-2.5 px-4 text-[12px] leading-[18px] text-on-surface-variant">{idx + 1}</td>
                    <td className="py-2.5 px-4 text-[12px] leading-[18px] text-on-surface-variant">{row.nisn}</td>
                    <td className="py-2.5 px-4 text-[12px] leading-[16px] font-semibold text-primary">{row.studentName}</td>
                    <td className="py-2.5 px-4">
                      {canEdit ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="--"
                          className={`w-full max-w-[80px] bg-surface-container-lowest border rounded px-2 py-1.5 text-[12px] leading-[18px] text-center focus:outline-none focus:ring-2 transition-all ${
                            row.score !== null && row.score < 55
                              ? 'border-danger/50 focus:ring-danger/50 focus:border-danger bg-danger/5'
                              : 'border-surface-border focus:ring-secondary/50 focus:border-secondary'
                          }`}
                          value={row.score === null ? '' : row.score}
                          onChange={(e) => handleScoreChange(row.studentId, e.target.value)}
                        />
                      ) : (
                        <span className="text-[14px] font-semibold text-on-surface">{row.score ?? '--'}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-bold w-8 ${getGradeBadge(row.letterGrade)}`}>
                        {row.letterGrade || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {canEdit ? (
                        <input
                          type="text"
                          placeholder="Tambahkan catatan..."
                          className="w-full bg-surface-container-lowest border border-surface-border rounded px-3 py-1.5 text-[12px] leading-[18px] text-on-surface-variant opacity-70 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                          value={row.notes}
                          onChange={(e) => handleNotesChange(row.studentId, e.target.value)}
                        />
                      ) : (
                        <span className="text-[12px] text-on-surface-variant">{row.notes || '-'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Footer */}
        {!loading && gradeRows.length > 0 && canEdit && (
          <div className="p-4 border-t border-surface-border bg-surface-background flex justify-end gap-3 mt-auto">
            <button onClick={() => { setGradeRows([]); }} className="px-5 py-2 bg-transparent text-on-surface-variant hover:bg-surface-border/50 rounded text-[12px] leading-[16px] font-semibold transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Reset
            </button>
            <button onClick={async () => {
              let saved = 0;
              for (const row of gradeRows) {
                if (row.score !== null) {
                  try {
                    const payload = { studentId: row.studentId, classSubjectId: row.classSubjectId, semesterId: row.semesterId, score: row.score, type: selectedType, notes: row.notes || null };
                    const res = await fetch('/api/grades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if (res.ok) saved++;
                  } catch { /* skip */ }
                }
              }
              toast.success(`${saved} nilai berhasil disimpan`);
            }} disabled={savingId !== null} className="px-5 py-2 bg-secondary text-on-secondary hover:bg-primary rounded text-[12px] leading-[16px] font-semibold shadow-sm transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Simpan Semua Nilai
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {!loading && gradeRows.length > 0 && (
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
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Sudah Dinilai</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{gradedCount} <span className="text-[12px] text-outline font-normal">/ {totalStudents}</span></p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Rata-rata Kelas</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{avgScore}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
