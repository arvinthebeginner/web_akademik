'use client';

import { Button } from '@/components';
import React, { useState } from 'react';
import { FiFilter, FiDownload } from 'react-icons/fi';

interface GradeRecord {
  id: string;
  studentName: string;
  subject: string;
  score: number;
  grade: string;
  type: string;
}

const mockGrades: GradeRecord[] = [
  {
    id: '1',
    studentName: 'Ahmad Rizki',
    subject: 'Matematika',
    score: 85,
    grade: 'A',
    type: 'UTS',
  },
  {
    id: '2',
    studentName: 'Budi Santoso',
    subject: 'Matematika',
    score: 78,
    grade: 'B',
    type: 'UTS',
  },
  {
    id: '3',
    studentName: 'Citra Dewi',
    subject: 'Bahasa Inggris',
    score: 92,
    grade: 'A',
    type: 'UAS',
  },
];

export default function GradePage() {
  const [grades] = useState<GradeRecord[]>(mockGrades);
  const [filterType, setFilterType] = useState('SEMUA');

  const filteredGrades =
    filterType === 'SEMUA'
      ? grades
      : grades.filter((g) => g.type === filterType);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Nilai</h1>
        <div className="flex gap-3">
          <Button variant="secondary" size="md">
            <FiFilter className="inline mr-2" /> Filter
          </Button>
          <Button variant="primary" size="md">
            <FiDownload className="inline mr-2" /> Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kelas
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>-- Pilih Kelas --</option>
              <option>X A</option>
              <option>X B</option>
              <option>XI A</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mata Pelajaran
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>-- Pilih Mata Pelajaran --</option>
              <option>Matematika</option>
              <option>Bahasa Inggris</option>
              <option>Fisika</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Penilaian
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SEMUA">-- Semua --</option>
              <option value="UTS">UTS</option>
              <option value="UAS">UAS</option>
              <option value="FORMATIF">Formatif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Nama Siswa
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Mata Pelajaran
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Nilai
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Jenis
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredGrades.map((grade) => (
              <tr key={grade.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">
                  {grade.studentName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {grade.subject}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {grade.score}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {grade.grade}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {grade.type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredGrades.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data nilai yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
