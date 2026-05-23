'use client';

import { Button } from '@/components';
import React, { useState } from 'react';
import { FiPlus, FiEdit, FiTrash, FiSearch } from 'react-icons/fi';

interface Teacher {
  id: string;
  nip: string;
  name: string;
  specialization: string;
  classes: string;
}

const mockTeachers: Teacher[] = [
  {
    id: '1',
    nip: '199001012015081001',
    name: 'Drs. Sugiyono, M.Pd',
    specialization: 'Matematika',
    classes: 'XI A, XI B, XII A',
  },
  {
    id: '2',
    nip: '199203032016082002',
    name: 'Siti Nurhaliza, S.Pd',
    specialization: 'Bahasa Inggris',
    classes: 'X A, X B, XI A',
  },
  {
    id: '3',
    nip: '199504052017083003',
    name: 'Rinto Harahap, S.Pd',
    specialization: 'Fisika',
    classes: 'XI B, XII B',
  },
];

export default function TeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.nip.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Guru</h1>
        <Button variant="primary" size="md">
          <FiPlus className="inline mr-2" /> Tambah Guru
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <FiSearch className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama atau NIP guru..."
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
                NIP
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Spesialisasi
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-800">
                  {teacher.nip}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {teacher.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {teacher.specialization}
                </td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  {teacher.classes}
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

      {filteredTeachers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data guru yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
