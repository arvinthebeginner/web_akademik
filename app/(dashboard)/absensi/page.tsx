'use client';

import { Button } from '@/components';
import React, { useState } from 'react';
import { FiFilter, FiDownload } from 'react-icons/fi';

interface AttendanceRecord {
  id: string;
  studentName: string;
  date: string;
  status: string;
  notes?: string;
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    studentName: 'Ahmad Rizki',
    date: '2024-05-23',
    status: 'HADIR',
  },
  {
    id: '2',
    studentName: 'Budi Santoso',
    date: '2024-05-23',
    status: 'HADIR',
  },
  {
    id: '3',
    studentName: 'Citra Dewi',
    date: '2024-05-23',
    status: 'SAKIT',
    notes: 'Demam tinggi',
  },
];

const statusColors: { [key: string]: string } = {
  HADIR: 'bg-green-100 text-green-800',
  SAKIT: 'bg-yellow-100 text-yellow-800',
  IZIN: 'bg-blue-100 text-blue-800',
  ALPA: 'bg-red-100 text-red-800',
};

export default function AttendancePage() {
  const [attendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [filterClass, setFilterClass] = useState('X A');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Absensi</h1>
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
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>X A</option>
              <option>X B</option>
              <option>XI A</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Keterangan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {attendance.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">
                  {record.studentName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {record.date}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusColors[record.status]
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {record.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attendance.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data absensi yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
