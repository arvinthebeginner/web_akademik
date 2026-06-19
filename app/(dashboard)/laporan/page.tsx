'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentOption {
  id: string;
  name: string;
  nisn: string;
  userId?: string;
  email?: string;
  class?: { name: string };
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

type ActiveModule = null | 'rapor' | 'statistik' | 'absensi' | 'export';

const modules = [
  {
    id: 'rapor' as const,
    icon: 'description',
    title: 'Rapor Siswa',
    desc: 'Kelola dan cetak rapor akademik siswa per semester. Mendukung format PDF massal.',
    btnLabel: 'Buka Modul',
    btnPrimary: true,
    accentBg: 'bg-primary-fixed',
    iconColor: 'text-primary',
  },
  {
    id: 'statistik' as const,
    icon: 'monitoring',
    title: 'Statistik Akademik',
    desc: 'Analisis performa nilai, tren ketuntasan belajar, dan perbandingan antar kelas.',
    btnLabel: 'Lihat Analitik',
    btnPrimary: false,
    accentBg: 'bg-tertiary-fixed',
    iconColor: 'text-on-primary-fixed-variant',
  },
  {
    id: 'absensi' as const,
    icon: 'fact_check',
    title: 'Laporan Absensi',
    desc: 'Rekap kehadiran siswa terintegrasi. Filter berdasarkan periode, kelas, atau individu.',
    btnLabel: 'Buka Laporan',
    btnPrimary: false,
    accentBg: 'bg-secondary-fixed',
    iconColor: 'text-secondary',
  },
  {
    id: 'export' as const,
    icon: 'data_table',
    title: 'Export Data',
    desc: 'Unduh raw data akademik dalam format Excel (XLSX) atau CSV untuk kebutuhan eksternal.',
    btnLabel: 'Pusat Unduhan',
    btnPrimary: false,
    accentBg: 'bg-surface-variant',
    iconColor: 'text-on-surface-variant',
  },
];

