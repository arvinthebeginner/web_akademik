'use client';

import { Button } from '@/components';
import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit, FiTrash, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  nisn: string;
  nis?: string;
  name: string;
  email?: string;
  gender: 'L' | 'P';
  dateOfBirth: string;
  address?: string;
  phone?: string;
  classId: string;
  class?: {
    id: string;
    name: string;
  };
  status: 'AKTIF' | 'PINDAH' | 'LULUS' | 'TIDAK_AKTIF';
}

interface ClassOption {
  id: string;
  name: string;
}

export default function StudentPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form States
  const [nisn, setNisn] = useState('');
  const [nis, setNis] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [classId, setClassId] = useState('');
  const [status, setStatus] = useState<Student['status']>('AKTIF');
  const [submitting, setSubmitting] = useState(false);

  // Load students & classes
  const loadData = async () => {
    try {
      setLoading(true);
      const resStudents = await fetch('/api/students');
      if (resStudents.ok) {
        const data = await resStudents.json();
        setStudents(data.data);
      }

      const resClasses = await fetch('/api/classes');
      if (resClasses.ok) {
        const data = await resClasses.json();
        setClasses(data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data dari database');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setNisn('');
    setNis('');
    setName('');
    setEmail('');
    setGender('L');
    setDateOfBirth('');
    setAddress('');
    setPhone('');
    setClassId(classes[0]?.id || '');
    setStatus('AKTIF');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setNisn(student.nisn);
    setNis(student.nis || '');
    setName(student.name);
    setEmail(student.email || '');
    setGender(student.gender);
    // Format date for <input type="date" /> (YYYY-MM-DD)
    const formattedDate = student.dateOfBirth 
      ? new Date(student.dateOfBirth).toISOString().split('T')[0] 
      : '';
    setDateOfBirth(formattedDate);
    setAddress(student.address || '');
    setPhone(student.phone || '');
    setClassId(student.classId);
    setStatus(student.status);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn || !name || !dateOfBirth || !classId) {
      toast.error('Harap isi field yang wajib!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        nisn,
        nis: nis || null,
        name,
        email: email || null,
        gender,
        dateOfBirth,
        address: address || null,
        phone: phone || null,
        classId,
        status,
      };

      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success(editingStudent ? 'Data siswa berhasil diperbarui' : 'Siswa baru berhasil ditambahkan');
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
    if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini? Akun login terkait juga akan dihapus.')) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Siswa berhasil dihapus');
        loadData();
      } else {
        const resData = await response.json();
        toast.error(resData.error || 'Gagal menghapus siswa');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi');
      console.error(error);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nisn.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 animate-fade-in">Manajemen Siswa</h1>
        <Button variant="primary" size="md" onClick={handleOpenAddModal}>
          <FiPlus className="inline mr-2" /> Tambah Siswa
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-4">
          <FiSearch className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama atau NISN siswa..."
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
                    NISN / NIS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Jenis Kelamin
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      <div>{student.nisn}</div>
                      <div className="text-xs text-gray-400">{student.nis || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {student.name}
                      <div className="text-xs font-normal text-gray-400 font-mono">{student.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-semibold">
                      {student.class?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'AKTIF' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : student.status === 'LULUS'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-3">
                      <button 
                        onClick={() => handleOpenEditModal(student)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
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
          {filteredStudents.length === 0 && (
            <div className="text-center py-12 bg-white">
              <p className="text-gray-500">Tidak ada data siswa yang ditemukan</p>
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
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">NISN *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0012345001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">NIS</label>
                  <input
                    type="text"
                    placeholder="Contoh: 23241001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap siswa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email (untuk Akun Login)</label>
                <input
                  type="email"
                  placeholder="Contoh: siswa@sekolah.sch.id"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {!editingStudent && email && (
                  <p className="text-xs text-blue-600 mt-1">Akun login akan dibuat otomatis dengan password: <strong>password123</strong></p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Jenis Kelamin *</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas *</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                  >
                    {classes.length === 0 ? (
                      <option value="">Tidak ada kelas tersedia</option>
                    ) : (
                      classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status Keaktifan</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Student['status'])}
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="PINDAH">PINDAH</option>
                    <option value="LULUS">LULUS</option>
                    <option value="TIDAK_AKTIF">TIDAK AKTIF</option>
                  </select>
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
                  placeholder="Alamat lengkap siswa"
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
