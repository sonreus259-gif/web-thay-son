/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DEMO API — chạy hoàn toàn trong trình duyệt.
 *
 * Bản build tĩnh (GitHub Pages) không có máy chủ nên không chạy được các route
 * trong `app/api` và SQLite. Module này chặn mọi lệnh `fetch("/api/...")` ở
 * phía client và trả về dữ liệu từ một "cơ sở dữ liệu" lưu trong localStorage,
 * mô phỏng đúng hành vi (phân quyền, kiểm tra trùng lịch...) của API thật.
 *
 * Chỉ được bật khi NEXT_PUBLIC_DEMO_API === "1" (xem next.config.ts).
 * Dữ liệu chỉ nằm trên trình duyệt của từng người xem, KHÔNG có bảo mật thật.
 */

type Row = Record<string, any>;

interface DemoDb {
  users: Row[];
  user_roles: Row[];
  rooms: Row[];
  courses: Row[];
  classes: Row[];
  class_teachers: Row[];
  class_sessions: Row[];
  enrollments: Row[];
}

interface ApiResult {
  status: number;
  body: any;
}

const DB_KEY = "lms_demo_db_v1";
const SESSION_KEY = "lms_demo_session_v1";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const uid = (prefix: string) =>
  `${prefix}-${
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
  }`;

const nowIso = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Seed — khớp với lib/seed.ts
// ---------------------------------------------------------------------------
function seed(): DemoDb {
  const now = nowIso();
  const user = (
    id: string,
    full_name: string,
    email: string,
    phone: string,
    password: string,
    avatar: string,
    title: string
  ): Row => ({
    id,
    full_name,
    email,
    phone,
    password,
    status: "ACTIVE",
    avatar,
    title,
    email_verified_at: null,
    last_login_at: null,
    password_changed_at: null,
    created_at: now,
    updated_at: now,
  });
  const role = (id: string, user_id: string, role_code: string): Row => ({
    id,
    user_id,
    role_code,
    created_at: now,
  });
  const session = (
    id: string,
    title: string,
    description: string,
    start_at: string,
    end_at: string,
    note: string
  ): Row => ({
    id,
    class_id: "class-ai-k01",
    title,
    description,
    start_at,
    end_at,
    teacher_id: "usr-teacher-son",
    delivery_mode: "HYBRID",
    room_id: "room-lab-01",
    meeting_url: "https://meet.google.com/xyz-thay-son-ai",
    status: "SCHEDULED",
    note,
    created_at: now,
    updated_at: now,
  });

  return {
    users: [
      user(
        "usr-admin",
        "Quản Trị Viên LMS",
        "admin@thayson.edu.vn",
        "0988001001",
        "Admin@123456",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "Quản trị hệ thống đào tạo"
      ),
      user(
        "usr-teacher-son",
        "Thầy Đỗ Trường Sơn",
        "son.ai@thayson.edu.vn",
        "0912345678",
        "Teacher@123456",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "Chuyên gia Đào tạo AI & Data Science"
      ),
      user(
        "usr-student-an",
        "Nguyễn Văn An",
        "student1@thayson.edu.vn",
        "0909123456",
        "Student@123456",
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        "Học viên AI K01"
      ),
      user(
        "usr-student-mai",
        "Trần Thị Mai",
        "student2@thayson.edu.vn",
        "0909876543",
        "Student@123456",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "Học viên Data Science"
      ),
    ],
    user_roles: [
      role("ur-admin-1", "usr-admin", "ADMIN"),
      role("ur-admin-2", "usr-admin", "TEACHER"),
      role("ur-teacher-1", "usr-teacher-son", "TEACHER"),
      role("ur-student-1", "usr-student-an", "STUDENT"),
      role("ur-student-2", "usr-student-mai", "STUDENT"),
    ],
    rooms: [
      {
        id: "room-lab-01",
        name: "Phòng AI Lab 01",
        location: "Tầng 3 - Tòa nhà Tech Hub",
        capacity: 35,
        status: "ACTIVE",
        created_at: now,
        updated_at: now,
      },
    ],
    courses: [
      {
        id: "course-genai",
        code: "AI-PRO",
        title: "Generative AI & AI Agents Masterclass",
        slug: "generative-ai-ai-agents",
        category: "AI",
        level: "Chuyên sâu",
        short_description:
          "Làm chủ LLMs, xây dựng AI Agents tự hành và tự động hóa quy trình nghiệp vụ.",
        description:
          "Chương trình đào tạo toàn diện về Trí tuệ nhân tạo thế hệ mới (Generative AI), Fine-tuning, RAG và Multi-Agent Systems.",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500",
        badge: "HOT • THỰC CHIẾN",
        price: 4500000,
        duration_weeks: 8,
        total_lessons: 24,
        status: "PUBLISHED",
        is_published: 1,
        is_featured: 1,
        created_at: now,
        updated_at: now,
      },
    ],
    classes: [
      {
        id: "class-ai-k01",
        course_id: "course-genai",
        code: "AI-K01",
        name: "Lớp Chuyên Sâu Generative AI & AI Agents K01",
        description:
          "Lớp đào tạo thực chiến buổi tối thứ 3 - thứ 5 do Thầy Đỗ Trường Sơn trực tiếp hướng dẫn.",
        start_date: "2026-10-06",
        end_date: "2026-11-28",
        capacity: 30,
        delivery_mode: "HYBRID",
        status: "ONGOING",
        created_at: now,
        updated_at: now,
      },
    ],
    class_teachers: [
      { id: "ct-1", class_id: "class-ai-k01", user_id: "usr-teacher-son", created_at: now },
    ],
    enrollments: [
      {
        id: "enr-1",
        user_id: "usr-student-an",
        class_id: "class-ai-k01",
        status: "ACTIVE",
        enrolled_at: now,
        completed_at: null,
        progress_percent: 25,
        created_at: now,
        updated_at: now,
      },
    ],
    class_sessions: [
      session(
        "sess-1",
        "Buổi 01: Nền tảng LLMs & Kỹ nghệ Prompt Engineering Nâng Cao",
        "Giới thiệu kiến trúc Transformer, cơ chế Attention và kỹ thuật thiết kế Prompt tối ưu cho bài toán thực tế.",
        "2026-10-06T19:30:00",
        "2026-10-06T21:30:00",
        "Học viên mang laptop cài đặt sẵn Python 3.11+"
      ),
      session(
        "sess-2",
        "Buổi 02: Kiến trúc RAG (Retrieval-Augmented Generation) & Vector Database",
        "Thực hành nhúng dữ liệu (Embedding), lưu trữ vào ChromaDB và xây dựng chatbot tra cứu tài liệu doanh nghiệp.",
        "2026-10-08T19:30:00",
        "2026-10-08T21:30:00",
        "Chuẩn bị tài liệu PDF mẫu để test RAG pipeline"
      ),
    ],
  };
}