export default function LaporanPage() {
  const [activeModule, setActiveModule] = useState<ActiveModule>(null);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('2025/2026-1');
  const [loading, setLoading] = useState(false);
  const [studentGrades, setStudentGrades] = useState<GradeRecord[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [userRole, setUserRole] = useState('');
  const canEdit = userRole === 'ADMIN' || userRole === 'GURU';

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        // Fetch user info first
        const meRes = await fetch('/api/auth/me');
        let role = '';
        let myUserId = '';
        let myEmail = '';
        if (meRes.ok) {
          const meData = await meRes.json();
          role = meData.data?.role || '';
          myUserId = meData.data?.id || '';
          myEmail = meData.data?.email || '';
          setUserRole(role);
        }
        const response = await fetch('/api/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data.data);
          if (role === 'SISWA') {
            // Auto-select own student record by userId or email
            const myStudent = data.data.find((s: StudentOption) => s.userId === myUserId)
              || data.data.find((s: StudentOption) => s.email === myEmail);
            if (myStudent) setSelectedStudentId(myStudent.id);
            else if (data.data.length > 0) setSelectedStudentId(data.data[0].id);
          } else {
            if (data.data.length > 0) setSelectedStudentId(data.data[0].id);
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

  useEffect(() => {
    const fetchStudentGrades = async () => {
      if (!selectedStudentId) {
        setStudentGrades([]);
        return;
      }
      try {
        setLoadingPreview(true);
        const response = await fetch('/api/grades');
        if (response.ok) {
          const data = await response.json();
          const student = students.find((s) => s.id === selectedStudentId);
          if (student) {
            const filtered = data.data.filter((g: { studentName: string }) => g.studentName === student.name);
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
    if (!selectedStudentId) { toast.error('Harap pilih siswa terlebih dahulu'); return; }
    window.print();
  };

  const handleDownload = () => {
    if (!selectedStudentId) { toast.error('Harap pilih siswa terlebih dahulu'); return; }
    if (!selectedStudent) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // School Header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI', pageWidth / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(12);
    doc.text('SMA NEGERI 1 NUSANTARA', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Pendidikan No. 123, Kota Pelajar, Provinsi Ilmu Pengetahuan 45678', pageWidth / 2, y, { align: 'center' });
    y += 3;
    doc.text('Telp: (021) 555-0198 | Email: info@sman1nusantara.sch.id', pageWidth / 2, y, { align: 'center' });
    y += 3;
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN HASIL BELAJAR (RAPOR)', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Student Info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const infoData = [
      ['Nama Peserta Didik', selectedStudent.name],
      ['NISN / NIS', selectedStudent.nisn],
      ['Kelas / Fase', selectedStudent.class?.name || 'Belum dimasukkan'],
      ['Semester', selectedSemester === '2025/2026-1' ? 'Ganjil' : 'Genap'],
      ['Tahun Ajaran', selectedSemester.split('-')[0]],
    ];
    infoData.forEach(([label, value]) => {
      doc.text(`${label}`, margin, y);
      doc.text(`: ${value}`, margin + 55, y);
      y += 5;
    });
    y += 5;

    // Grades Table
    if (studentGrades.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('A. Sikap & Pengetahuan', margin, y);
      y += 3;

      const tableData = studentGrades.map((g, idx) => {
        const predikat = g.score >= 85 ? 'Sangat Baik' : g.score >= 70 ? 'Baik' : g.score >= 55 ? 'Cukup' : 'Kurang';
        return [String(idx + 1), g.subject, String(g.score), String(g.score), String(g.score), predikat];
      });

      const avg = (studentGrades.reduce((s, g) => s + g.score, 0) / studentGrades.length).toFixed(2);
      tableData.push(['', 'Rata-rata Nilai Akhir', '', '', avg, '']);

      autoTable(doc, {
        startY: y,
        head: [['No', 'Mata Pelajaran', 'Formatif', 'Sumatif', 'Nilai Akhir', 'Predikat']],
        body: tableData,
        margin: { left: margin, right: margin },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        theme: 'grid',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Attendance
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('B. Ketidakhadiran', margin, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      body: [
        ['Hadir', '114 Hari (95%)'],
        ['Sakit', '3 Hari'],
        ['Izin', '3 Hari'],
        ['Tanpa Keterangan', '0 Hari'],
      ],
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      theme: 'grid',
      columnStyles: { 0: { cellWidth: 60 } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 15;

    // Signatures
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Mengetahui,', margin + 10, y);
    doc.text('Orang Tua/Wali', margin + 10, y + 4);

    doc.text(`Kota Pelajar, 15 Juni 2026`, pageWidth - margin - 50, y);
    doc.text('Wali Kelas', pageWidth - margin - 50, y + 4);

    y += 25;
    doc.setFont('helvetica', 'bold');
    doc.text('Drs. Sugiyono, M.Pd', pageWidth - margin - 50, y);
    doc.setFont('helvetica', 'normal');
    doc.text('NIP. 19780512 200501 2 003', pageWidth - margin - 50, y + 4);

    const fileName = `Rapor_${selectedStudent.name.replace(/\s+/g, '_')}_${selectedSemester}.pdf`;
    doc.save(fileName);
    toast.success(`PDF Rapor ${selectedStudent.name} berhasil diunduh!`);
  };

  // Module cards grid (default view)
  if (!activeModule) {
    return (
      <div>
        {/* Breadcrumbs & Page Header */}
        <div className="mb-stack-lg">
          <nav aria-label="Breadcrumb" className="flex text-on-surface-variant text-[12px] leading-[18px] mb-2">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link className="hover:text-primary transition-colors" href="/">Dashboard</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                  <span className="text-primary font-medium">Laporan</span>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">Laporan Akademik</h2>
          <p className="text-[16px] leading-[24px] text-on-surface-variant mt-1 max-w-2xl">
            Pusat kontrol untuk menghasilkan, melihat, dan mengunduh seluruh dokumen pelaporan akademik institusi.
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-surface-container-lowest rounded-xl border border-surface-border p-stack-lg flex flex-col hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
              {/* Decorative accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 ${mod.accentBg} opacity-20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-stack-md">
                <span className={`material-symbols-outlined icon-fill text-[28px] ${mod.iconColor}`}>{mod.icon}</span>
              </div>
              <h3 className="text-[20px] font-semibold leading-[28px] text-on-background mb-2">{mod.title}</h3>
              <p className="text-[14px] leading-[20px] text-on-surface-variant flex-grow mb-stack-lg">{mod.desc}</p>
              <button
                onClick={() => setActiveModule(mod.id)}
                className={`w-full py-2 px-4 rounded-lg text-[14px] leading-[20px] font-semibold transition-colors flex items-center justify-center gap-2 ${
                  mod.btnPrimary
                    ? 'bg-primary text-on-primary hover:bg-on-primary-fixed-variant'
                    : 'border border-primary text-primary hover:bg-surface-container-low'
                }`}
              >
                {mod.btnLabel}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module detail view (Rapor, Statistik, etc.)
  return (
    <div className="text-on-surface">
      {/* Back Button + Title */}
      <div className="mb-gutter flex items-center gap-3">
        <button
          onClick={() => setActiveModule(null)}
          className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">
            {modules.find(m => m.id === activeModule)?.title}
          </h1>
          <p className="text-[12px] leading-[18px] text-on-surface-variant mt-0.5">
            {modules.find(m => m.id === activeModule)?.desc}
          </p>
        </div>
      </div>

      {activeModule === 'rapor' && (
        <div className="flex flex-col gap-gutter max-w-[1200px] mx-auto w-full">
          {/* Controls Section */}
          <section className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 shadow-sm print:hidden">
            <h2 className="text-[20px] font-semibold leading-[28px] text-on-surface mb-6">Pilihan Dokumen Rapor</h2>
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* Student Search */}
                <div className="space-y-1.5">
                  <label className="text-[12px] leading-[16px] font-semibold text-on-surface-variant">Pilih Siswa</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">person_search</span>
                    <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} disabled={!canEdit}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg border border-surface-border bg-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-[14px] leading-[20px] text-on-surface transition-all appearance-none cursor-pointer ${!canEdit ? 'opacity-70 cursor-not-allowed' : ''}`}>
                      {loading ? (
                        <option>Memuat siswa...</option>
                      ) : students.length === 0 ? (
                        <option value="">Tidak ada siswa</option>
                      ) : (
                        students.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.class?.name || 'Tanpa Kelas'})</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                {/* Semester Select */}
                <div className="space-y-1.5">
                  <label className="text-[12px] leading-[16px] font-semibold text-on-surface-variant">Tahun Ajaran & Semester</label>
                  <div className="relative">
                    <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-surface-border bg-surface focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-[14px] leading-[20px] text-on-surface transition-all appearance-none cursor-pointer">
                      <option value="2025/2026-2">2025/2026 - Genap</option>
                      <option value="2025/2026-1">2025/2026 - Ganjil</option>
                      <option value="2024/2025-2">2024/2025 - Genap</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t border-surface-border lg:border-t-0 mt-2 lg:mt-0">
                <button onClick={handlePrint} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-primary text-primary text-[14px] leading-[20px] font-semibold hover:bg-surface-container-low transition-colors duration-200">
                  <span className="material-symbols-outlined text-[20px]">print</span>
                  Cetak
                </button>
                <button onClick={handleDownload} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-on-primary text-[14px] leading-[20px] font-semibold hover:bg-primary/90 shadow-sm transition-colors duration-200">
                  <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                  Generate PDF
                </button>
              </div>
            </div>
          </section>

          {/* Preview Area: A4 Paper Canvas */}
          {selectedStudent ? (
            <section className="bg-surface-border p-4 md:p-8 rounded-xl flex justify-center overflow-x-auto">
              <div className="w-full max-w-[850px] min-w-[700px] bg-surface-container-lowest shadow-[0_4px_12px_rgba(0,0,0,0.05)] rounded-sm p-10 md:p-14 text-[14px] leading-[20px] text-on-surface">
                {/* Document Header */}
                <div className="flex items-center border-b-[3px] border-on-surface pb-6 mb-8 gap-6">
                  <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[40px] text-primary">account_balance</span>
                  </div>
                  <div className="flex-1 text-center">
                    <h2 className="text-[24px] font-bold leading-[32px] tracking-tight">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN,<br/>RISET, DAN TEKNOLOGI</h2>
                    <h3 className="text-[20px] font-semibold leading-[28px] mt-1">SMA NEGERI 1 NUSANTARA</h3>
                    <p className="text-[12px] leading-[18px] mt-1 text-on-surface-variant">Jl. Pendidikan No. 123, Kota Pelajar, Provinsi Ilmu Pengetahuan 45678</p>
                    <p className="text-[12px] leading-[18px] text-on-surface-variant">Telp: (021) 555-0198 | Email: info@sman1nusantara.sch.id</p>
                  </div>
                  <div className="w-24 flex-shrink-0"></div>
                </div>

                {/* Report Title */}
                <div className="text-center mb-8">
                  <h4 className="text-[20px] font-semibold leading-[28px] font-bold underline mb-1">LAPORAN HASIL BELAJAR (RAPOR)</h4>
                </div>

                {/* Student Info Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 text-[14px] leading-[20px]">
                  <div className="flex">
                    <span className="w-40 text-on-surface-variant">Nama Peserta Didik</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold">{selectedStudent.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-on-surface-variant">Kelas / Fase</span>
                    <span className="mr-2">:</span>
                    <span className="font-semibold">{selectedStudent.class?.name || 'Belum dimasukkan'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-on-surface-variant">NISN / NIS</span>
                    <span className="mr-2">:</span>
                    <span>{selectedStudent.nisn}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-on-surface-variant">Semester</span>
                    <span className="mr-2">:</span>
                    <span>{selectedSemester === '2025/2026-1' ? 'Ganjil' : 'Genap'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 text-on-surface-variant">Sekolah Asal</span>
                    <span className="mr-2">:</span>
                    <span>SMA Negeri 1 Nusantara</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-on-surface-variant">Tahun Ajaran</span>
                    <span className="mr-2">:</span>
                    <span>{selectedSemester.split('-')[0]}</span>
                  </div>
                </div>

                {/* Grades Table */}
                <div className="mb-8">
                  <h5 className="text-[14px] leading-[20px] font-bold mb-3">A. Sikap & Pengetahuan</h5>
                  {loadingPreview ? (
                    <div className="flex justify-center items-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-surface-border border-t-secondary"></div>
                    </div>
                  ) : studentGrades.length === 0 ? (
                    <div className="bg-surface-background rounded-lg p-8 text-center text-on-surface-variant border border-dashed border-surface-border text-[14px]">
                      Belum ada nilai yang direkam untuk siswa ini di semester terpilih.
                    </div>
                  ) : (
                    <table className="w-full border-collapse border border-outline-variant text-[12px] leading-[18px]">
                      <thead>
                        <tr className="bg-surface-container-low text-center text-[12px] leading-[16px] font-semibold">
                          <th className="border border-outline-variant py-3 px-2 w-12">No</th>
                          <th className="border border-outline-variant py-3 px-4 text-left">Mata Pelajaran</th>
                          <th className="border border-outline-variant py-3 px-2 w-20">Formatif</th>
                          <th className="border border-outline-variant py-3 px-2 w-20">Sumatif</th>
                          <th className="border border-outline-variant py-3 px-2 w-24">Nilai Akhir</th>
                          <th className="border border-outline-variant py-3 px-2 w-24">Predikat</th>
                        </tr>
                      </thead>
                      <tbody className="text-center text-[12px] leading-[18px]">
                        {studentGrades.map((g, idx) => {
                          const predikat = g.score >= 85 ? 'Sangat Baik' : g.score >= 70 ? 'Baik' : g.score >= 55 ? 'Cukup' : 'Kurang';
                          return (
                            <tr key={g.id} className="hover:bg-surface-background transition-colors">
                              <td className="border border-outline-variant py-2 px-2">{idx + 1}</td>
                              <td className="border border-outline-variant py-2 px-4 text-left font-medium">{g.subject}</td>
                              <td className="border border-outline-variant py-2 px-2">{g.score}</td>
                              <td className="border border-outline-variant py-2 px-2">{g.score}</td>
                              <td className="border border-outline-variant py-2 px-2 font-bold">{g.score}</td>
                              <td className="border border-outline-variant py-2 px-2 text-success">{predikat}</td>
                            </tr>
                          );
                        })}
                        {/* Average Row */}
                        <tr className="bg-surface-container text-[12px] leading-[16px] font-semibold">
                          <td className="border border-outline-variant py-3 px-4 text-right" colSpan={4}>Rata-rata Nilai Akhir</td>
                          <td className="border border-outline-variant py-3 px-2 font-bold text-[16px] text-primary">
                            {(studentGrades.reduce((s, g) => s + g.score, 0) / studentGrades.length).toFixed(2)}
                          </td>
                          <td className="border border-outline-variant py-3 px-2"></td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Bottom Section: Attendance & Signatures */}
                <div className="grid grid-cols-2 gap-12 mt-10">
                  {/* Attendance Summary */}
                  <div>
                    <h5 className="text-[14px] leading-[20px] font-bold mb-3">B. Ketidakhadiran</h5>
                    <table className="w-full border-collapse border border-outline-variant text-[12px] leading-[18px]">
                      <tbody>
                        <tr>
                          <td className="border border-outline-variant py-2 px-4 text-on-surface-variant">Hadir</td>
                          <td className="border border-outline-variant py-2 px-4 text-center font-bold">114 Hari <span className="text-[11px] font-normal text-on-surface-variant">(95%)</span></td>
                        </tr>
                        <tr>
                          <td className="border border-outline-variant py-2 px-4 text-on-surface-variant">Sakit</td>
                          <td className="border border-outline-variant py-2 px-4 text-center">3 Hari</td>
                        </tr>
                        <tr>
                          <td className="border border-outline-variant py-2 px-4 text-on-surface-variant">Izin</td>
                          <td className="border border-outline-variant py-2 px-4 text-center">3 Hari</td>
                        </tr>
                        <tr>
                          <td className="border border-outline-variant py-2 px-4 text-on-surface-variant">Tanpa Keterangan</td>
                          <td className="border border-outline-variant py-2 px-4 text-center">0 Hari</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {/* Signatures */}
                  <div className="text-[12px] leading-[18px] pt-4">
                    <div className="flex justify-between h-40">
                      <div className="flex flex-col items-center justify-between">
                        <p className="text-on-surface-variant">Mengetahui,<br/>Orang Tua/Wali</p>
                        <div className="border-b border-on-surface w-32 mt-auto"></div>
                      </div>
                      <div className="flex flex-col items-center justify-between">
                        <p className="text-on-surface-variant text-center">Kota Pelajar, 15 Juni 2026<br/>Wali Kelas</p>
                        <div className="mt-auto text-center">
                          <p className="font-bold underline">Drs. Sugiyono, M.Pd</p>
                          <p className="text-on-surface-variant">NIP. 19780512 200501 2 003</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <div className="text-center py-20 bg-surface-container-lowest border border-surface-border rounded-xl">
              <p className="text-on-surface-variant text-[14px]">Tidak ada data siswa terpilih untuk melihat preview.</p>
            </div>
          )}
        </div>
      )}

      {activeModule === 'statistik' && (
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-surface-variant text-[32px]">monitoring</span>
          </div>
          <h3 className="text-[20px] font-semibold text-on-background mb-2">Statistik Akademik</h3>
          <p className="text-[14px] text-on-surface-variant max-w-md mx-auto">Modul analisis performa nilai dan tren ketuntasan belajar akan segera tersedia.</p>
        </div>
      )}

      {activeModule === 'absensi' && (
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-surface-variant text-[32px]">fact_check</span>
          </div>
          <h3 className="text-[20px] font-semibold text-on-background mb-2">Laporan Absensi</h3>
          <p className="text-[14px] text-on-surface-variant max-w-md mx-auto">Modul rekap kehadiran siswa terintegrasi akan segera tersedia.</p>
        </div>
      )}

      {activeModule === 'export' && (
        <div className="bg-surface-container-lowest border border-surface-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-on-surface-variant text-[32px]">data_table</span>
          </div>
          <h3 className="text-[20px] font-semibold text-on-background mb-2">Export Data</h3>
          <p className="text-[14px] text-on-surface-variant max-w-md mx-auto">Modul unduh data akademik dalam format Excel/CSV akan segera tersedia.</p>
        </div>
      )}
    </div>
  );
}
