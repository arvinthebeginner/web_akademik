'use client';

import { Button } from '@/components';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  const canEdit = userRole === 'ADMIN' || userRole === 'GURU' || userRole === 'KEPALA_SEKOLAH';
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
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
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          const role = data.data?.role || '';
          setUserRole(role);
          if (role !== 'ADMIN' && role !== 'GURU' && role !== 'KEPALA_SEKOLAH') {
            router.push('/');
          }
        }
      } catch { /* skip */ }
    };
    fetchUser();
  }, [router]);

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

  const filteredClasses = classes.filter((cls) => {
    const matchSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.homeRoomTeacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrade = !filterGrade || cls.gradeLevel === filterGrade;
    return matchSearch && matchGrade;
  });

  const uniqueGrades = [...new Set(classes.map(c => c.gradeLevel))].sort();
  const totalKelas = classes.length;
  const totalSiswa = classes.reduce((s, c) => s + c.totalStudents, 0);
  const avgCapacity = totalKelas > 0 ? Math.round(classes.reduce((s, c) => s + c.capacity, 0) / totalKelas) : 0;

  const inputCls = "w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all";
  const labelCls = "block text-[12px] font-semibold leading-[16px] text-on-surface mb-1.5";

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">Manajemen Kelas</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1">Kelola kelas, kapasitas, dan wali kelas.</p>
        </div>
        {canEdit && (
          <button onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-container text-on-primary text-[14px] font-semibold leading-[20px] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Kelas
          </button>
        )}
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 mb-stack-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="w-full md:w-1/3 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input type="text" placeholder="Cari nama kelas atau guru pembimbing..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-[14px] leading-[20px] text-on-surface transition-all" />
        </div>
        <div className="flex flex-wrap w-full md:w-auto gap-3">
          <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}
            className="bg-white border border-surface-border rounded-lg px-3 py-2 text-[14px] leading-[20px] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer">
            <option value="">Semua Tingkatan</option>
            {uniqueGrades.map((g) => <option key={g} value={g}>Kelas {g}</option>)}
          </select>
          <button className="bg-surface-container-low border border-surface-border hover:bg-surface-container text-on-surface text-[12px] leading-[16px] font-semibold px-3 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-surface-border border-t-secondary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {filteredClasses.map((cls) => {
            const pct = Math.min(Math.round((cls.totalStudents / cls.capacity) * 100), 100);
            const barColor = pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-success';
            return (
              <div key={cls.id} className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 flex flex-col hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-surface-container opacity-30 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-primary-container text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                    </div>
                    <div>
                      <h3 className="text-[20px] font-semibold leading-[28px] text-on-surface">{cls.name}</h3>
                      <p className="text-[12px] leading-[18px] text-on-surface-variant">Tingkat {cls.gradeLevel}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-variant transition-colors" title="View">
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    {canEdit && (
                      <>
                        <button onClick={() => handleOpenEditModal(cls)} className="p-1.5 text-on-surface-variant hover:text-secondary rounded-md hover:bg-surface-variant transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button onClick={() => handleDelete(cls.id)} className="p-1.5 text-on-surface-variant hover:text-danger rounded-md hover:bg-error-container transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-[14px] text-on-surface-variant mb-6">
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    <strong className="text-on-surface">Wali Kelas:</strong> {cls.homeRoomTeacher || '-'}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                    <strong className="text-on-surface">Kapasitas:</strong> {cls.totalStudents}/{cls.capacity} Siswa
                    <span className={`ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      pct >= 90 ? 'bg-danger/10 text-danger border-danger/20' : pct >= 70 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'
                    }`}>{pct}%</span>
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="w-full bg-surface-container-low rounded-full h-2 overflow-hidden">
                    <div className={`${barColor} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredClasses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-on-surface-variant text-[14px]">Tidak ada data kelas yang ditemukan</p>
        </div>
      )}

      {/* Quick Stats */}
      {!loading && filteredClasses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-gutter">
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Kelas</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{totalKelas}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Siswa</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{totalSiswa}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">analytics</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Rata-rata Kapasitas</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{avgCapacity}</p>
            </div>
          </div>
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