// ---------------------------------------------------------------------------
// Lưu trữ
// ---------------------------------------------------------------------------
let memoryDb: DemoDb | null = null;
let memorySession: string | null = null;

function loadDb(): DemoDb {
  if (memoryDb) return memoryDb;
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (raw) {
      memoryDb = JSON.parse(raw) as DemoDb;
      return memoryDb;
    }
  } catch {
    // localStorage bị chặn hoặc dữ liệu hỏng -> dùng seed trong bộ nhớ
  }
  memoryDb = seed();
  saveDb();
  return memoryDb;
}

function saveDb() {
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(memoryDb));
  } catch {
    // bỏ qua: vẫn chạy được bằng bộ nhớ trong phiên này
  }
}

function getSessionUserId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY) ?? memorySession;
  } catch {
    return memorySession;
  }
}

function setSessionUserId(id: string | null) {
  memorySession = id;
  try {
    if (id) window.localStorage.setItem(SESSION_KEY, id);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // bỏ qua
  }
}

// ---------------------------------------------------------------------------
// Tiện ích truy vấn
// ---------------------------------------------------------------------------
const ok = (body: any): ApiResult => ({ status: 200, body });
const fail = (status: number, error: string): ApiResult => ({ status, body: { error } });

const rolesOf = (db: DemoDb, userId: string): string[] =>
  db.user_roles.filter((r) => r.user_id === userId).map((r) => r.role_code);

interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  avatar: string | null;
  title: string | null;
  roles: string[];
}

function toSessionUser(db: DemoDb, u: Row): CurrentUser {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    phone: u.phone || null,
    status: u.status,
    avatar: u.avatar || null,
    title: u.title || null,
    roles: rolesOf(db, u.id),
  };
}

function currentUser(db: DemoDb): CurrentUser | null {
  const id = getSessionUserId();
  if (!id) return null;
  const u = db.users.find((x) => x.id === id);
  if (!u || u.status !== "ACTIVE") return null;
  return toSessionUser(db, u);
}

const has = (user: CurrentUser | null, role: string) => !!user && user.roles.includes(role);

const like = (q: string, ...values: unknown[]) =>
  values.some((v) => String(v ?? "").toLowerCase().includes(q.toLowerCase()));

const byCreatedDesc = (a: Row, b: Row) => String(b.created_at).localeCompare(String(a.created_at));
const byStartAsc = (a: Row, b: Row) => String(a.start_at).localeCompare(String(b.start_at));

const activeEnrollments = (db: DemoDb, classId: string) =>
  db.enrollments.filter((e) => e.class_id === classId && e.status === "ACTIVE");

const teacherClassIds = (db: DemoDb, userId: string) =>
  db.class_teachers.filter((ct) => ct.user_id === userId).map((ct) => ct.class_id);

const studentClassIds = (db: DemoDb, userId: string) =>
  db.enrollments
    .filter((e) => e.user_id === userId && e.status === "ACTIVE")
    .map((e) => e.class_id);

const courseStudentCount = (db: DemoDb, courseId: string) =>
  db.enrollments.filter(
    (e) =>
      e.status === "ACTIVE" &&
      db.classes.some((cl) => cl.id === e.class_id && cl.course_id === courseId)
  ).length;

function publicUser(db: DemoDb, u: Row): Row {
  return {
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    phone: u.phone,
    status: u.status,
    avatar: u.avatar,
    title: u.title,
    email_verified_at: u.email_verified_at ?? null,
    last_login_at: u.last_login_at ?? null,
    created_at: u.created_at,
    updated_at: u.updated_at,
    roles: rolesOf(db, u.id),
  };
}

