// User & Authentication Types
export type UserRole = 'ADMIN' | 'KEPALA_SEKOLAH' | 'GURU' | 'SISWA' | 'ORANG_TUA';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user?: User;
  expires: string;
}

// Student Types
export interface Student {
  id: string;
  nisn: string;
  nis?: string;
  name: string;
  email?: string;
  gender: 'L' | 'P';
  dateOfBirth: Date;
  address?: string;
  phone?: string;
  classId: string;
  parentId?: string;
  status: 'AKTIF' | 'PINDAH' | 'LULUS' | 'TIDAK_AKTIF';
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Teacher Types
export interface Teacher {
  id: string;
  nip?: string;
  name: string;
  email?: string;
  specialization?: string;
  qualification?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  gradeLevel: string;
  capacity: number;
  homeRoomTeacherId?: string;
  academicYearId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subject Types
export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  creditHours: number;
  createdAt: Date;
  updatedAt: Date;
}

// Grade Types
export type GradeType = 'FORMATIF' | 'SUMATIF' | 'SEMESTER';

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  semesterId: string;
  score: number;
  letterGrade?: 'A' | 'B' | 'C' | 'D' | 'E';
  type: GradeType;
  notes?: string;
  recordedBy: string; // Teacher ID
  createdAt: Date;
  updatedAt: Date;
}

// Attendance Types
export type AttendanceStatus = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string; // Teacher ID
  createdAt: Date;
  updatedAt: Date;
}

// Assignment Types
export interface Assignment {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: Date;
  createdBy: string; // Teacher ID
  createdAt: Date;
  updatedAt: Date;
}

// Submission Types
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  filePath?: string;
  notes?: string;
  grade?: number;
  feedback?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Academic Year & Semester Types
export interface AcademicYear {
  id: string;
  year: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Semester {
  id: string;
  academicYearId: string;
  semester: 1 | 2;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
