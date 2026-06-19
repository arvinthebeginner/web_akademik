'use client';

import { Button } from '@/components';
import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  gradeLevel: string;
  totalStudents: number;
  homeRoomTeacher: string;
  homeRoomTeacherId?: string;
  capacity: number;
}

interface TeacherOption {
  id: string;
  name: string;
}

export default function ClassPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('10');
  const [capacity, setCapacity] = useState('40');
  const [homeRoomTeacherId, setHomeRoomTeacherId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load classes & teachers
  const loadData = async () => {
    try {
      setLoading(true);
      const resClasses = await fetch('/api/classes');
      if (resClasses.ok) {
        const data = await resClasses.json();
        setClasses(data.data);
      }

      const resTeachers = await fetch('/api/teachers');
      if (resTeachers.ok) {
        const data = await resTeachers.json();
        setTeachers(data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data kelas/guru');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setName('');
    setGradeLevel('10');
    setCapacity('40');
    setHomeRoomTeacherId(teachers[0]?.id || '');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls: Class) => {
    setEditingClass(cls);
    setName(cls.name);
    setGradeLevel(cls.gradeLevel);
    setCapacity(String(cls.capacity));
    setHomeRoomTeacherId(cls.homeRoomTeacherId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gradeLevel || !capacity) {
      toast.error('Nama, Tingkatan, dan Kapasitas kelas wajib diisi!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        gradeLevel,
        capacity,
        homeRoomTeacherId: homeRoomTeacherId || null,
      };

      const url = editingClass ? `/api/classes/${editingClass.id}` : '/api/classes';
      const method = editingClass ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success(editingClass ? 'Kelas berhasil diperbarui' : 'Kelas baru berhasil ditambahkan');
        setIsModalOpen(false);
        loadData();
      } else {
        toast.error(resData.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      toast.error('Gagal memproses data');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini? Siswa di kelas ini tidak akan dihapus, namun asosiasi kelasnya akan hilang.')) return;

    try {
      const response = await fetch(`/api/classes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Kelas berhasil dihapus');
        loadData();
      } else {
        const resData = await response.json();
        toast.error(resData.error || 'Gagal menghapus kelas');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
      console.error(error);
    }
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.homeRoomTeacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Kelas</h1>
        <Button variant="primary" size="md" onClick={handleOpenAddModal}>
          <FiPlus className="inline mr-2" /> Tambah Kelas
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-4">
          <FiSearch className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama kelas atau guru pembimbing..."
            className="flex-1 outline-none text-gray-700 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white rounded-xl shadow p-6 transition-all duration-300 hover:shadow-md border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{cls.name}</h3>
                    <p className="text-sm text-gray-400">Tingkat {cls.gradeLevel}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenEditModal(cls)}
                      className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cls.id)}
                      className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
                    >
                      <FiTrash size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <p>
                    <strong className="text-gray-700">Wali Kelas:</strong> {cls.homeRoomTeacher}
                  </p>
                  <p>
                    <strong className="text-gray-700">Kapasitas:</strong> {cls.totalStudents}/{cls.capacity} Siswa
                  </p>
                </div>
              </div>

              <div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((cls.totalStudents / cls.capacity) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredClasses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data kelas yang ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Kelas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: XII IPA 1, X B"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tingkatan *</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                  >
                    <option value="10">Kelas 10 (X)</option>
                    <option value="11">Kelas 11 (XI)</option>
                    <option value="12">Kelas 12 (XII)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kapasitas (Siswa) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Wali Kelas / Pembimbing</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={homeRoomTeacherId}
                  onChange={(e) => setHomeRoomTeacherId(e.target.value)}
                >
                  <option value="">-- Pilih Wali Kelas --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={submitting}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
