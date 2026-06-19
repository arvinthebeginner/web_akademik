'use client';

import { Button } from '@/components';
import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Teacher {
  id: string;
  nip: string;
  name: string;
  email: string;
  specialization: string;
  qualification: string;
  address: string;
  phone: string;
  classes: string;
}

export default function TeacherPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form States
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load teachers
  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data guru dari database');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setNip('');
    setName('');
    setEmail('');
    setSpecialization('');
    setQualification('');
    setAddress('');
    setPhone('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setNip(teacher.nip);
    setName(teacher.name);
    setEmail(teacher.email);
    setSpecialization(teacher.specialization);
    setQualification(teacher.qualification);
    setAddress(teacher.address);
    setPhone(teacher.phone);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Nama dan Email wajib diisi!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        nip: nip || null,
        name,
        email,
        specialization: specialization || null,
        qualification: qualification || null,
        address: address || null,
        phone: phone || null,
      };

      const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : '/api/teachers';
      const method = editingTeacher ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success(editingTeacher ? 'Data guru berhasil diperbarui' : 'Guru baru berhasil ditambahkan');
        setIsModalOpen(false);
        loadTeachers();
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
    if (!confirm('Apakah Anda yakin ingin menghapus data guru ini? Akun login terkait juga akan dihapus.')) return;

    try {
      const response = await fetch(`/api/teachers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Guru berhasil dihapus');
        loadTeachers();
      } else {
        const resData = await response.json();
        toast.error(resData.error || 'Gagal menghapus guru');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
      console.error(error);
    }
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.nip.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Guru</h1>
        <Button variant="primary" size="md" onClick={handleOpenAddModal}>
          <FiPlus className="inline mr-2" /> Tambah Guru
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-4">
          <FiSearch className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama atau NIP guru..."
            className="flex-1 outline-none text-gray-700 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    NIP / Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Spesialisasi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kelas Diampu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      <div>{teacher.nip || '-'}</div>
                      <div className="text-xs text-gray-400">{teacher.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {teacher.name}
                      {teacher.qualification && (
                        <div className="text-xs font-normal text-gray-400">{teacher.qualification}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {teacher.specialization || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-semibold">
                      {teacher.classes}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-3">
                      <button 
                        onClick={() => handleOpenEditModal(teacher)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <FiTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTeachers.length === 0 && (
            <div className="text-center py-12 bg-white">
              <p className="text-gray-500">Tidak ada data guru yang ditemukan</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">NIP (Nomor Induk Pegawai)</label>
                <input
                  type="text"
                  placeholder="Contoh: 199001012015081001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Drs. Sugiyono, M.Pd"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email (untuk Akun Login) *</label>
                <input
                  type="email"
                  required
                  placeholder="Contoh: guru@sekolah.sch.id"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {!editingTeacher && email && (
                  <p className="text-xs text-blue-600 mt-1">Akun login akan dibuat otomatis dengan password: <strong>password123</strong></p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Spesialisasi Mengajar</label>
                  <input
                    type="text"
                    placeholder="Contoh: Matematika"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kualifikasi / Pendidikan</label>
                  <input
                    type="text"
                    placeholder="Contoh: S1 Pendidikan Matematika"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon / HP</label>
                <input
                  type="text"
                  placeholder="Contoh: 0812XXXXXXXX"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat Rumah</label>
                <textarea
                  placeholder="Alamat lengkap guru"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
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