function sessionConflict(
  db: DemoDb,
  field: "teacher_id" | "room_id",
  value: string,
  startAt: string,
  endAt: string,
  excludeId?: string
): Row | undefined {
  return db.class_sessions.find(
    (s) =>
      s[field] === value &&
      s.id !== excludeId &&
      s.status !== "CANCELLED" &&
      String(s.start_at) < endAt &&
      String(s.end_at) > startAt
  );
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày ${d.toLocaleDateString("vi-VN")}`;
};

// ---------------------------------------------------------------------------
// Các nhóm endpoint
// ---------------------------------------------------------------------------
function authApi(db: DemoDb, method: string, seg: string[], body: Row): ApiResult | null {
  if (seg[1] === "login" && method === "POST") {
    const { email, password } = body;
    if (!email || !password) return fail(400, "Vui lòng nhập đầy đủ Email và Mật khẩu.");
    const cleanEmail = String(email).trim().toLowerCase();
    const u = db.users.find((x) => String(x.email).toLowerCase() === cleanEmail);
    if (!u) return fail(401, "Email hoặc mật khẩu không chính xác.");
    if (u.status === "LOCKED")
      return fail(403, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
    if (u.status === "INACTIVE" || u.status === "PENDING")
      return fail(403, "Tài khoản chưa được kích hoạt hoặc đang tạm ngưng.");
    if (u.password !== password) return fail(401, "Email hoặc mật khẩu không chính xác.");
    u.last_login_at = nowIso();
    setSessionUserId(u.id);
    saveDb();
    return ok({ success: true, user: toSessionUser(db, u) });
  }
  if (seg[1] === "logout" && method === "POST") {
    setSessionUserId(null);
    return ok({ success: true });
  }
  if (seg[1] === "me" && method === "GET") {
    const user = currentUser(db);
    return user ? ok({ user }) : fail(401, "Chưa đăng nhập");
  }
  return null;
}

function coursesApi(
  db: DemoDb,
  method: string,
  seg: string[],
  query: URLSearchParams,
  body: Row
): ApiResult | null {
  const user = currentUser(db);
  const id = seg[1];

  if (!id && method === "GET") {
    const q = query.get("q") || "";
    let rows = db.courses.slice();
    if (user && !has(user, "ADMIN") && !has(user, "TEACHER")) {
      rows = rows.filter((c) => c.is_published === 1 && c.status === "PUBLISHED");
    }
    if (q) rows = rows.filter((c) => like(q, c.title, c.code, c.category));
    rows.sort(byCreatedDesc);
    return ok({
      courses: rows.map((c) => ({
        ...c,
        class_count: db.classes.filter((cl) => cl.course_id === c.id).length,
        total_students: courseStudentCount(db, c.id),
      })),
    });
  }

  if (!id && method === "POST") {
    if (!has(user, "ADMIN"))
      return fail(403, "Không có quyền thực hiện hành động này (Chỉ dành cho Admin).");
    const {
      title,
      code,
      slug,
      category = "AI",
      level = "Chuyên sâu",
      shortDescription = "",
      description = "",
      thumbnail = "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500",
      badge = "CHUYÊN SÂU",
      price = 0,
      durationWeeks = 8,
      totalLessons = 24,
      status = "PUBLISHED",
      isPublished = 1,
      isFeatured = 0,
    } = body;
    if (!title || !String(title).trim()) return fail(400, "Tiêu đề khóa học không được để trống.");
    const newId = uid("course");
    const now = nowIso();
    db.courses.push({
      id: newId,
      code: code || `CRS-${Date.now().toString().slice(-4)}`,
      title: String(title).trim(),
      slug: String(slug || title)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
      category,
      level,
      short_description: shortDescription,
      description,
      thumbnail,
      badge,
      price: Number(price) || 0,
      duration_weeks: Number(durationWeeks) || 8,
      total_lessons: Number(totalLessons) || 24,
      status,
      is_published: isPublished ? 1 : 0,
      is_featured: isFeatured ? 1 : 0,
      created_at: now,
      updated_at: now,
    });
    saveDb();
    return ok({ success: true, courseId: newId });
  }

  if (id && method === "GET") {
    const course = db.courses.find((c) => c.id === id);
    if (!course) return fail(404, "Không tìm thấy khóa học");
    const classes = db.classes
      .filter((c) => c.course_id === id)
      .map((c) => ({ ...c, student_count: activeEnrollments(db, c.id).length }));
    return ok({ course, classes });
  }

  if (id && method === "PUT") {
    if (!has(user, "ADMIN")) return fail(403, "Chỉ Quản trị viên mới có quyền cập nhật khóa học.");
    const existing = db.courses.find((c) => c.id === id);
    if (!existing) return fail(404, "Không tìm thấy khóa học");
    const {
      title = existing.title,
      code = existing.code,
      slug = existing.slug,
      category = existing.category,
      level = existing.level,
      shortDescription = existing.short_description,
      description = existing.description,
      thumbnail = existing.thumbnail,
      badge = existing.badge,
      price = existing.price,
      durationWeeks = existing.duration_weeks,
      totalLessons = existing.total_lessons,
      status = existing.status,
      isPublished = existing.is_published,
      isFeatured = existing.is_featured,
    } = body;
    Object.assign(existing, {
      title,
      code,
      slug,
      category,
      level,
      short_description: shortDescription,
      description,
      thumbnail,
      badge,
      price: Number(price),
      duration_weeks: Number(durationWeeks),
      total_lessons: Number(totalLessons),
      status,
      is_published: isPublished ? 1 : 0,
      is_featured: isFeatured ? 1 : 0,
      updated_at: nowIso(),
    });
    saveDb();
    return ok({ success: true });
  }

  if (id && method === "DELETE") {
    if (!has(user, "ADMIN")) return fail(403, "Chỉ Quản trị viên mới có quyền xóa khóa học.");
    const count = db.classes.filter((c) => c.course_id === id).length;
    if (count > 0) {
      return fail(
        400,
        `Không thể xóa khóa học này vì đã có ${count} lớp học liên kết. Hãy chuyển trạng thái khóa học sang ARCHIVED (Lưu trữ) để đảm bảo toàn vẹn dữ liệu.`
      );
    }
    db.courses = db.courses.filter((c) => c.id !== id);
    saveDb();
    return ok({ success: true });
  }

  return null;
}

function classTeachers(db: DemoDb, classId: string, withPhone: boolean): Row[] {
  return db.class_teachers
    .filter((ct) => ct.class_id === classId)
    .map((ct) => db.users.find((u) => u.id === ct.user_id))
    .filter((u): u is Row => !!u)
    .map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      ...(withPhone ? { phone: u.phone } : {}),
      avatar: u.avatar,
      title: u.title,
    }));
}

function classesApi(
  db: DemoDb,
  method: string,
  seg: string[],
  query: URLSearchParams,
  body: Row
): ApiResult | null {
  const user = currentUser(db);
  const id = seg[1];

  // /api/classes/:id/enrollments[/:userId]
  if (id && seg[2] === "enrollments") {
    if (method === "POST" && !seg[3]) {
      if (!has(user, "ADMIN"))
        return fail(403, "Chỉ Quản trị viên mới có quyền ghi danh học viên vào lớp.");
      const { userIds, userId } = body;
      const targets: string[] = Array.isArray(userIds) ? userIds : userId ? [userId] : [];
      if (targets.length === 0)
        return fail(400, "Vui lòng chọn ít nhất một học viên để ghi danh.");
      const cls = db.classes.find((c) => c.id === id);
      if (!cls) return fail(404, "Lớp học không tồn tại.");
      const current = activeEnrollments(db, id).length;
      if (current + targets.length > cls.capacity) {
        return fail(
          400,
          `Vượt quá sĩ số tối đa của lớp (${cls.capacity} học viên). Hiện lớp đã có ${current} học viên.`
        );
      }
      const now = nowIso();
      const enrolledUsers: string[] = [];
      const skippedUsers: string[] = [];
      for (const targetId of targets) {
        const target = db.users.find((u) => u.id === targetId);
        if (!target) continue;
        if (!db.user_roles.some((r) => r.user_id === targetId && r.role_code === "STUDENT")) {
          db.user_roles.push({
            id: uid("ur"),
            user_id: targetId,
            role_code: "STUDENT",
            created_at: now,
          });
        }
        const existing = db.enrollments.find(
          (e) => e.user_id === targetId && e.class_id === id
        );
        if (existing) {
          if (existing.status !== "ACTIVE") {
            existing.status = "ACTIVE";
            existing.updated_at = now;
            enrolledUsers.push(target.full_name);
          } else {
            skippedUsers.push(target.full_name);
          }
        } else {
          db.enrollments.push({
            id: uid("enr"),
            user_id: targetId,
            class_id: id,
            status: "ACTIVE",
            enrolled_at: now,
            completed_at: null,
            progress_percent: 0,
            created_at: now,
            updated_at: now,
          });
          enrolledUsers.push(target.full_name);
        }
      }
      saveDb();
      return ok({
        success: true,
        enrolledCount: enrolledUsers.length,
        enrolledUsers,
        skippedUsers,
      });
    }
    if (method === "DELETE" && seg[3]) {
      if (!has(user, "ADMIN"))
        return fail(403, "Chỉ Quản trị viên mới có quyền hủy ghi danh học viên.");
      db.enrollments = db.enrollments.filter(
        (e) => !(e.class_id === id && e.user_id === seg[3])
      );
      saveDb();
      return ok({ success: true });
    }
    return null;
  }

  if (!id && method === "GET") {
    if (!user) return fail(401, "Chưa đăng nhập");
    const courseId = query.get("courseId");
    let rows = db.classes.filter((c) => db.courses.some((cr) => cr.id === c.course_id));
    if (has(user, "ADMIN")) {
      // thấy tất cả
    } else if (has(user, "TEACHER")) {
      const ids = teacherClassIds(db, user.id);
      rows = rows.filter((c) => ids.includes(c.id));
    } else if (has(user, "STUDENT")) {
      const ids = studentClassIds(db, user.id);
      rows = rows.filter((c) => ids.includes(c.id));
    } else {
      return ok({ classes: [] });
    }
    if (courseId) rows = rows.filter((c) => c.course_id === courseId);
    rows = rows.slice().sort(byCreatedDesc);
    return ok({
      classes: rows.map((c) => {
        const course = db.courses.find((cr) => cr.id === c.course_id)!;
        return {
          ...c,
          course_title: course.title,
          course_code: course.code,
          course_thumbnail: course.thumbnail,
          enrolled_count: activeEnrollments(db, c.id).length,
          session_count: db.class_sessions.filter(
            (s) => s.class_id === c.id && s.status !== "CANCELLED"
          ).length,
          teachers: classTeachers(db, c.id, false),
        };
      }),
    });
  }

  if (!id && method === "POST") {
    if (!has(user, "ADMIN")) return fail(403, "Chỉ Quản trị viên mới có quyền tạo lớp học.");
    const {
      courseId,
      code,
      name,
      description = "",
      startDate = "",
      endDate = "",
      capacity = 30,
      deliveryMode = "HYBRID",
      status = "OPEN",
      teacherIds = [],
    } = body;
    if (!courseId || !code || !name)
      return fail(400, "Vui lòng nhập đầy đủ Khóa học, Mã lớp và Tên lớp.");
    if (Number(capacity) <= 0) return fail(400, "Sĩ số tối đa phải lớn hơn 0.");
    const cleanCode = String(code).trim().toUpperCase();
    if (db.classes.some((c) => c.code === cleanCode))
      return fail(400, `Mã lớp '${cleanCode}' đã tồn tại trên hệ thống.`);
    if (!db.courses.some((c) => c.id === courseId))
      return fail(404, "Khóa học được chọn không tồn tại.");
    const newId = uid("class");
    const now = nowIso();
    db.classes.push({
      id: newId,
      course_id: courseId,
      code: cleanCode,
      name: String(name).trim(),
      description,
      start_date: startDate,
      end_date: endDate,
      capacity: Number(capacity),
      delivery_mode: deliveryMode,
      status,
      created_at: now,
      updated_at: now,
    });
    if (Array.isArray(teacherIds)) {
      for (const tId of new Set<string>(teacherIds)) {
        db.class_teachers.push({ id: uid("ct"), class_id: newId, user_id: tId, created_at: now });
      }
    }
    saveDb();
    return ok({ success: true, classId: newId });
  }

  if (id && method === "GET") {
    if (!user) return fail(401, "Chưa đăng nhập");
    const cls = db.classes.find((c) => c.id === id);
    const course = cls && db.courses.find((cr) => cr.id === cls.course_id);
    if (!cls || !course) return fail(404, "Không tìm thấy lớp học");
    if (has(user, "ADMIN")) {
      // toàn quyền
    } else if (has(user, "TEACHER")) {
      if (!teacherClassIds(db, user.id).includes(id))
        return fail(
          403,
          "Bạn không có quyền truy cập lớp học này vì không được phân công phụ trách."
        );
    } else if (has(user, "STUDENT")) {
      if (!studentClassIds(db, user.id).includes(id))
        return fail(403, "Bạn chưa được ghi danh vào lớp học này.");
    } else {
      return fail(403, "Không có quyền truy cập");
    }
    let students: Row[] = [];
    if (has(user, "ADMIN") || has(user, "TEACHER")) {
      students = db.enrollments
        .filter((e) => e.class_id === id)
        .slice()
        .sort((a, b) => String(b.enrolled_at).localeCompare(String(a.enrolled_at)))
        .map((e) => {
          const u = db.users.find((x) => x.id === e.user_id);
          return u
            ? {
                id: u.id,
                full_name: u.full_name,
                email: u.email,
                phone: u.phone,
                avatar: u.avatar,
                enrollment_status: e.status,
                enrolled_at: e.enrolled_at,
                progress_percent: e.progress_percent,
              }
            : null;
        })
        .filter((s): s is NonNullable<typeof s> => !!s);
    }
    const sessions = db.class_sessions
      .filter((s) => s.class_id === id && s.status !== "CANCELLED")
      .slice()
      .sort(byStartAsc)
      .map((s) => ({
        ...s,
        room_name: db.rooms.find((r) => r.id === s.room_id)?.name ?? null,
        teacher_name: db.users.find((u) => u.id === s.teacher_id)?.full_name ?? null,
      }));
    return ok({
      class: { ...cls, course_title: course.title, course_code: course.code },
      teachers: classTeachers(db, id, true),
      students,
      sessions,
    });
  }

  if (id && method === "PUT") {
    if (!has(user, "ADMIN"))
      return fail(403, "Chỉ Quản trị viên mới có quyền cập nhật thông tin lớp học.");
    const existing = db.classes.find((c) => c.id === id);
    if (!existing) return fail(404, "Không tìm thấy lớp học");
    const {
      name = existing.name,
      description = existing.description,
      startDate = existing.start_date,
      endDate = existing.end_date,
      capacity = existing.capacity,
      deliveryMode = existing.delivery_mode,
      status = existing.status,
      teacherIds,
    } = body;
    const now = nowIso();
    Object.assign(existing, {
      name: String(name).trim(),
      description,
      start_date: startDate,
      end_date: endDate,
      capacity: Number(capacity),
      delivery_mode: deliveryMode,
      status,
      updated_at: now,
    });
    if (Array.isArray(teacherIds)) {
      db.class_teachers = db.class_teachers.filter((ct) => ct.class_id !== id);
      for (const tId of new Set<string>(teacherIds)) {
        db.class_teachers.push({ id: uid("ct"), class_id: id, user_id: tId, created_at: now });
      }
    }
    saveDb();
    return ok({ success: true });
  }

  if (id && method === "DELETE") {
    if (!has(user, "ADMIN")) return fail(403, "Chỉ Quản trị viên mới có quyền hủy lớp học.");
    const existing = db.classes.find((c) => c.id === id);
    if (existing) {
      existing.status = "CANCELLED";
      existing.updated_at = nowIso();
      saveDb();
    }
    return ok({ success: true });
  }

  return null;
}

function sessionsApi(
  db: DemoDb,
  method: string,
  seg: string[],
  query: URLSearchParams,
  body: Row
): ApiResult | null {
  const user = currentUser(db);
  const id = seg[1];

  if (!id && method === "GET") {
    if (!user) return fail(401, "Chưa đăng nhập");
    const classId = query.get("classId");
    const teacherId = query.get("teacherId");
    let rows = db.class_sessions.filter((s) => s.status !== "CANCELLED");
    if (has(user, "ADMIN")) {
      // thấy tất cả
    } else if (has(user, "TEACHER")) {
      const ids = teacherClassIds(db, user.id);
      rows = rows.filter((s) => s.teacher_id === user.id || ids.includes(s.class_id));
    } else if (has(user, "STUDENT")) {
      const ids = studentClassIds(db, user.id);
      rows = rows.filter((s) => ids.includes(s.class_id));
    } else {
      return ok({ sessions: [] });
    }
    if (classId) rows = rows.filter((s) => s.class_id === classId);
    if (teacherId) rows = rows.filter((s) => s.teacher_id === teacherId);
    const sessions = rows
      .slice()
      .sort(byStartAsc)
      .map((s) => {
        const cls = db.classes.find((c) => c.id === s.class_id);
        const course = cls && db.courses.find((cr) => cr.id === cls.course_id);
        if (!cls || !course) return null;
        const room = db.rooms.find((r) => r.id === s.room_id);
        const teacher = db.users.find((u) => u.id === s.teacher_id);
        return {
          ...s,
          class_name: cls.name,
          class_code: cls.code,
          course_title: course.title,
          room_name: room?.name ?? null,
          room_location: room?.location ?? null,
          teacher_name: teacher?.full_name ?? null,
          teacher_email: teacher?.email ?? null,
          teacher_avatar: teacher?.avatar ?? null,
        };
      })
      .filter((s): s is NonNullable<typeof s> => !!s);
    return ok({ sessions });
  }

  if (!id && method === "POST") {
    if (!has(user, "ADMIN"))
      return fail(403, "Chỉ Quản trị viên mới có quyền tạo lịch buổi học.");
    const {
      classId,
      title,
      description = "",
      startAt,
      endAt,
      teacherId,
      deliveryMode = "HYBRID",
      roomId,
      meetingUrl = "",
      status = "SCHEDULED",
      note = "",
    } = body;
    if (!classId || !title || !startAt || !endAt)
      return fail(
        400,
        "Vui lòng nhập đầy đủ Lớp học, Tên buổi học, Thời gian bắt đầu và kết thúc."
      );
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end)
      return fail(400, "Thời gian bắt đầu phải sớm hơn thời gian kết thúc.");
    if (!db.classes.some((c) => c.id === classId)) return fail(404, "Lớp học không tồn tại.");

    if (teacherId) {
      const c = sessionConflict(db, "teacher_id", teacherId, startAt, endAt);
      if (c) {
        const teacherName = db.users.find((u) => u.id === teacherId)?.full_name ?? "";
        const className = db.classes.find((x) => x.id === c.class_id)?.name ?? "";
        return fail(
          409,
          `TRÙNG LỊCH GIẢNG VIÊN: Giảng viên ${teacherName} đã có lịch dạy từ ${formatTime(c.start_at)} đến ${formatTime(c.end_at)} (Lớp: ${className} - ${c.title}).`
        );
      }
    }
    if (roomId) {
      const c = sessionConflict(db, "room_id", roomId, startAt, endAt);
      if (c) {
        const roomName = db.rooms.find((r) => r.id === roomId)?.name ?? "";
        const className = db.classes.find((x) => x.id === c.class_id)?.name ?? "";
        return fail(
          409,
          `TRÙNG LỊCH PHÒNG HỌC: Phòng '${roomName}' đã được xếp lớp từ ${formatTime(c.start_at)} đến ${formatTime(c.end_at)} (Lớp: ${className}). Vui lòng chọn phòng khác.`
        );
      }
    }
    const newId = uid("sess");
    const now = nowIso();
    db.class_sessions.push({
      id: newId,
      class_id: classId,
      title: String(title).trim(),
      description,
      start_at: startAt,
      end_at: endAt,
      teacher_id: teacherId || null,
      delivery_mode: deliveryMode,
      room_id: roomId || null,
      meeting_url: meetingUrl || null,
      status,
      note,
      created_at: now,
      updated_at: now,
    });
    saveDb();
    return ok({ success: true, sessionId: newId });
  }

  if (id && method === "PUT") {
    if (!has(user, "ADMIN") && !has(user, "TEACHER"))
      return fail(403, "Không có quyền chỉnh sửa buổi học.");
    const existing = db.class_sessions.find((s) => s.id === id);
    if (!existing) return fail(404, "Không tìm thấy buổi học.");
    if (!has(user, "ADMIN") && existing.teacher_id !== user!.id)
      return fail(403, "Giảng viên chỉ được chỉnh sửa buổi học do mình phụ trách.");
    const {
      title = existing.title,
      description = existing.description,
      startAt = existing.start_at,
      endAt = existing.end_at,
      teacherId = existing.teacher_id,
      deliveryMode = existing.delivery_mode,
      roomId = existing.room_id,
      meetingUrl = existing.meeting_url,
      status = existing.status,
      note = existing.note,
    } = body;
    if (new Date(startAt) >= new Date(endAt))
      return fail(400, "Thời gian bắt đầu phải sớm hơn thời gian kết thúc.");
    if (teacherId) {
      const c = sessionConflict(db, "teacher_id", teacherId, startAt, endAt, id);
      if (c) {
        const className = db.classes.find((x) => x.id === c.class_id)?.name ?? "";
        return fail(
          400,
          `TRÙNG LỊCH GIẢNG VIÊN: Giảng viên đã có lịch dạy trùng giờ (Buổi: ${c.title} - Lớp: ${className}).`
        );
      }
    }
    if (roomId) {
      const c = sessionConflict(db, "room_id", roomId, startAt, endAt, id);
      if (c) {
        const roomName = db.rooms.find((r) => r.id === roomId)?.name ?? "";
        return fail(
          400,
          `TRÙNG LỊCH PHÒNG HỌC: Phòng '${roomName}' đã được xếp lớp trùng thời gian.`
        );
      }
    }
    Object.assign(existing, {
      title,
      description,
      start_at: startAt,
      end_at: endAt,
      teacher_id: teacherId || null,
      delivery_mode: deliveryMode,
      room_id: roomId || null,
      meeting_url: meetingUrl || null,
      status,
      note,
      updated_at: nowIso(),
    });
    saveDb();
    return ok({ success: true });
  }

  if (id && method === "DELETE") {
    if (!has(user, "ADMIN")) return fail(403, "Chỉ Quản trị viên mới có quyền hủy buổi học.");
    const existing = db.class_sessions.find((s) => s.id === id);
    if (existing) {
      existing.status = "CANCELLED";
      existing.updated_at = nowIso();
      saveDb();
    }
    return ok({ success: true });
  }

  return null;
}

function usersApi(
  db: DemoDb,
  method: string,
  seg: string[],
  query: URLSearchParams,
  body: Row
): ApiResult | null {
  const user = currentUser(db);
  const id = seg[1];

  if (!id && method === "GET") {
    if (!user) return fail(401, "Chưa đăng nhập");
    const q = query.get("q") || "";
    const role = query.get("role") || "";
    let rows = db.users.slice();
    if (!has(user, "ADMIN")) {
      if (!has(user, "TEACHER")) return fail(403, "Không có quyền xem danh sách người dùng");
      const classIds = teacherClassIds(db, user.id);
      const studentIds = db.enrollments
        .filter((e) => classIds.includes(e.class_id))
        .map((e) => e.user_id);
      rows = rows.filter((u) => studentIds.includes(u.id));
    }
    if (q) rows = rows.filter((u) => like(q, u.full_name, u.email, u.phone));
    if (role) rows = rows.filter((u) => rolesOf(db, u.id).includes(role));
    rows.sort(byCreatedDesc);
    return ok({ users: rows.map((u) => publicUser(db, u)) });
  }

  if (!id && method === "POST") {
    if (!has(user, "ADMIN")) return fail(403, "Chỉ Quản trị viên mới có quyền tạo người dùng.");
    const {
      fullName,
      email,
      phone = "",
      password,
      roleCodes = ["STUDENT"],
      title = "",
      status = "ACTIVE",
    } = body;
    if (!fullName || !email || !password)
      return fail(400, "Vui lòng nhập Họ tên, Email và Mật khẩu.");
    const cleanEmail = String(email).trim().toLowerCase();
    if (db.users.some((u) => String(u.email).toLowerCase() === cleanEmail))
      return fail(400, `Email '${cleanEmail}' đã được sử dụng trên hệ thống.`);
    const newId = uid("usr");
    const now = nowIso();
    db.users.push({
      id: newId,
      full_name: String(fullName).trim(),
      email: cleanEmail,
      phone: String(phone).trim() || null,
      password,
      status,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      title: String(title).trim() || null,
      email_verified_at: null,
      last_login_at: null,
      password_changed_at: null,
      created_at: now,
      updated_at: now,
    });
    if (Array.isArray(roleCodes)) {
      for (const r of new Set<string>(roleCodes)) {
        db.user_roles.push({ id: uid("ur"), user_id: newId, role_code: r, created_at: now });
      }
    }
    saveDb();
    return ok({ success: true, userId: newId });
  }

  if (id && method === "PUT") {
    if (!has(user, "ADMIN"))
      return fail(403, "Chỉ Quản trị viên mới có quyền cập nhật người dùng.");
    const existing = db.users.find((u) => u.id === id);
    if (!existing) return fail(404, "Không tìm thấy người dùng.");
    const {
      fullName = existing.full_name,
      phone = existing.phone,
      title = existing.title,
      status = existing.status,
      password,
      roleCodes,
    } = body;
    const now = nowIso();
    Object.assign(existing, {
      full_name: String(fullName).trim(),
      phone,
      title,
      status,
      updated_at: now,
    });
    if (password && String(password).trim()) {
      existing.password = password;
      existing.password_changed_at = now;
    }
    if (Array.isArray(roleCodes)) {
      db.user_roles = db.user_roles.filter((r) => r.user_id !== id);
      for (const r of new Set<string>(roleCodes)) {
        db.user_roles.push({ id: uid("ur"), user_id: id, role_code: r, created_at: now });
      }
    }
    saveDb();
    return ok({ success: true });
  }

  return null;
}

function dashboardApi(db: DemoDb): ApiResult {
  const user = currentUser(db);
  if (!user) return fail(401, "Chưa đăng nhập");
  const now = nowIso();
  const withClass = (s: Row, teacher: boolean) => {
    const cls = db.classes.find((c) => c.id === s.class_id);
    return {
      ...s,
      class_name: cls?.name ?? null,
      class_code: cls?.code ?? null,
      ...(teacher
        ? { teacher_name: db.users.find((u) => u.id === s.teacher_id)?.full_name ?? null }
        : {}),
    };
  };
  const scheduled = db.class_sessions
    .filter((s) => s.status === "SCHEDULED" && db.classes.some((c) => c.id === s.class_id))
    .slice()
    .sort(byStartAsc);

  if (has(user, "ADMIN")) {
    return ok({
      role: "ADMIN",
      totalStudents: new Set(
        db.user_roles.filter((r) => r.role_code === "STUDENT").map((r) => r.user_id)
      ).size,
      totalCourses: db.courses.length,
      totalClasses: db.classes.filter((c) => c.status !== "CANCELLED").length,
      totalSessions: db.class_sessions.filter((s) => s.status === "SCHEDULED").length,
      hotCourses: db.courses
        .map((c) => ({
          id: c.id,
          title: c.title,
          code: c.code,
          badge: c.badge,
          student_count: courseStudentCount(db, c.id),
        }))
        .sort((a, b) => b.student_count - a.student_count)
        .slice(0, 4),
      upcomingSessions: scheduled
        .filter((s) => String(s.start_at) >= now)
        .slice(0, 5)
        .map((s) => withClass(s, true)),
    });
  }

  if (has(user, "TEACHER")) {
    const classIds = teacherClassIds(db, user.id);
    const myClasses = db.classes
      .filter((c) => classIds.includes(c.id) && c.status !== "CANCELLED")
      .map((c) => ({ ...c, student_count: activeEnrollments(db, c.id).length }));
    return ok({
      role: "TEACHER",
      totalClasses: myClasses.length,
      totalStudents: new Set(
        db.enrollments
          .filter((e) => classIds.includes(e.class_id) && e.status === "ACTIVE")
          .map((e) => e.user_id)
      ).size,
      upcomingSessions: scheduled
        .filter((s) => s.teacher_id === user.id || classIds.includes(s.class_id))
        .slice(0, 5)
        .map((s) => withClass(s, false)),
      myClasses,
    });
  }

  const myClassIds = studentClassIds(db, user.id);
  const myEnrollments = db.enrollments
    .filter((e) => e.user_id === user.id && e.status === "ACTIVE")
    .map((e) => {
      const cls = db.classes.find((c) => c.id === e.class_id);
      const course = cls && db.courses.find((cr) => cr.id === cls.course_id);
      return cls && course
        ? {
            ...cls,
            course_title: course.title,
            course_thumbnail: course.thumbnail,
            progress_percent: e.progress_percent,
            enrolled_at: e.enrolled_at,
          }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  return ok({
    role: "STUDENT",
    totalClasses: myEnrollments.length,
    upcomingSessions: scheduled
      .filter((s) => myClassIds.includes(s.class_id))
      .slice(0, 5)
      .map((s) => withClass(s, true)),
    myEnrollments,
  });
}

// ---------------------------------------------------------------------------
// Bộ định tuyến + cài đặt chặn fetch
// ---------------------------------------------------------------------------
export function handleDemoRequest(
  method: string,
  pathname: string,
  query: URLSearchParams,
  body: Row
): ApiResult {
  const db = loadDb();
  // "/api/classes/abc/" -> ["classes", "abc"]
  const seg = pathname
    .replace(/^\/api\//, "")
    .split("/")
    .filter(Boolean)
    .map(decodeURIComponent);
  const m = method.toUpperCase();
  let result: ApiResult | null = null;
  try {
    switch (seg[0]) {
      case "auth":
        result = authApi(db, m, seg, body);
        break;
      case "courses":
        result = coursesApi(db, m, seg, query, body);
        break;
      case "classes":
        result = classesApi(db, m, seg, query, body);
        break;
      case "sessions":
        result = sessionsApi(db, m, seg, query, body);
        break;
      case "users":
        result = usersApi(db, m, seg, query, body);
        break;
      case "rooms":
        if (m === "GET") {
          result = currentUser(db)
            ? ok({
                rooms: db.rooms
                  .filter((r) => r.status === "ACTIVE")
                  .slice()
                  .sort((a, b) => String(a.name).localeCompare(String(b.name))),
              })
            : fail(401, "Chưa đăng nhập");
        }
        break;
      case "dashboard":
        if (seg[1] === "stats" && m === "GET") result = dashboardApi(db);
        break;
    }
  } catch (err) {
    console.error("Demo API error:", err);
    return fail(500, "Lỗi xử lý dữ liệu demo");
  }
  return result ?? fail(404, "Không tìm thấy API");
}

let installed = false;

export function installDemoApi() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const realFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const rawUrl =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    let url: URL;
    try {
      url = new URL(rawUrl, window.location.href);
    } catch {
      return realFetch(input, init);
    }
    let pathname = url.pathname;
    if (BASE_PATH && pathname.startsWith(BASE_PATH + "/")) {
      pathname = pathname.slice(BASE_PATH.length);
    }
    if (url.origin !== window.location.origin || !pathname.startsWith("/api/")) {
      return realFetch(input, init);
    }

    const method =
      init?.method || (typeof input === "object" && "method" in input ? input.method : "GET");
    let body: Row = {};
    try {
      if (typeof init?.body === "string" && init.body) {
        body = JSON.parse(init.body);
      } else if (typeof input === "object" && "json" in input && method !== "GET") {
        body = await input.clone().json();
      }
    } catch {
      body = {};
    }

    const result = handleDemoRequest(method, pathname, url.searchParams, body || {});
    return new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  };
}

if (process.env.NEXT_PUBLIC_DEMO_API === "1") {
  installDemoApi();
}
