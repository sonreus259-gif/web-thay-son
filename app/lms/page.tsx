"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLms } from "./LmsContext";
import {
  BookIcon,
  UsersIcon,
  GraduationIcon,
  ClockIcon,
  VideoIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ClipboardIcon,
  BarChartIcon,
  MedalIcon,
  PlusIcon,
} from "./components/Icons";

export default function LmsDashboardPage() {
  const { currentUser, activeRole, courses, classes, sessions, users } = useLms();
  const [rankingPeriod, setRankingPeriod] = useState<"week" | "month">("week");

  if (!currentUser) return null;

  const totalStudents = users.filter((u) => u.roles.includes("STUDENT")).length;
  const activeClasses = classes.filter((c) => c.status !== "CANCELLED").length;
  const totalCourses = courses.length;

  // Next upcoming session
  const nextSession = sessions.length > 0 ? sessions[0] : null;

  // Donut chart calculations
  const radius = 62;
  const circumference = 2 * Math.PI * radius; // ~389.55
  const completedStroke = circumference * 0.4583;
  const inProgressStroke = circumference * 0.2917;
  const notStartedStroke = circumference * 0.25;

  return (
    <div className="space-y-6">
      {/* 1. GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Chào mừng trở lại, {currentUser.fullName}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeRole === "ADMIN"
              ? "Bức tranh tổng quan về toàn bộ hệ thống đào tạo AI, Data & Lập trình hôm nay."
              : activeRole === "TEACHER"
              ? `Không gian giảng dạy của Thầy Sơn • Đang phụ trách ${classes.length} lớp học.`
              : `Không gian học tập cá nhân • Đã ghi danh ${classes.length} lớp học.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            {activeRole === "ADMIN"
              ? "👑 Quản trị viên"
              : activeRole === "TEACHER"
              ? "👨‍🏫 Giảng viên"
              : "🎓 Học viên"}
          </span>
        </div>
      </div>

      {/* SPECIAL HIGHLIGHT CARD FOR STUDENT: LỊCH HỌC TIẾP THEO (Requirement XI) */}
      {activeRole === "STUDENT" && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-200">
              LỊCH HỌC TIẾP THEO
            </span>
            {nextSession ? (
              <>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{nextSession.class_code}</span>
                  <span>•</span>
                  <span>{nextSession.title}</span>
                </h3>
                <div className="flex items-center gap-3 text-xs text-blue-100 pt-1">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" />
                    <span>
                      {new Date(nextSession.start_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(nextSession.end_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      , {new Date(nextSession.start_at).toLocaleDateString("vi-VN")}
                    </span>
                  </span>
                  {nextSession.teacher_name && <span>Giảng viên: {nextSession.teacher_name}</span>}
                </div>
              </>
            ) : (
              <p className="text-sm font-semibold text-blue-100">Chưa có lịch học sắp tới.</p>
            )}
          </div>

          {nextSession?.meeting_url ? (
            <a
              href={nextSession.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all shadow-xs text-center flex-shrink-0"
            >
              Vào Phòng Học Trực Tuyến ↗
            </a>
          ) : (
            <Link
              href="/lms/classes"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 text-center flex-shrink-0"
            >
              Xem Lớp Học Của Tôi →
            </Link>
          )}
        </div>
      )}

      {/* 2. TOP METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {activeRole === "STUDENT" ? "Lớp đang học" : "Tổng học viên"}
              </p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
                {activeRole === "STUDENT" ? classes.length : totalStudents || 1}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <BookIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 truncate">
                {activeRole === "STUDENT" ? "Khóa đã tham gia" : "Tổng khóa học"}
              </p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
                {totalCourses}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <GraduationIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 truncate">
                Lớp hoạt động
              </p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
                {activeClasses}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <ClockIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 truncate">Buổi học sắp tới</p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
                {sessions.length}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <VideoIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 truncate">Thời lượng video</p>
              <h3 className="text-xs font-bold text-slate-900 leading-tight mt-1 truncate">
                731 <span className="text-[10px] text-slate-400 font-normal">/ 1000 ph</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <CheckCircleIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500 truncate">Tài khoản Active</p>
              <h3 className="text-xl font-bold text-slate-900 leading-tight mt-0.5">
                {users.length || 3}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROW 2: TIẾN ĐỘ HỌC TẬP (DONUT CHART) + HOẠT ĐỘNG TRONG TUẦN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Donut Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Tổng quan tiến độ đào tạo</h2>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth="18"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#2563eb"
                  strokeWidth="18"
                  strokeDasharray={`${completedStroke} ${circumference}`}
                  strokeDashoffset={0}
                  fill="transparent"
                  strokeLinecap="round"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#f97316"
                  strokeWidth="18"
                  strokeDasharray={`${inProgressStroke} ${circumference}`}
                  strokeDashoffset={-completedStroke - 6}
                  fill="transparent"
                  strokeLinecap="round"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#cbd5e1"
                  strokeWidth="18"
                  strokeDasharray={`${notStartedStroke} ${circumference}`}
                  strokeDashoffset={-completedStroke - inProgressStroke - 12}
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">45.83%</span>
                <span className="text-[11px] font-medium text-slate-400 mt-0.5">tỉ lệ hoàn thành</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" />
                <span className="text-slate-700 font-medium">Hoàn thành</span>
                <span className="text-slate-400 font-normal ml-auto pl-4">45.8%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
                <span className="text-slate-700 font-medium">Đang học</span>
                <span className="text-slate-400 font-normal ml-auto pl-4">29.2%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-slate-300 flex-shrink-0" />
                <span className="text-slate-700 font-medium">Chưa bắt đầu</span>
                <span className="text-slate-400 font-normal ml-auto pl-4">25.0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Hoạt động trong tuần */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Hoạt động trong tuần</h2>

          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center mb-2">
                <UserPlusIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                {totalStudents || 1}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1">Học viên ghi danh</span>
            </div>

            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center mb-2">
                <BookIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                {courses.length}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1">Khóa học mở</span>
            </div>

            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100/70 text-amber-600 flex items-center justify-center mb-2">
                <ClipboardIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                {sessions.length}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1">Buổi học lên lịch</span>
            </div>

            <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100/70 text-amber-600 flex items-center justify-center mb-2">
                <GraduationIcon className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-slate-900 leading-tight">
                {classes.length}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1">Lớp học triển khai</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 3: KHÓA HỌC & BẢNG XẾP HẠNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Khóa học */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">Khóa học đào tạo thực chiến</h2>
              <Link href="/lms/courses" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
                Xem tất cả &gt;
              </Link>
            </div>

            <div className="space-y-3">
              {courses.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/30 hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-tight flex-shrink-0">
                      {c.code || "AI"}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {c.category} • {c.level} • {c.duration_weeks} tuần
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="block text-sm font-extrabold text-blue-600 leading-tight">
                      {c.total_students || 1}
                    </span>
                    <span className="block text-[10px] text-slate-400">học viên</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activeRole === "ADMIN" && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Quản trị chương trình đào tạo</span>
              <Link
                href="/lms/courses"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Tạo khóa học</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right: Bảng xếp hạng */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="text-amber-500">★</span>
                <span>Bảng xếp hạng học tập</span>
              </h2>

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setRankingPeriod("week")}
                  className={`px-3 py-1 rounded-md transition-all text-[11px] ${
                    rankingPeriod === "week"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tuần
                </button>
                <button
                  onClick={() => setRankingPeriod("month")}
                  className={`px-3 py-1 rounded-md transition-all text-[11px] ${
                    rankingPeriod === "month"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tháng
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {/* Rank 1 */}
              <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <MedalIcon className="w-6 h-6 flex-shrink-0" color="gold" />
                  <div className="w-9 h-9 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{currentUser.fullName}</span>
                      <span className="text-[10px] text-blue-600 font-semibold">(Bạn)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {rankingPeriod === "week" ? "35 điểm" : "150 điểm"}
                    </p>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  ✓
                </div>
              </div>

              {/* Other sample ranks */}
              <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <MedalIcon className="w-6 h-6 flex-shrink-0" color="silver" />
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    AN
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Nguyễn Văn An</h4>
                    <p className="text-[11px] text-slate-500">
                      {rankingPeriod === "week" ? "25 điểm" : "120 điểm"} • Lớp AI-K01
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">#2</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <MedalIcon className="w-6 h-6 flex-shrink-0" color="bronze" />
                  <div className="w-9 h-9 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    TM
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Trần Thị Mai</h4>
                    <p className="text-[11px] text-slate-500">
                      {rankingPeriod === "week" ? "18 điểm" : "90 điểm"} • Lớp AI-K01
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">#3</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tích lũy điểm khi hoàn thành buổi học & bài tập</span>
            <Link href="/lms/classes" className="text-blue-600 font-semibold hover:underline">
              Vào lớp học &gt;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
