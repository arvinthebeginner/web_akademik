'use client';

import { Button } from '@/components';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  dueDate: string;
  totalSubmissions: number;
  createdAt: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

export default function TugasPage() {
  const [userRole, setUserRole] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const canEdit = userRole === 'ADMIN' || userRole === 'GURU';

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assignments');
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data tugas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubjects = useCallback(async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.data);
        if (data.data.length > 0 && !subjectId) setSubjectId(data.data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  }, [subjectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAssignments();
    loadSubjects();
  }, [loadAssignments, loadSubjects]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) { const data = await res.json(); setUserRole(data.data?.role || ''); }
      } catch { /* skip */ }
    };
    fetchUser();
  }, []);

  const handleOpenAddModal = () => {
    setEditingAssignment(null);
    setTitle(''); setDescription(''); setDueDate('');
    if (subjects.length > 0) setSubjectId(subjects[0].id);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (a: Assignment) => {
    setEditingAssignment(a);
    setTitle(a.title); setDescription(a.description);
    setSubjectId(a.subjectId);
    setDueDate(a.dueDate.split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subjectId || !dueDate) { toast.error('Judul, Mata Pelajaran, dan Deadline wajib diisi!'); return; }
    try {
      setSubmitting(true);
      const payload = { title, description: description || null, subjectId, dueDate };
      const url = editingAssignment ? `/api/assignments/${editingAssignment.id}` : '/api/assignments';
      const method = editingAssignment ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const resData = await response.json();
      if (response.ok) {
        toast.success(editingAssignment ? 'Tugas berhasil diperbarui' : 'Tugas baru berhasil ditambahkan');
        setIsModalOpen(false);
        loadAssignments();
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
    if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
    try {
      const response = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      if (response.ok) { toast.success('Tugas berhasil dihapus'); loadAssignments(); }
      else { const resData = await response.json(); toast.error(resData.error || 'Gagal menghapus tugas'); }
    } catch (error) { toast.error('Terjadi kesalahan koneksi'); console.error(error); }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = !filterSubject || a.subjectId === filterSubject;
    return matchSearch && matchSubject;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / itemsPerPage));
  const pagedItems = filteredAssignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const uniqueSubjects = [...new Set(assignments.map(a => ({ id: a.subjectId, name: a.subjectName })))].reduce((acc, s) => {
    if (!acc.find(x => x.id === s.id)) acc.push(s);
    return acc;
  }, [] as { id: string; name: string }[]);

  const totalTugas = assignments.length;
  const totalSubmissions = assignments.reduce((s, a) => s + a.totalSubmissions, 0);
  const overdueCount = assignments.filter(a => new Date(a.dueDate) < new Date()).length;

  const inputCls = "w-full px-3 py-2 border border-surface-border rounded-lg bg-surface-container-lowest text-[14px] leading-[20px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all";
  const labelCls = "block text-[12px] font-semibold leading-[16px] text-on-surface mb-1.5";

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isOverdue = (dateStr: string) => new Date(dateStr) < new Date();
  const isUpcoming = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // 3 days
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.02em] text-on-background">{canEdit ? 'Manajemen Tugas' : 'Daftar Tugas'}</h1>
          <p className="text-[14px] leading-[20px] text-on-surface-variant mt-1">{canEdit ? 'Kelola tugas, pengumpulan, dan penilaian tugas siswa.' : 'Lihat daftar tugas dan deadline yang diberikan guru.'}</p>
        </div>
        {canEdit && (
          <button onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-container text-on-primary text-[14px] font-semibold leading-[20px] px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Tugas
          </button>
        )}
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 mb-stack-md flex flex-col md:flex-row gap-4 items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div className="w-full md:w-1/3 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input type="text" placeholder="Cari judul tugas atau guru..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-[14px] leading-[20px] text-on-surface transition-all" />
        </div>
        <div className="flex flex-wrap w-full md:w-auto gap-3">
          <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-surface-border rounded-lg px-3 py-2 text-[14px] leading-[20px] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer">
            <option value="">Semua Mata Pelajaran</option>
            {uniqueSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="bg-surface-container-low border border-surface-border hover:bg-surface-container text-on-surface text-[12px] leading-[16px] font-semibold px-3 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Filter
          </button>
        </div>
      </div>

      {/* Card Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-surface-border border-t-secondary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {pagedItems.map((a) => (
            <div key={a.id} className="bg-surface-container-lowest rounded-xl border border-surface-border p-6 flex flex-col hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-surface-container opacity-30 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-secondary-container text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">{a.subjectCode}</span>
                    <p className="text-[12px] leading-[16px] text-on-surface-variant">{a.subjectName}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-variant transition-colors" title="View">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                  {canEdit && (
                    <>
                      <button onClick={() => handleOpenEditModal(a)} className="p-1.5 text-on-surface-variant hover:text-secondary rounded-md hover:bg-surface-variant transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 text-on-surface-variant hover:text-danger rounded-md hover:bg-error-container transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <h3 className="text-[16px] font-semibold leading-[24px] text-on-surface mb-2">{a.title}</h3>
              {a.description && <p className="text-[12px] leading-[18px] text-on-surface-variant mb-4 line-clamp-2">{a.description}</p>}
              <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    {a.teacherName}
                  </span>
                  <span className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    {a.totalSubmissions} dikumpulkan
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">schedule</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    isOverdue(a.dueDate)
                      ? 'bg-danger/10 text-danger border-danger/20'
                      : isUpcoming(a.dueDate)
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-success/10 text-success border-success/20'
                  }`}>
                    Deadline: {formatDate(a.dueDate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredAssignments.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-on-surface-variant text-[14px]">Tidak ada tugas yang ditemukan</p>
        </div>
      )}

      {/* Pagination */}
      {filteredAssignments.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-[12px] leading-[18px] text-on-surface-variant">
            Showing <span className="text-[11px] font-bold text-on-surface">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredAssignments.length)}</span> of <span className="text-[11px] font-bold text-on-surface">{filteredAssignments.length}</span>
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
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="p-1 border border-surface-border rounded hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {!loading && filteredAssignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-gutter">
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">assignment</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Tugas</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{totalTugas}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <span className="material-symbols-outlined">upload_file</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Total Pengumpulan</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{totalSubmissions}</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-surface-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
              <span className="material-symbols-outlined">event_busy</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Terlewat Deadline</p>
              <p className="text-[20px] font-semibold leading-[28px] text-on-background">{overdueCount}</p>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-on-surface/40 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-surface-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[20px] font-semibold leading-[28px] text-on-surface">
                {editingAssignment ? 'Edit Tugas' : 'Tambah Tugas Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelCls}>Judul Tugas *</label>
                <input type="text" required placeholder="Contoh: Latihan Soal Bab 3" className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Deskripsi</label>
                <textarea placeholder="Deskripsi dan instruksi tugas..." rows={3} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Mata Pelajaran *</label>
                  <select className={inputCls} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Deadline *</label>
                  <input type="date" required className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
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
