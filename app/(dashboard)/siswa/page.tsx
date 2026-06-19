'use client';

import { Button } from '@/components';
import React, { useCallback, useEffect, useState } from 'react';
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
  class?: { id: string; name: string };
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
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const resStudents = await fetch('/api/students');
      if (resStudents.ok) { const data = await resStudents.json(); setStudents(data.data); }
      const resClasses = await fetch('/api/classes');
      if (resClasses.ok) { const data = await resClasses.json(); setClasses(data.data); }
    } catch (error) { toast.error('Gagal mengambil data dari database'); console.error(error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingStudent(null); setNisn(''); setNis(''); setName(''); setEmail('');
    setGender('L'); setDateOfBirth(''); setAddress(''); setPhone('');
    setClassId(classes[0]?.id || ''); setStatus('AKTIF'); setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student); setNisn(student.nisn); setNis(student.nis || '');
    setName(student.name); setEmail(student.email || ''); setGender(student.gender);
    setDateOfBirth(student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '');
    setAddress(student.address || ''); setPhone(student.phone || '');
    setClassId(student.classId); setStatus(student.status); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn || !name || !dateOfBirth || !classId) { toast.error('Harap isi field yang wajib!'); return; }
    try {
      setSubmitting(true);
      const payload = { nisn, nis: nis || null, name, email: email || null, gender, dateOfBirth, address: address || null, phone: phone || null, classId, status };
      const url = editingStudent ? `/api/students/${editingStudent.id}` : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const resData = await response.json();
      if (response.ok) { toast.success(editingStudent ? 'Data siswa berhasil diperbarui' : 'Siswa baru berhasil ditambahkan'); setIsModalOpen(false); loadData(); }
      else { toast.error(resData.error || 'Terjadi kesalahan'); }
    } catch (error) { toast.error('Gagal memproses data'); console.error(error); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;
    try {
      const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (response.ok) { toast.success('Siswa berhasil dihapus'); loadData(); }
      else { const resData = await response.json(); toast.error(resData.error || 'Gagal menghapus siswa'); }
    } catch (error) { toast.error('Terjadi kesalahan koneksi'); console.error(error); }
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm);
    const matchClass = !filterClass || s.classId === filterClass;
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchClass && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage));
  const pagedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusBadge = (s: Student['status']) => {
    const map = {
      AKTIF: 'bg-success/10 text-success border-success/20',
      LULUS: 'bg-secondary/10 text-secondary border-secondary/20',
      PINDAH: 'bg-warning/10 text-warning border-warning/20',
      TIDAK_AKTIF: 'bg-danger/10 text-danger border-danger/20',
    };
    return map[s] || map.AKTIF;
  };

  const inputCls = "w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all";
  const labelCls = "block text-[12px] font-semibold leading-[16px] text-on-surface mb-1.5";

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">Manajemen Siswa</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1">Kelola data siswa, status, dan informasi akademik.</p>
        </div>
        <button onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-container text-on-primary text-[14px] font-semibold leading-[20px] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Siswa
        </button>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 mb-stack-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="w-full md:w-1/3 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input type="text" placeholder="Cari NISN atau Nama..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-[14px] leading-[20px] text-on-surface transition-all" />
        </div>
        <div className="flex flex-wrap w-full md:w-auto gap-3">
          <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-surface-border rounded-lg px-3 py-2 text-[14px] leading-[20px] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer">
            <option value="">Semua Kelas</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-surface-border rounded-lg px-3 py-2 text-[14px] leading-[20px] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer">
            <option value="">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="TIDAK_AKTIF">Non-Aktif</option>
            <option value="LULUS">Lulus</option>
            <option value="PINDAH">Pindah</option>
          </select>
          <button className="bg-surface-container-low border border-surface-border hover:bg-surface-container text-on-surface text-[12px] leading-[16px] font-semibold px-3 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Filter
          </button>
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
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[120px]">NISN</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[150px]">Kelas</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[120px]">Status</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[150px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[14px] leading-[20px] text-on-background divide-y divide-surface-border">
                {pagedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-surface-container-low transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-on-surface-variant">{student.nisn}</td>
                    <td className="px-6 py-4 text-[14px] font-semibold leading-[20px]">{student.name}</td>
                    <td className="px-6 py-4">{student.class?.name || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold border ${statusBadge(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-variant transition-colors" title="View">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      <button onClick={() => handleOpenEditModal(student)} className="p-1.5 text-on-surface-variant hover:text-secondary rounded-md hover:bg-surface-variant transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="p-1.5 text-on-surface-variant hover:text-danger rounded-md hover:bg-error-container transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12 bg-surface-container-lowest">
              <p className="text-on-surface-variant text-[14px]">Tidak ada data siswa yang ditemukan</p>
            </div>
          )}
          {/* Pagination */}
          {filteredStudents.length > 0 && (
            <div className="px-6 py-4 border-t border-surface-border flex items-center justify-between bg-surface">
              <div className="text-[12px] leading-[18px] text-on-surface-variant">
                Showing <span className="text-[11px] font-bold text-on-surface">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="text-[11px] font-bold text-on-surface">{filteredStudents.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-1 border border-surface-border rounded hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-[11px] font-bold transition-colors ${
                        currentPage === page
                          ? 'border-primary bg-primary-container text-on-primary-container'
                          : 'border-surface-border hover:bg-surface-container-low text-on-surface'
                      }`}>
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && <span className="px-2 text-on-surface-variant">...</span>}
                {totalPages > 5 && (
                  <button onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-1 border border-surface-border hover:bg-surface-container-low text-[11px] font-bold rounded text-on-surface transition-colors">
                    {totalPages}
                  </button>
                )}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-1 border border-surface-border rounded hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
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
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>NISN *</label><input type="text" required placeholder="Contoh: 0012345001" className={inputCls} value={nisn} onChange={(e) => setNisn(e.target.value)} /></div>
                <div><label className={labelCls}>NIS</label><input type="text" placeholder="Contoh: 23241001" className={inputCls} value={nis} onChange={(e) => setNis(e.target.value)} /></div>
              </div>
              <div><label className={labelCls}>Nama Lengkap *</label><input type="text" required placeholder="Nama lengkap siswa" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div>
                <label className={labelCls}>Email (untuk Akun Login)</label>
                <input type="email" placeholder="Contoh: siswa@sekolah.sch.id" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
                {!editingStudent && email && <p className="text-[11px] text-secondary mt-1">Akun login akan dibuat otomatis dengan password: <strong>password123</strong></p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Jenis Kelamin *</label><select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value as 'L' | 'P')}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                <div><label className={labelCls}>Tanggal Lahir *</label><input type="date" required className={inputCls} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Kelas *</label><select required className={inputCls} value={classId} onChange={(e) => setClassId(e.target.value)}>{classes.length === 0 ? <option value="">Tidak ada kelas tersedia</option> : classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className={labelCls}>Status Keaktifan</label><select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Student['status'])}><option value="AKTIF">AKTIF</option><option value="PINDAH">PINDAH</option><option value="LULUS">LULUS</option><option value="TIDAK_AKTIF">TIDAK AKTIF</option></select></div>
              </div>
              <div><label className={labelCls}>No. Telepon / HP</label><input type="text" placeholder="Contoh: 0812XXXXXXXX" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div><label className={labelCls}>Alamat Rumah</label><textarea placeholder="Alamat lengkap siswa" rows={2} className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} /></div>
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
