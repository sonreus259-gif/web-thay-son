"use client";

import React, { useState } from "react";
import { useLms } from "../LmsContext";
import { SettingsIcon } from "../components/Icons";

export default function SettingsPage() {
  const { currentUser, activeRole } = useLms();
  const [platformName, setPlatformName] = useState("Hệ Thống Đào Tạo AI & Data - Thầy Đỗ Trường Sơn");
  const [supportEmail, setSupportEmail] = useState("son.ai.data@lms.edu.vn");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <span>Cài đặt hệ thống</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tùy chỉnh thông tin hệ thống LMS đào tạo của Thầy Đỗ Trường Sơn.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên cổng đào tạo
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email liên hệ & Hỗ trợ kỹ thuật
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quyền hạn hiện tại
            </label>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
              Bạn đang thao tác với vai trò:{" "}
              <span className="font-bold text-blue-600 uppercase">{activeRole}</span> (
              {currentUser.fullName})
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              Lưu thay đổi
            </button>
            {saved && (
              <span className="text-xs font-semibold text-emerald-600 animate-fadeIn">
                ✓ Đã lưu cài đặt thành công!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
