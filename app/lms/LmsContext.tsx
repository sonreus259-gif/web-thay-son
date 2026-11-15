"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import "@/lib/demoApi"; // bản tĩnh (GitHub Pages): mô phỏng /api trong trình duyệt

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface UserSession {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  avatar: string | null;
  title: string | null;
  roles: Role[];
}

export interface CourseItem {
  id: string;
  code: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  short_description: string;
  description: string;
  thumbnail: string;
  badge: string;
  price: number;
  duration_weeks: number;
  total_lessons: number;
  status: string;
  is_published: number;
  is_featured: number;
  class_count?: number;
  total_students?: number;
  created_at: string;
}

export interface TeacherAssignment {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  title: string | null;
}

export interface ClassItem {
  id: string;
  course_id: string;
  code: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  capacity: number;
  delivery_mode: string;
  status: string;
  course_title: string;
  course_code: string;
  course_thumbnail?: string;
  enrolled_count: number;
  session_count: number;
  teachers?: TeacherAssignment[];
  created_at: string;
}

export interface SessionItem {
  id: string;
  class_id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  teacher_id: string | null;
  delivery_mode: string;
  room_id: string | null;
  meeting_url: string | null;
  status: string;
  note: string | null;
  class_name: string;
  class_code: string;
  course_title: string;
  room_name?: string;
  room_location?: string;
  teacher_name?: string;
  teacher_email?: string;
}

export interface RoomItem {
  id: string;
  name: string;
  location: string | null;
  capacity: number;
  status: string;
}

export interface LmsUserItem {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  avatar: string | null;
  title: string | null;
  roles: Role[];
  created_at: string;
}

interface LmsContextType {
  currentUser: UserSession | null;
  activeRole: Role;
  switchActiveRole: (role: Role) => void;
  isLoadingUser: boolean;
  logout: () => Promise<void>;

  // Data
  courses: CourseItem[];
  classes: ClassItem[];
  sessions: SessionItem[];
  rooms: RoomItem[];
  users: LmsUserItem[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;

  // Course actions
  createCourse: (data: Partial<CourseItem>) => Promise<{ success: boolean; error?: string }>;
  updateCourse: (id: string, data: Partial<CourseItem>) => Promise<{ success: boolean; error?: string }>;
  deleteCourse: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Class actions
  createClass: (data: {
    courseId: string;
    code: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    capacity?: number;
    deliveryMode?: string;
    status?: string;
    teacherIds?: string[];
  }) => Promise<{ success: boolean; error?: string }>;
  updateClass: (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  deleteClass: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Enrollment actions
  enrollStudents: (classId: string, userIds: string[]) => Promise<{ success: boolean; error?: string }>;
  removeEnrollment: (classId: string, userId: string) => Promise<{ success: boolean; error?: string }>;

  // Session actions
  createSession: (data: {
    classId: string;
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    teacherId?: string;
    deliveryMode?: string;
    roomId?: string;
    meetingUrl?: string;
    status?: string;
    note?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateSession: (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  deleteSession: (id: string) => Promise<{ success: boolean; error?: string }>;

  // User actions
  createUser: (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    roleCodes: string[];
    title?: string;
    status?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (id: string, data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
}

const LmsContext = createContext<LmsContextType | null>(null);

export function LmsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeRole, setActiveRole] = useState<Role>("ADMIN");
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [users, setUsers] = useState<LmsUserItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // 1. Fetch authenticated user session
  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setCurrentUser(null);
        setIsLoadingUser(false);
        return null;
      }
      const data = await res.json();
      setCurrentUser(data.user);

      // Set active role: keep saved if valid, else pick highest priority role
      const savedActive = localStorage.getItem("lms_active_role") as Role;
      if (savedActive && data.user.roles.includes(savedActive)) {
        setActiveRole(savedActive);
      } else if (data.user.roles.includes("ADMIN")) {
        setActiveRole("ADMIN");
      } else if (data.user.roles.includes("TEACHER")) {
        setActiveRole("TEACHER");
      } else if (data.user.roles.includes("STUDENT")) {
        setActiveRole("STUDENT");
      }

      setIsLoadingUser(false);
      return data.user;
    } catch {
      setCurrentUser(null);
      setIsLoadingUser(false);
      return null;
    }
  }, []);

  // 2. Fetch real data from APIs based on current role/user
  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [coursesRes, classesRes, sessionsRes, roomsRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/classes"),
        fetch("/api/sessions"),
        fetch("/api/rooms"),
      ]);

      if (coursesRes.ok) {
        const d = await coursesRes.json();
        setCourses(d.courses || []);
      }
      if (classesRes.ok) {
        const d = await classesRes.json();
        setClasses(d.classes || []);
      }
      if (sessionsRes.ok) {
        const d = await sessionsRes.json();
        setSessions(d.sessions || []);
      }
      if (roomsRes.ok) {
        const d = await roomsRes.json();
        setRooms(d.rooms || []);
      }

      // If user has ADMIN or TEACHER role, also fetch users
      const usersRes = await fetch("/api/users");
      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users || []);
      }
    } catch (err) {
      console.error("Error refreshing LMS data:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchUser().then((u) => {
      if (u) {
        refreshData();
      }
    });
  }, [fetchUser, refreshData]);

  // Switch active role (Only among roles the user genuinely possesses)
  const switchActiveRole = (role: Role) => {
    if (!currentUser || !currentUser.roles.includes(role)) return;
    setActiveRole(role);
    localStorage.setItem("lms_active_role", role);
    refreshData();
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setCurrentUser(null);
      localStorage.removeItem("lms_active_role");
      router.push("/login");
      router.refresh();
    }
  };

  // Course actions
  const createCourse = async (data: Partial<CourseItem>) => {
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  const updateCourse = async (id: string, data: Partial<CourseItem>) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  // Class actions
  const createClass = async (data: {
    courseId: string;
    code: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    capacity?: number;
    deliveryMode?: string;
    status?: string;
    teacherIds?: string[];
  }) => {
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  const updateClass = async (id: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  const deleteClass = async (id: string) => {
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  // Enrollment actions
  const enrollStudents = async (classId: string, userIds: string[]) => {
    try {
      const res = await fetch(`/api/classes/${classId}/enrollments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds }),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  const removeEnrollment = async (classId: string, userId: string) => {
    try {
      const res = await fetch(`/api/classes/${classId}/enrollments/${userId}`, {
        method: "DELETE",
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  // Session actions
  const createSession = async (data: {
    classId: string;
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    teacherId?: string;
    deliveryMode?: string;
    roomId?: string;
    meetingUrl?: string;
    status?: string;
    note?: string;
  }) => {
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  const updateSession = async (id: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  // User actions
  const createUser = async (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    roleCodes: string[];
    title?: string;
    status?: string;
  }) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  const updateUser = async (id: string, data: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (!res.ok) return { success: false, error: d.error };
      await refreshData();
      return { success: true };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  };

  return (
    <LmsContext.Provider
      value={{
        currentUser,
        activeRole,
        switchActiveRole,
        isLoadingUser,
        logout,

        courses,
        classes,
        sessions,
        rooms,
        users,
        isLoadingData,
        refreshData,

        createCourse,
        updateCourse,
        deleteCourse,

        createClass,
        updateClass,
        deleteClass,

        enrollStudents,
        removeEnrollment,

        createSession,
        updateSession,
        deleteSession,

        createUser,
        updateUser,
      }}
    >
      {children}
    </LmsContext.Provider>
  );
}

export function useLms() {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error("useLms must be used within an LmsProvider");
  }
  return context;
}
