"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationIcon } from "../lms/components/Icons";
import "@/lib/demoApi"; // bản tĩnh (GitHub Pages): mô phỏng /api trong trình duyệt

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Đăng nhập thất bại. Vui lòng thử lại.");
        setIsLoading(false);
        return;
      }

      // Successful login
      router.push("/lms");
      router.refresh();
    } catch {
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.");
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between select-none">
      {/* Header bar */}
      <header className="w-full h-16 bg-white border-b border-slate-200 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
            S
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight block">
              THẦY ĐỖ TRƯỜNG SƠN
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              CỔNG ĐÀO TẠO AI & DỮ LIỆU
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          ← Về Trang Chủ
        </Link>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <GraduationIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Đăng nhập Cổng Đào Tạo LMS
            </h1>
            <p className="text-xs text-slate-500">
              Nhập email và mật khẩu của bạn để truy cập hệ thống.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-fadeIn">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email tài khoản
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vidu@thayson.edu.vn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật khẩu
                </label>
                <span className="text-[11px] text-slate-400 hover:text-blue-600 cursor-pointer">
                  Quên mật khẩu?
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? "Đang xác thực..." : "ĐĂNG NHẬP LMS →"}
            </button>
          </form>

          {/* Quick Login Test Accounts for Local / Dev */}
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Tài khoản mẫu kiểm thử nhanh (Local Dev)
            </span>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("admin@thayson.edu.vn", "Admin@123456")}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-xs text-slate-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold block text-slate-900">👑 Quản trị viên (Admin)</span>
                  <span className="text-[10px] text-slate-400">admin@thayson.edu.vn</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Chọn</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("son.ai@thayson.edu.vn", "Teacher@123456")}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-xs text-slate-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold block text-slate-900">👨‍🏫 Giảng viên (Thầy Đỗ Trường Sơn)</span>
                  <span className="text-[10px] text-slate-400">son.ai@thayson.edu.vn</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Chọn</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("student1@thayson.edu.vn", "Student@123456")}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-xs text-slate-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold block text-slate-900">🎓 Học viên (Nguyễn Văn An)</span>
                  <span className="text-[10px] text-slate-400">student1@thayson.edu.vn</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Chọn</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200">
        Hệ thống Quản lý Đào tạo LMS • Thầy Đỗ Trường Sơn
      </footer>
    </div>
  );
}
