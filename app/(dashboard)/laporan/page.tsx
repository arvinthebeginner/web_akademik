'use client';

import { Button } from '@/components';
import React, { useEffect, useState } from 'react';
import { FiDownload, FiPrinter, FiFileText, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface StudentOption {
  id: string;
  name: string;
  nisn: string;
  class?: {
    name: string;
  };
}

interface GradeRecord {
  id: string;
  studentName: string;
  subject: string;
  score: number;
  grade: string;
  type: string;
  notes?: string;
}

export default function LaporanPage() {
  const [selectedRapor, setSelectedRapor] = useState('rapor');
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('2025/2026-1');
  const [loading, setLoading] = useState(true);

  // Preview Data
  const [studentGrades, setStudentGrades] = useState<GradeRecord[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data.data);
          if (data.data.length > 0) {
            setSelectedStudentId(data.data[0].id);
          }
        }
      } catch (error) {
        toast.error('Gagal mengambil data siswa');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  // Fetch grades for selected student when selectedStudentId changes
  useEffect(() => {
    if (!selectedStudentId) {
      setStudentGrades([]);
      return;
    }

    const fetchStudentGrades = async () => {
      try {
        setLoadingPreview(true);
        const response = await fetch('/api/grades');
        if (response.ok) {
          const data = await response.json();
          const student = students.find((s) => s.id === selectedStudentId);
          if (student) {
            // Filter grades belonging to this student
            const filtered = data.data.filter(
              (g: any) => g.studentName === student.name
            );
            setStudentGrades(filtered);
          }
        }
      } catch (error) {
        console.error('Failed to load student preview grades:', error);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchStudentGrades();
  }, [selectedStudentId, students]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handlePrint = () => {
    if (!selectedStudentId) {
      toast.error('Harap pilih siswa terlebih dahulu');
      return;
    }
    window.print();
  };

  const handleDownload = () => {
    if (!selectedStudentId) {
      toast.error('Harap pilih siswa terlebih dahulu');
      return;
    }
    toast.success(`Mengunduh laporan rapor untuk ${selectedStudent?.name}...`);
  };

  return (
    <div className="text-gray-700">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 print:hidden">Laporan & Rapor</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-100 print:hidden transition-all duration-300 hover:shadow-md">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FiFileText className="text-blue-600" /> Filter Laporan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Laporan</label>
            <select
              value={selectedRapor}
              onChange={(e) => setSelectedRapor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rapor">Rapor Semester</option>
              <option value="transkrip">Transkrip Nilai Lengkap</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Siswa</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? (
                <option>Memuat siswa...</option>
              ) : students.length === 0 ? (
                <option value="">Tidak ada siswa</option>
              ) : (
                students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.class?.name || 'Tanpa Kelas'})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun Ajaran / Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2025/2026-1">2025/2026 - Semester 1 (Ganjil)</option>
              <option value="2025/2026-2">2025/2026 - Semester 2 (Genap)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {selectedStudent && (
        <div className="bg-white rounded-xl shadow p-6 flex gap-4 justify-end border border-gray-100 print:hidden mb-8 transition-all duration-300 hover:shadow-md">
          <Button variant="secondary" size="md" onClick={handlePrint}>
            <FiPrinter className="inline mr-2" /> Cetak Rapor
          </Button>
          <Button variant="primary" size="md" onClick={handleDownload}>
            <FiDownload className="inline mr-2" /> Unduh PDF
          </Button>
        </div>
      )}

      {/* Preview Section */}
      {selectedStudent ? (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-4xl mx-auto transition-all duration-300 hover:shadow-xl relative overflow-hidden">
          {/* Header watermark */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none print:hidden">
            <FiAward size={200} />
          </div>

          {/* Rapor Header */}
          <div className="border-b-2 border-gray-800 pb-6 mb-8 text-center">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-900">
              Rapor Hasil Belajar Siswa (Rapor Digital)
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">SMA Negeri 1 Jakarta</p>
          </div>

          {/* Student Info Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm">
            <div className="space-y-1.5">
              <p><strong className="w-32 inline-block">Nama Siswa</strong>: {selectedStudent.name}</p>
              <p><strong className="w-32 inline-block">NISN</strong>: {selectedStudent.nisn}</p>
            </div>
            <div className="space-y-1.5 md:text-right">
              <p><strong className="w-32 inline-block md:text-left">Kelas</strong>: {selectedStudent.class?.name || 'Belum dimasukkan'}</p>
              <p><strong className="w-32 inline-block md:text-left">Semester</strong>: {selectedSemester === '2025/2026-1' ? '1 (Ganjil)' : '2 (Genap)'}</p>
            </div>
          </div>

          {/* Grades Table */}
          <h3 className="font-bold text-base text-gray-800 mb-3 uppercase tracking-wide">A. Capaian Hasil Belajar</h3>
          
          {loadingPreview ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : studentGrades.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-dashed text-sm">
              Belum ada nilai yang direkam untuk siswa ini di semester terpilih.
            </div>
          ) : (
            <div className="border border-gray-300 rounded-xl overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-gray-700 w-12">No</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700 w-24">Nilai Angka</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700 w-20">Huruf</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Capaian Kompetensi / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {studentGrades.map((g, idx) => (
                    <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{g.subject}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600">{g.score}</td>
                      <td className="px-4 py-3 text-center font-bold">{g.grade}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 italic">{g.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Rapor Footer sign section */}
          <div className="grid grid-cols-2 gap-8 text-center text-sm mt-16">
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold mt-1">Orang Tua/Wali</p>
              <div className="h-20 border-b border-gray-400 w-48 mx-auto mt-4"></div>
            </div>
            <div>
              <p>Jakarta, 20 Juni 2026</p>
              <p className="font-semibold mt-1">Wali Kelas</p>
              <div className="h-20 border-b border-gray-400 w-48 mx-auto mt-4"></div>
              <p className="text-xs text-gray-400 mt-2 font-mono">Drs. Sugiyono, M.Pd</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow border border-gray-100">
          <p className="text-gray-400 text-sm">Tidak ada data siswa terpilih untuk melihat preview.</p>
        </div>
      )}
    </div>
  );
}
