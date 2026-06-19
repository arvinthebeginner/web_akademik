'use client';

import { Button } from '@/components';
import React, { useCallback, useEffect, useState } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers');
      if (response.ok) { const data = await response.json(); setTeachers(data.data); }
    } catch (error) { toast.error('Gagal mengambil data guru'); console.error(error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTeachers();
  }, [loadTeachers]);

  const handleOpenAddModal = () => {
    setEditingTeacher(null); setNip(''); setName(''); setEmail('');
    setSpecialization(''); setQualification(''); setAddress(''); setPhone(''); setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher); setNip(teacher.nip); setName(teacher.name);
    setEmail(teacher.email); setSpecialization(teacher.specialization);
    setQualification(teacher.qualification); setAddress(teacher.address);
    setPhone(teacher.phone); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) { toast.error('Nama dan Email wajib diisi!'); return; }
    try {
      setSubmitting(true);
      const payload = { nip: nip || null, name, email, specialization: specialization || null, qualification: qualification || null, address: address || null, phone: phone || null };
      const url = editingTeacher ? `/api/teachers/${editingTeacher.id}` : '/api/teachers';
      const method = editingTeacher ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const resData = await response.json();
      if (response.ok) { toast.success(editingTeacher ? 'Data guru berhasil diperbarui' : 'Guru baru berhasil ditambahkan'); setIsModalOpen(false); loadTeachers(); }
      else { toast.error(resData.error || 'Terjadi kesalahan'); }
    } catch (error) { toast.error('Gagal memproses data'); console.error(error); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data guru ini?')) return;
    try {
      const response = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      if (response.ok) { toast.success('Guru berhasil dihapus'); loadTeachers(); }
      else { const resData = await response.json(); toast.error(resData.error || 'Gagal menghapus guru'); }
    } catch (error) { toast.error('Terjadi kesalahan koneksi'); console.error(error); }
  };

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.nip.includes(searchTerm)
  );

  const inputCls = "w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all";
  const labelCls = "block text-[12px] font-semibold leading-[16px] text-on-surface mb-1.5";

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">Manajemen Guru</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1">Kelola data guru dan informasi pengajar.</p>
        </div>
        <button onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-container text-on-primary text-[14px] font-semibold leading-[20px] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Guru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 mb-stack-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="w-full md:w-1/3 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input type="text" placeholder="Cari nama atau NIP guru..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-[14px] leading-[20px] text-on-surface transition-all" />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-surface-border border-t-secondary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-surface border border-surface-border rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-background border-b border-surface-border">
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">NIP / Email</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Nama</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Spesialisasi</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Kelas Diampu</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[14px] leading-[20px] text-on-background divide-y divide-surface-border">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-surface-container-low transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-on-surface-variant">
                      <div>{teacher.nip || '-'}</div>
                      <div className="text-[12px] text-outline">{teacher.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-semibold leading-[20px] text-on-surface">{teacher.name}</div>
                      {teacher.qualification && <div className="text-[12px] text-outline">{teacher.qualification}</div>}
                    </td>
                    <td className="px-6 py-4">{teacher.specialization || '-'}</td>
                    <td className="px-6 py-4">{teacher.classes}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleOpenEditModal(teacher)} className="p-1.5 text-on-surface-variant hover:text-secondary rounded-md hover:bg-surface-variant transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(teacher.id)} className="p-1.5 text-on-surface-variant hover:text-danger rounded-md hover:bg-error-container transition-colors" title="Hapus">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTeachers.length === 0 && (
            <div className="text-center py-12 bg-surface-container-lowest">
              <p className="text-on-surface-variant text-[14px]">Tidak ada data guru yang ditemukan</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-on-surface/40 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-surface-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-semibold leading-[28px] text-on-surface">
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className={labelCls}>NIP (Nomor Induk Pegawai)</label><input type="text" placeholder="Contoh: 199001012015081001" className={inputCls} value={nip} onChange={(e) => setNip(e.target.value)} /></div>
              <div><label className={labelCls}>Nama Lengkap & Gelar *</label><input type="text" required placeholder="Contoh: Drs. Sugiyono, M.Pd" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div>
                <label className={labelCls}>Email (untuk Akun Login) *</label>
                <input type="email" required placeholder="Contoh: guru@sekolah.sch.id" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
                {!editingTeacher && email && <p className="text-[11px] text-secondary mt-1">Akun login akan dibuat otomatis dengan password: <strong>password123</strong></p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Spesialisasi Mengajar</label><input type="text" placeholder="Contoh: Matematika" className={inputCls} value={specialization} onChange={(e) => setSpecialization(e.target.value)} /></div>
                <div><label className={labelCls}>Kualifikasi / Pendidikan</label><input type="text" placeholder="Contoh: S1 Pendidikan Matematika" className={inputCls} value={qualification} onChange={(e) => setQualification(e.target.value)} /></div>
              </div>
              <div><label className={labelCls}>No. Telepon / HP</label><input type="text" placeholder="Contoh: 0812XXXXXXXX" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div><label className={labelCls}>Alamat Rumah</label><textarea placeholder="Alamat lengkap guru" rows={2} className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} /></div>
              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={submitting}>Batal</Button>
                <Button type="submit" variant="primary" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
