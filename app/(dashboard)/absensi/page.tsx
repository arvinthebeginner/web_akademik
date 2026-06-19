'use client';

import { Button } from '@/components';
import React, { useEffect, useState } from 'react';
import { FiSave, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface AttendanceRow {
  studentId: string;
  studentName: string;
  nisn: string;
  attendanceId: string | null;
  status: 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';
  notes: string;
}

interface ClassOption {
  id: string;
  name: string;
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  
  // Date selection (default to today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        if (response.ok) {
          const data = await response.json();
          setClasses(data.data);
          if (data.data.length > 0) {
            setSelectedClass(data.data[0].id);
          }
        }
      } catch (error) {
        toast.error('Gagal memuat daftar kelas');
        console.error(error);
      }
    };
    loadClasses();
  }, []);

  // Fetch daily attendance sheet when class/date changes
  const loadAttendanceSheet = async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/attendance?classId=${selectedClass}&date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRows(data.data);
      } else {
        setAttendanceRows([]);
      }
    } catch (error) {
      toast.error('Gagal memuat lembar absensi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceSheet();
  }, [selectedClass, selectedDate]);

  const handleStatusChange = (studentId: string, status: AttendanceRow['status']) => {
    setAttendanceRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, status } : row))
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceRows((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, notes } : row))
    );
  };

  const handleSaveAttendance = async () => {
    if (attendanceRows.length === 0) return;

    try {
      setSaving(true);
      const payload = {
        classId: selectedClass,
        date: selectedDate,
        records: attendanceRows.map((row) => ({
          studentId: row.studentId,
          status: row.status,
          notes: row.notes || null,
        })),
      };

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Kehadiran berhasil disimpan untuk kelas ini');
        loadAttendanceSheet();
      } else {
        const resData = await response.json();
        toast.error(resData.error || 'Gagal menyimpan absensi');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manajemen Absensi</h1>
        {attendanceRows.length > 0 && (
          <Button 
            variant="primary" 
            size="md" 
            onClick={handleSaveAttendance}
            disabled={saving}
          >
            <FiSave className="inline mr-2" /> {saving ? 'Menyimpan...' : 'Simpan Kehadiran'}
          </Button>
        )}
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 text-gray-700 transition-all duration-300 hover:shadow-md border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : attendanceRows.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center border border-gray-100 flex flex-col items-center justify-center">
          <FiAlertCircle className="text-orange-400 mb-3" size={40} />
          <h3 className="text-lg font-bold text-gray-700">Tidak Ada Siswa Terdaftar</h3>
          <p className="text-gray-400 mt-1 max-w-md text-sm">
            Pastikan kelas yang dipilih memiliki siswa terdaftar yang aktif.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    NISN
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-80">
                    Status Kehadiran
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Keterangan (Catatan)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendanceRows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                      {row.studentName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {row.nisn}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1 bg-gray-100 p-1 rounded-lg">
                        {(['HADIR', 'SAKIT', 'IZIN', 'ALPA'] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleStatusChange(row.studentId, status)}
                            className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                              row.status === status
                                ? status === 'HADIR'
                                  ? 'bg-green-600 text-white shadow-sm'
                                  : status === 'SAKIT'
                                  ? 'bg-yellow-500 text-white shadow-sm'
                                  : status === 'IZIN'
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-red-600 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="Keterangan tambahan..."
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={row.notes}
                        onChange={(e) => handleNotesChange(row.studentId, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end border-t">
            <Button 
              variant="primary" 
              size="md" 
              onClick={handleSaveAttendance}
              disabled={saving}
            >
              <FiSave className="inline mr-2" /> {saving ? 'Menyimpan...' : 'Simpan Kehadiran'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
