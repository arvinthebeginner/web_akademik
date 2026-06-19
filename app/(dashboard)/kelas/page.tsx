'use client';

import { Button } from '@/components';
import React, { useCallback, useEffect, useState } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('10');
  const [capacity, setCapacity] = useState('40');
  const [homeRoomTeacherId, setHomeRoomTeacherId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const resClasses = await fetch('/api/classes');
      if (resClasses.ok) { const data = await resClasses.json(); setClasses(data.data); }
      const resTeachers = await fetch('/api/teachers');
      if (resTeachers.ok) { const data = await resTeachers.json(); setTeachers(data.data); }
    } catch (error) { toast.error('Gagal mengambil data kelas/guru'); console.error(error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingClass(null); setName(''); setGradeLevel('10'); setCapacity('40');
    setHomeRoomTeacherId(teachers[0]?.id || ''); setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls: Class) => {
    setEditingClass(cls); setName(cls.name); setGradeLevel(cls.gradeLevel);
    setCapacity(String(cls.capacity)); setHomeRoomTeacherId(cls.homeRoomTeacherId || ''); setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gradeLevel || !capacity) { toast.error('Nama, Tingkatan, dan Kapasitas kelas wajib diisi!'); return; }
    try {
      setSubmitting(true);
      const payload = { name, gradeLevel, capacity, homeRoomTeacherId: homeRoomTeacherId || null };
      const url = editingClass ? `/api/classes/${editingClass.id}` : '/api/classes';
      const method = editingClass ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const resData = await response.json();
      if (response.ok) { toast.success(editingClass ? 'Kelas berhasil diperbarui' : 'Kelas baru berhasil ditambahkan'); setIsModalOpen(false); loadData(); }
      else { toast.error(resData.error || 'Terjadi kesalahan'); }
    } catch (error) { toast.error('Gagal memproses data'); console.error(error); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return;
    try {
      const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
      if (response.ok) { toast.success('Kelas berhasil dihapus'); loadData(); }
      else { const resData = await response.json(); toast.error(resData.error || 'Gagal menghapus kelas'); }
    } catch (error) { toast.error('Terjadi kesalahan koneksi'); console.error(error); }
  };

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.homeRoomTeacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = "w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all";
  const labelCls = "block text-[12px] font-semibold leading-[16px] text-on-surface mb-1.5";

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">Manajemen Kelas</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1">Kelola kelas, kapasitas, dan wali kelas.</p>
        </div>
        <button onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-container text-on-primary text-[14px] font-semibold leading-[20px] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Kelas
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 mb-stack-md shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="w-full md:w-1/3 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input type="text" placeholder="Cari nama kelas atau guru pembimbing..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-[14px] leading-[20px] text-on-surface transition-all" />
        </div>
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-surface-border border-t-secondary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 flex flex-col hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface">{cls.name}</h3>
                  <p className="text-[12px] leading-[18px] text-on-surface-variant mt-1">Tingkat {cls.gradeLevel}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEditModal(cls)} className="p-1.5 text-on-surface-variant hover:text-secondary rounded-md hover:bg-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button onClick={() => handleDelete(cls.id)} className="p-1.5 text-on-surface-variant hover:text-danger rounded-md hover:bg-error-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-[14px] text-on-surface-variant mb-6">
                <p><strong className="text-on-surface">Wali Kelas:</strong> {cls.homeRoomTeacher}</p>
                <p><strong className="text-on-surface">Kapasitas:</strong> {cls.totalStudents}/{cls.capacity} Siswa</p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
                  <div className="bg-secondary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((cls.totalStudents / cls.capacity) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredClasses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-on-surface-variant text-[14px]">Tidak ada data kelas yang ditemukan</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-on-surface/40 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-6 border border-surface-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-semibold leading-[28px] text-on-surface">
                {editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className={labelCls}>Nama Kelas *</label><input type="text" required placeholder="Contoh: XII IPA 1, X B" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Tingkatan *</label><select className={inputCls} value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}><option value="10">Kelas 10 (X)</option><option value="11">Kelas 11 (XI)</option><option value="12">Kelas 12 (XII)</option></select></div>
                <div><label className={labelCls}>Kapasitas (Siswa) *</label><input type="number" required min="1" className={inputCls} value={capacity} onChange={(e) => setCapacity(e.target.value)} /></div>
              </div>
              <div><label className={labelCls}>Wali Kelas / Pembimbing</label><select className={inputCls} value={homeRoomTeacherId} onChange={(e) => setHomeRoomTeacherId(e.target.value)}><option value="">-- Pilih Wali Kelas --</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
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
