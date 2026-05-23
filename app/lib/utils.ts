import { ApiResponse } from '@/types';

export function successResponse<T>(
  data?: T,
  message: string = 'Success'
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(error: string): ApiResponse<null> {
  return {
    success: false,
    error,
  };
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getGradeFromScore(score: number): string {
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 55) return 'D';
  return 'E';
}

export function getScoreRangeFromGrade(grade: string): [number, number] {
  const ranges: { [key: string]: [number, number] } = {
    A: [85, 100],
    B: [75, 84],
    C: [65, 74],
    D: [55, 64],
    E: [0, 54],
  };
  return ranges[grade] || [0, 100];
}

export const ATTENDANCE_STATUS_LABELS: { [key: string]: string } = {
  HADIR: 'Hadir',
  SAKIT: 'Sakit',
  IZIN: 'Izin',
  ALPA: 'Alpa',
};

export const USER_ROLE_LABELS: { [key: string]: string } = {
  ADMIN: 'Administrator',
  KEPALA_SEKOLAH: 'Kepala Sekolah',
  GURU: 'Guru',
  SISWA: 'Siswa',
  ORANG_TUA: 'Orang Tua',
};
