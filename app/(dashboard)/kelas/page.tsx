'use client';

import { Button } from '@/components';
import React, { useState } from 'react';
import { FiPlus, FiEdit, FiTrash, FiSearch } from 'react-icons/fi';

interface Class {
  id: string;
  name: string;
  gradeLevel: string;
  totalStudents: number;
  homeRoomTeacher: string;
  capacity: number;
}

const mockClasses: Class[] = [
  {
    id: '1',
    name: 'X A',
    gradeLevel: '10',
    totalStudents: 32,
    homeRoomTeacher: 'Drs. Bambang Sutrisno',
    capacity: 40,
  },
  {
    id: '2',
    name: 'X B',
    gradeLevel: '10',
    totalStudents: 30,
    homeRoomTeacher: 'Ibu Siti Nurhaliza',
    capacity: 40,
  },
  {
    id: '3',
    name: 'XI A',
    gradeLevel: '11',
    totalStudents: 28,
    homeRoomTeacher: 'Drs. Sugiyono',
    capacity: 40,
  },
];

export default function ClassPage() {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.homeRoomTeacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Kelas</h1>
        <Button variant="primary" size="md">
          <FiPlus className="inline mr-2" /> Tambah Kelas
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-4">
          <FiSearch className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama kelas atau guru pembimbing..."
            className="flex-1 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                <p className="text-sm text-gray-600">Kelas {cls.gradeLevel}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800 p-1">
                  <FiEdit size={18} />
                </button>
                <button className="text-red-600 hover:text-red-800 p-1">
                  <FiTrash size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Guru Pembimbing:</strong> {cls.homeRoomTeacher}
              </p>
              <p>
                <strong>Siswa:</strong> {cls.totalStudents}/{cls.capacity}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(cls.totalStudents / cls.capacity) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data kelas yang ditemukan</p>
        </div>
      )}
    </div>
  );
}
