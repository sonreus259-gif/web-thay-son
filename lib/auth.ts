import crypto from "crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";

const COOKIE_NAME = "lms_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// 1. Password Hashing with Scrypt (Zero external dependencies, cryptographically secure)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  try {
    const [salt, key] = combinedHash.split(":");
    if (!salt || !key) return false;
    const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derivedKey, "hex"));
  } catch {
    return false;
  }
}

// 2. Session Management
export function createSession(userId: string): { token: string; expiresAt: string } {
  const db = getDb();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const id = `sess-${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(
    "INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
  );
  stmt.run(id, userId, token, expiresAt, now);

  // Update user last_login_at
  db.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(now, userId);

  return { token, expiresAt };
}

export function deleteSession(token: string) {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

// 3. Current User from Request Cookies
export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
  avatar: string | null;
  title: string | null;
  roles: string[];
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return null;

  const db = getDb();
  const now = new Date().toISOString();

  const sessionStmt = db.prepare(
    "SELECT user_id, expires_at FROM sessions WHERE token = ?"
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = sessionStmt.get(sessionCookie.value) as any;

  if (!session) return null;
  if (session.expires_at < now) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(sessionCookie.value);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = db.prepare(
    "SELECT id, full_name, email, phone, status, avatar, title FROM users WHERE id = ?"
  ).get(session.user_id) as any;

  if (!user || user.status !== "ACTIVE") return null;

  // Get user roles
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roles = db.prepare(
    "SELECT role_code FROM user_roles WHERE user_id = ?"
  ).all(user.id) as any[];

  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone || null,
    status: user.status,
    avatar: user.avatar || null,
    title: user.title || null,
    roles: roles.map((r) => r.role_code),
  };
}

// 4. Permission Helpers
export function hasRole(user: SessionUser | null, role: string): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

export function requireAdmin(user: SessionUser | null): boolean {
  return hasRole(user, "ADMIN");
}

export function requireTeacherOrAdmin(user: SessionUser | null): boolean {
  return hasRole(user, "ADMIN") || hasRole(user, "TEACHER");
}

// 5. Audit Logging Helper
export function logAudit(
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null = null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any = null
) {
  try {
    const db = getDb();
    const id = `audit-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    db.prepare(
      "INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(
      id,
      userId,
      action,
      entityType,
      entityId,
      metadata ? JSON.stringify(metadata) : null,
      now
    );
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
