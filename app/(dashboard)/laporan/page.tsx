'use client';

import { Button } from '@/components';
import React, { useState } from 'react';
import { FiDownload, FiPrinter } from 'react-icons/fi';

interface LaporanOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const laporanOptions: LaporanOption[] = [
  {
    id: 'rapor',
    name: 'Rapor Siswa',
    description: 'Download rapor semester atau tahunan',
    icon: '📄',
  },
  {
    id: 'transkrip',
    name: 'Transkrip Nilai',
    description: 'Download transkrip lengkap nilai siswa',
    icon: '📋',
  },
  {
    id: 'statistik',
    name: 'Statistik Akademik',
    description: 'Lihat statistik nilai dan performa kelas',
    icon: '📊',
  },
  {
    id: 'absensi',
    name: 'Laporan Absensi',
    description: 'Download rekap kehadiran siswa',
    icon: '✅',
  },
  {
    id: 'prestasi',
    name: 'Laporan Prestasi',
    description: 'Lihat daftar prestasi dan penghargaan',
    icon: '🏆',
  },
  {
    id: 'sertifikat',
    name: 'Sertifikat Kelulusan',
    description: 'Cetak sertifikat kelulusan siswa',
    icon: '🎓',
  },
];

export default function LaporanPage() {
  const [selectedRapor, setSelectedRapor] = useState('rapor');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('2024/2025-1');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Laporan & Rapor</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Laporan
            </label>
            <select
              value={selectedRapor}
              onChange={(e) => setSelectedRapor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {laporanOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Siswa
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Siswa --</option>
              <option value="1">Ahmad Rizki</option>
              <option value="2">Budi Santoso</option>
              <option value="3">Citra Dewi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2024/2025-1">2024/2025 - Semester 1</option>
              <option value="2024/2025-2">2024/2025 - Semester 2</option>
              <option value="2023/2024-1">2023/2024 - Semester 1</option>
            </select>
          </div>
        </div>
      </div>

      {/* Laporan Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {laporanOptions.map((option) => (
          <div
            key={option.id}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all ${
              selectedRapor === option.id
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedRapor(option.id)}
          >
            <div className="text-4xl mb-3">{option.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {option.name}
            </h3>
            <p className="text-sm text-gray-600">{option.description}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6 flex gap-4 justify-end">
        <Button variant="secondary" size="md">
          <FiPrinter className="inline mr-2" /> Cetak
        </Button>
        <Button variant="primary" size="md">
          <FiDownload className="inline mr-2" /> Download
        </Button>
      </div>

      {/* Preview Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Preview</h2>
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            Pilih siswa dan semester untuk melihat preview laporan
          </p>
        </div>
      </div>
    </div>
  );
}
