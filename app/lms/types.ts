export type Role = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  title?: string;
  phone?: string;
  joinedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "document" | "quiz" | "practice";
  videoUrl?: string;
  isFree?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  category: "AI" | "Data" | "Coding";
  level: "Cơ bản" | "Trung cấp" | "Nâng cao" | "Chuyên sâu";
  description: string;
  instructorId: string;
  price: number;
  durationWeeks: number;
  totalLessons: number;
  thumbnail: string;
  badge: string;
  rating: number;
  studentsCount: number;
  modules: Module[];
  createdAt: string;
}

export interface ClassRoom {
  id: string;
  code: string;
  name: string;
  courseId: string;
  teacherId: string;
  schedule: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "ongoing" | "completed";
  maxStudents: number;
  studentIds: string[];
}

export interface StudentProgress {
  studentId: string;
  classId: string;
  courseId: string;
  completedLessonIds: string[];
  lastAccessed: string;
  progressPercent: number;
}
