'use client';

import { Button } from '@/components';
import React, { useState } from 'react';
import { FiPlus, FiEdit, FiTrash, FiSearch } from 'react-icons/fi';

interface Student {
  id: string;
  nisn: string;
  name: string;
  gender: string;
  class: string;
  status: string;
}

const mockStudents: Student[] = [
  {
    id: '1',
    nisn: '0012345001',
    name: 'Ahmad Rizki',
    gender: 'L',
    class: 'XI A',
    status: 'AKTIF',
  },
  {
    id: '2',
    nisn: '0012345002',
    name: 'Budi Santoso',
    gender: 'L',
    class: 'XI A',
    status: 'AKTIF',
  },
  {
    id: '3',
    nisn: '0012345003',
    name: 'Citra Dewi',
    gender: 'P',
    class: 'XI B',
    status: 'AKTIF',
  },
];

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Siswa</h1>
        <Button variant="primary" size="md">
          <FiPlus className="inline mr-2" /> Tambah Siswa
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <FiSearch className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama atau NISN siswa..."
            className="flex-1 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                NISN
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Jenis Kelamin
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.nisn}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {student.class}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800 p-1">
                    <FiEdit size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-800 p-1">
                    <FiTrash size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data siswa yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
