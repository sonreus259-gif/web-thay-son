"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLms, LmsUserItem, Role } from "../LmsContext";
import { PlusIcon, SearchIcon, UsersIcon, ShieldIcon } from "../components/Icons";

export default function UsersManagerPage() {
  const { users, createUser, updateUser, activeRole } = useLms();

  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("Student@123456");
  const [title, setTitle] = useState("Học viên");
  const [status, setStatus] = useState("ACTIVE");
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(["STUDENT"]);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If student tries to access user management, block with 403 Forbidden banner
  if (activeRole === "STUDENT") {
    return (
      <div className="p-12 text-center bg-white border border-red-200 rounded-2xl space-y-3">
        <ShieldIcon className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">403 • Truy Cập Bị Từ Chối</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Tài khoản Học viên không có quyền truy cập vào trung tâm quản trị người dùng và phân quyền hệ thống.
        </p>
        <div className="pt-2">
          <Link
            href="/lms"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            ← Quay về Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u: LmsUserItem) => {
    const matchesRole = filterRole === "all" || u.roles.includes(filterRole as Role);
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone && u.phone.includes(searchTerm));
    return matchesRole && matchesSearch;
  });

  const handleToggleRole = (role: Role) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((r) => r !== role));
      }
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const res = await createUser({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      password,
      roleCodes: selectedRoles,
      title: title.trim() || undefined,
      status,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || "Không thể tạo người dùng mới.");
      return;
    }

    setIsAddUserOpen(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("Student@123456");
  };

  const handleToggleStatus = async (userId: string, currentStatus: string, userName: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "LOCKED" : "ACTIVE";
    const actionLabel = nextStatus === "LOCKED" ? "khóa" : "mở khóa";

    if (confirm(`Bạn có chắc muốn ${actionLabel} tài khoản của "${userName}"?`)) {
      const res = await updateUser(userId, { status: nextStatus });
      if (!res.success) {
        alert(res.error || "Không thể cập nhật trạng thái");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Phân quyền hệ thống
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            {activeRole === "ADMIN" ? "Quản Trị Người Dùng & Phân Quyền" : "Danh Sách Học Viên Của Tôi"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeRole === "ADMIN"
              ? "Quản lý tài khoản Học viên, Giảng viên và Quản trị viên. Phân quyền đa vai trò (Multi-Role) an toàn."
              : "Danh sách học viên thuộc các lớp học do Thầy phụ trách giảng dạy."}
          </p>
        </div>

        {activeRole === "ADMIN" && (
          <button
            onClick={() => {
              setFormError("");
              setIsAddUserOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Thêm Người Dùng Mới</span>
          </button>
        )}
      </div>

      {/* 2. FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "Tất cả" },
            { id: "STUDENT", label: "Học Viên" },
            { id: "TEACHER", label: "Giảng Viên" },
            { id: "ADMIN", label: "Quản Trị Viên" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterRole === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
          />
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* 3. USERS TABLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4">Email / SĐT</th>
                <th className="py-3 px-4">Vai trò (Roles)</th>
                <th className="py-3 px-4">Trạng thái</th>
                {activeRole === "ADMIN" && <th className="py-3 px-4 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: LmsUserItem) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.full_name}</span>
                          <span className="text-[11px] text-slate-400 block">{u.title || "Thành viên"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <span className="block font-mono text-[11px]">{u.email}</span>
                      <span className="block text-[11px] text-slate-400">{u.phone || "Chưa có SĐT"}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r: Role) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r === "ADMIN"
                                ? "bg-purple-100 text-purple-700"
                                : r === "TEACHER"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {r === "ADMIN" ? "Quản trị" : r === "TEACHER" ? "Giảng viên" : "Học viên"}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : u.status === "LOCKED"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.status === "ACTIVE" ? "Đang hoạt động" : u.status === "LOCKED" ? "Đã khóa" : u.status}
                      </span>
                    </td>

                    {activeRole === "ADMIN" && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status, u.full_name)}
                          className={`text-xs font-semibold ${
                            u.status === "ACTIVE"
                              ? "text-red-600 hover:text-red-700"
                              : "text-emerald-600 hover:text-emerald-700"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL THÊM NGƯỜI DÙNG MỚI (Admin only) */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-blue-600" />
                <span>Thêm Tài Khoản Người Dùng Mới</span>
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Văn Nam"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email đăng nhập *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nam.hoang@thayson.edu.vn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chức danh</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Học viên AI"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mật khẩu khởi tạo *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu bảo mật..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              {/* Multi-role checkboxes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Phân quyền vai trò (Có thể chọn nhiều role):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["STUDENT", "TEACHER", "ADMIN"] as Role[]).map((r) => (
                    <label
                      key={r}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs ${
                        selectedRoles.includes(r)
                          ? "bg-blue-50 border-blue-300 font-bold text-blue-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(r)}
                        onChange={() => handleToggleRole(r)}
                        className="w-3.5 h-3.5 rounded text-blue-600"
                      />
                      <span>
                        {r === "ADMIN" ? "Quản trị" : r === "TEACHER" ? "Giảng viên" : "Học viên"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Xác nhận tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
