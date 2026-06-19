'use client';

import { Button } from '@/components';
import React, { useEffect, useState } from 'react';
import { FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi';
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

export default function GradePage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  
  // Selected Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('UTS'); // UTS, UAS, FORMATIF, SUMATIF, SEMESTER

  // Grade Data Sheet
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Load classes & subjects
  useEffect(() => {
    const initFilters = async () => {
      try {
        const resClasses = await fetch('/api/classes');
        if (resClasses.ok) {
          const data = await resClasses.json();
          setClasses(data.data);
          if (data.data.length > 0) setSelectedClass(data.data[0].id);
        }

        const resSubjects = await fetch('/api/subjects');
        if (resSubjects.ok) {
          const data = await resSubjects.json();
          setSubjects(data.data);
          if (data.data.length > 0) setSelectedSubject(data.data[0].id);
        }
      } catch (error) {
        toast.error('Gagal mengambil data filter');
        console.error(error);
      }
    };

    initFilters();
  }, []);

  // Fetch grades sheet when filters change
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

  useEffect(() => {
    loadGradesSheet();
  }, [selectedClass, selectedSubject, selectedType]);

  const handleScoreChange = (studentId: string, value: string) => {
    setGradeRows((prev) =>
      prev.map((row) => {
        if (row.studentId === studentId) {
          const scoreNum = value === '' ? null : parseFloat(value);
          // Auto calculate letter grade locally
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

  const handleSaveGrade = async (row: GradeRow) => {
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

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Nilai</h1>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 text-gray-700 transition-all duration-300 hover:shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Penilaian</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTS">UTS (Ujian Tengah Semester)</option>
              <option value="UAS">UAS (Ujian Akhir Semester)</option>
              <option value="FORMATIF">FORMATIF (Tugas/Kuis)</option>
              <option value="SUMATIF">SUMATIF</option>
              <option value="SEMESTER">SEMESTER (Rapor Akhir)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grade Entry Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : gradeRows.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center border border-gray-100 flex flex-col items-center justify-center">
          <FiAlertCircle className="text-orange-400 mb-3" size={40} />
          <h3 className="text-lg font-bold text-gray-700">Tidak Ada Pembelajaran Tersedia</h3>
          <p className="text-gray-400 mt-1 max-w-md text-sm">
            Pastikan mata pelajaran yang dipilih sudah dipetakan ke wali kelas/guru di kelas ini pada database.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    NISN
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                    Nilai (0-100)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Catatan Pembelajaran
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                    Simpan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {gradeRows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {row.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {row.nisn}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="--"
                        className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
                        value={row.score === null ? '' : row.score}
                        onChange={(e) => handleScoreChange(row.studentId, e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {row.letterGrade ? (
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          row.letterGrade === 'A' 
                            ? 'bg-green-100 text-green-800' 
                            : row.letterGrade === 'B' 
                            ? 'bg-blue-100 text-blue-800'
                            : row.letterGrade === 'C'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {row.letterGrade}
                        </span>
                      ) : (
                        <span className="text-gray-300 font-bold">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="Contoh: Sangat baik dalam UTS matematika ini"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={row.notes}
                        onChange={(e) => handleNotesChange(row.studentId, e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSaveGrade(row)}
                        disabled={savingId === row.studentId}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all ${
                          savingId === row.studentId
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                        }`}
                      >
                        {savingId === row.studentId ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiSave size={14} />
                        )}
                        Simpan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
