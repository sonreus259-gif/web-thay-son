import { getDb } from "./db";
import { hashPassword } from "./auth";

export function seedDatabase() {
  const db = getDb();

  // Check if roles exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingRole = db.prepare("SELECT code FROM roles WHERE code = 'ADMIN'").get() as any;
  if (!existingRole) {
    db.prepare("INSERT INTO roles (id, code, name, description) VALUES (?, ?, ?, ?)").run(
      "role-admin",
      "ADMIN",
      "Quản trị viên",
      "Toàn quyền quản trị hệ thống đào tạo LMS"
    );
    db.prepare("INSERT INTO roles (id, code, name, description) VALUES (?, ?, ?, ?)").run(
      "role-teacher",
      "TEACHER",
      "Giảng viên",
      "Quản lý lớp học và lịch giảng được phân công"
    );
    db.prepare("INSERT INTO roles (id, code, name, description) VALUES (?, ?, ?, ?)").run(
      "role-student",
      "STUDENT",
      "Học viên",
      "Học tập và theo dõi tiến độ các lớp được ghi danh"
    );
  }

  // Check if users exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userCount = db.prepare("SELECT COUNT(*) as cnt FROM users").get() as any;
  if (userCount.cnt === 0) {
    const now = new Date().toISOString();

    // 1. Admin
    const adminPass = hashPassword("Admin@123456");
    db.prepare(`
      INSERT INTO users (id, full_name, email, phone, password_hash, status, avatar, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "usr-admin",
      "Quản Trị Viên LMS",
      "admin@thayson.edu.vn",
      "0988001001",
      adminPass,
      "ACTIVE",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      "Quản trị hệ thống đào tạo",
      now,
      now
    );
    db.prepare("INSERT INTO user_roles (id, user_id, role_code, created_at) VALUES (?, ?, ?, ?)").run(
      "ur-admin-1",
      "usr-admin",
      "ADMIN",
      now
    );
    db.prepare("INSERT INTO user_roles (id, user_id, role_code, created_at) VALUES (?, ?, ?, ?)").run(
      "ur-admin-2",
      "usr-admin",
      "TEACHER",
      now
    );

    // 2. Teacher: Thầy Đỗ Trường Sơn
    const teacherPass = hashPassword("Teacher@123456");
    db.prepare(`
      INSERT INTO users (id, full_name, email, phone, password_hash, status, avatar, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "usr-teacher-son",
      "Thầy Đỗ Trường Sơn",
      "son.ai@thayson.edu.vn",
      "0912345678",
      teacherPass,
      "ACTIVE",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      "Chuyên gia Đào tạo AI & Data Science",
      now,
      now
    );
    db.prepare("INSERT INTO user_roles (id, user_id, role_code, created_at) VALUES (?, ?, ?, ?)").run(
      "ur-teacher-1",
      "usr-teacher-son",
      "TEACHER",
      now
    );

    // 3. Student 1: Nguyễn Văn An
    const studentPass = hashPassword("Student@123456");
    db.prepare(`
      INSERT INTO users (id, full_name, email, phone, password_hash, status, avatar, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "usr-student-an",
      "Nguyễn Văn An",
      "student1@thayson.edu.vn",
      "0909123456",
      studentPass,
      "ACTIVE",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      "Học viên AI K01",
      now,
      now
    );
    db.prepare("INSERT INTO user_roles (id, user_id, role_code, created_at) VALUES (?, ?, ?, ?)").run(
      "ur-student-1",
      "usr-student-an",
      "STUDENT",
      now
    );

    // 4. Student 2: Trần Thị Mai
    db.prepare(`
      INSERT INTO users (id, full_name, email, phone, password_hash, status, avatar, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "usr-student-mai",
      "Trần Thị Mai",
      "student2@thayson.edu.vn",
      "0909876543",
      studentPass,
      "ACTIVE",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      "Học viên Data Science",
      now,
      now
    );
    db.prepare("INSERT INTO user_roles (id, user_id, role_code, created_at) VALUES (?, ?, ?, ?)").run(
      "ur-student-2",
      "usr-student-mai",
      "STUDENT",
      now
    );

    // 5. Rooms
    db.prepare(`
      INSERT INTO rooms (id, name, location, capacity, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      "room-lab-01",
      "Phòng AI Lab 01",
      "Tầng 3 - Tòa nhà Tech Hub",
      35,
      "ACTIVE",
      now,
      now
    );

    // 6. Courses
    db.prepare(`
      INSERT INTO courses (id, code, title, slug, category, level, short_description, description, thumbnail, badge, price, duration_weeks, total_lessons, status, is_published, is_featured, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "course-genai",
      "AI-PRO",
      "Generative AI & AI Agents Masterclass",
      "generative-ai-ai-agents",
      "AI",
      "Chuyên sâu",
      "Làm chủ LLMs, xây dựng AI Agents tự hành và tự động hóa quy trình nghiệp vụ.",
      "Chương trình đào tạo toàn diện về Trí tuệ nhân tạo thế hệ mới (Generative AI), Fine-tuning, RAG và Multi-Agent Systems.",
      "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500",
      "HOT • THỰC CHIẾN",
      4500000,
      8,
      24,
      "PUBLISHED",
      1,
      1,
      now,
      now
    );

    // 7. Class
    db.prepare(`
      INSERT INTO classes (id, course_id, code, name, description, start_date, end_date, capacity, delivery_mode, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "class-ai-k01",
      "course-genai",
      "AI-K01",
      "Lớp Chuyên Sâu Generative AI & AI Agents K01",
      "Lớp đào tạo thực chiến buổi tối thứ 3 - thứ 5 do Thầy Đỗ Trường Sơn trực tiếp hướng dẫn.",
      "2026-10-06",
      "2026-11-28",
      30,
      "HYBRID",
      "ONGOING",
      now,
      now
    );

    // 8. ClassTeacher
    db.prepare(`
      INSERT INTO class_teachers (id, class_id, user_id, created_at)
      VALUES (?, ?, ?, ?)
    `).run(
      "ct-1",
      "class-ai-k01",
      "usr-teacher-son",
      now
    );

    // 9. Enrollment: Enroll student1 into AI-K01
    db.prepare(`
      INSERT INTO enrollments (id, user_id, class_id, status, enrolled_at, progress_percent, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "enr-1",
      "usr-student-an",
      "class-ai-k01",
      "ACTIVE",
      now,
      25,
      now,
      now
    );

    // 10. ClassSessions (2 Buổi học)
    db.prepare(`
      INSERT INTO class_sessions (id, class_id, title, description, start_at, end_at, teacher_id, delivery_mode, room_id, meeting_url, status, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "sess-1",
      "class-ai-k01",
      "Buổi 01: Nền tảng LLMs & Kỹ nghệ Prompt Engineering Nâng Cao",
      "Giới thiệu kiến trúc Transformer, cơ chế Attention và kỹ thuật thiết kế Prompt tối ưu cho bài toán thực tế.",
      "2026-10-06T19:30:00",
      "2026-10-06T21:30:00",
      "usr-teacher-son",
      "HYBRID",
      "room-lab-01",
      "https://meet.google.com/xyz-thay-son-ai",
      "SCHEDULED",
      "Học viên mang laptop cài đặt sẵn Python 3.11+",
      now,
      now
    );

    db.prepare(`
      INSERT INTO class_sessions (id, class_id, title, description, start_at, end_at, teacher_id, delivery_mode, room_id, meeting_url, status, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "sess-2",
      "class-ai-k01",
      "Buổi 02: Kiến trúc RAG (Retrieval-Augmented Generation) & Vector Database",
      "Thực hành nhúng dữ liệu (Embedding), lưu trữ vào ChromaDB và xây dựng chatbot tra cứu tài liệu doanh nghiệp.",
      "2026-10-08T19:30:00",
      "2026-10-08T21:30:00",
      "usr-teacher-son",
      "HYBRID",
      "room-lab-01",
      "https://meet.google.com/xyz-thay-son-ai",
      "SCHEDULED",
      "Chuẩn bị tài liệu PDF mẫu để test RAG pipeline",
      now,
      now
    );
  }
}
