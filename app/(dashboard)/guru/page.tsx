'use client';

import { Button } from '@/components';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const canEdit = userRole === 'ADMIN' || userRole === 'KEPALA_SEKOLAH';
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [nip, setNip] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teachers');
      if (response.ok) { const data = await response.json(); setTeachers(data.data); }
    } catch (error) { toast.error('Gagal mengambil data guru'); console.error(error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const role = data.data?.role || '';
          setUserRole(role);
          if (role !== 'ADMIN' && role !== 'KEPALA_SEKOLAH') {
            router.push('/');
          }
        }
      } catch { /* skip */ }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTeachers();
  }, [loadTeachers]);

  const handleOpenAddModal = () => {
    setEditingTeacher(null); setNip(''); setName(''); setEmail('');
    setSpecialization(''); setQualification(''); setAddress(''); setPhone(''); setPhotoFile(null); setPhotoPreview(''); setIsModalOpen(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher); setNip(teacher.nip); setName(teacher.name);
    setEmail(teacher.email); setSpecialization(teacher.specialization);
    setQualification(teacher.qualification); setAddress(teacher.address);
    setPhone(teacher.phone); setPhotoFile(null); setPhotoPreview(''); setIsModalOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { toast.error('Ukuran foto maksimal 2MB'); return; }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
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
      if (response.ok) {
        // Upload photo if selected
        if (photoFile) {
          setUploadingPhoto(true);
          const formData = new FormData();
          formData.append('file', photoFile);
          formData.append('category', 'guru');
          await fetch('/api/upload', { method: 'POST', body: formData });
          setUploadingPhoto(false);
        }
        toast.success(editingTeacher ? 'Data guru berhasil diperbarui' : 'Guru baru berhasil ditambahkan'); setIsModalOpen(false); loadTeachers();
      }
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

  const filteredTeachers = teachers.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.nip.includes(searchTerm);
    const matchSpec = !filterSpec || t.specialization === filterSpec;
    return matchSearch && matchSpec;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / itemsPerPage));
  const pagedTeachers = filteredTeachers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uniqueSpecs = [...new Set(teachers.map(t => t.specialization).filter(Boolean))];

  const inputCls = "w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all";
  const labelCls = "block text-[12px] font-semibold leading-[16px] text-on-surface mb-1.5";

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">Manajemen Guru</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1">Kelola data guru dan informasi pengajar.</p>
        </div>
        {canEdit && (
          <button onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-container text-on-primary text-[14px] font-semibold leading-[20px] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Guru
          </button>
        )}
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 mb-stack-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="w-full md:w-1/3 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input type="text" placeholder="Cari nama atau NIP guru..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-[14px] leading-[20px] text-on-surface transition-all" />
        </div>
        <div className="flex flex-wrap w-full md:w-auto gap-3">
          <select value={filterSpec} onChange={(e) => { setFilterSpec(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-surface-border rounded-lg px-3 py-2 text-[14px] leading-[20px] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer">
            <option value="">Semua Spesialisasi</option>
            {uniqueSpecs.map((s) => <option key={s} value={s}>{s}</option>)}
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
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[140px]">NIP</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider">Nama Guru</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[160px]">Spesialisasi</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[160px]">Kelas Diampu</th>
                  <th className="px-6 py-3 text-[11px] font-bold leading-[14px] text-on-surface-variant uppercase tracking-wider w-[150px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-[14px] leading-[20px] text-on-background divide-y divide-surface-border">
                {pagedTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-surface-container-low transition-colors duration-150">
                    <td className="px-6 py-4 font-mono text-on-surface-variant">{teacher.nip || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-semibold leading-[20px]">{teacher.name}</div>
                      {teacher.qualification && <div className="text-[12px] text-outline">{teacher.qualification}</div>}
                    </td>
                    <td className="px-6 py-4">{teacher.specialization || '-'}</td>
                    <td className="px-6 py-4">{teacher.classes || '-'}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-variant transition-colors" title="View">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                      {canEdit && (
                        <>
                          <button onClick={() => handleOpenEditModal(teacher)} className="p-1.5 text-on-surface-variant hover:text-secondary rounded-md hover:bg-surface-variant transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(teacher.id)} className="p-1.5 text-on-surface-variant hover:text-danger rounded-md hover:bg-error-container transition-colors" title="Delete">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </>
                      )}
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
          {/* Pagination */}
          {filteredTeachers.length > 0 && (
            <div className="px-6 py-4 border-t border-surface-border flex items-center justify-between bg-surface">
              <div className="text-[12px] leading-[18px] text-on-surface-variant">
                Showing <span className="text-[11px] font-bold text-on-surface">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredTeachers.length)}</span> of <span className="text-[11px] font-bold text-on-surface">{filteredTeachers.length}</span>
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
                {editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div className="flex items-center gap-4 pb-2">
                <div className="w-16 h-16 rounded-full bg-surface-container-low border border-surface-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[28px] text-on-surface-variant">person</span>
                  )}
                </div>
                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-surface-border bg-surface-container-low hover:bg-surface-container text-on-surface text-[12px] font-semibold cursor-pointer transition-colors">
                    <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    {photoFile ? 'Ganti Foto' : 'Upload Foto'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
                  </label>
                  {photoFile && <p className="text-[11px] text-on-surface-variant mt-1">{photoFile.name}</p>}
                  <p className="text-[10px] text-on-surface-variant mt-0.5">JPEG, PNG, WebP (maks 2MB)</p>
                </div>
              </div>
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
                <Button type="submit" variant="primary" disabled={submitting || uploadingPhoto}>{uploadingPhoto ? 'Mengupload...' : submitting ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
