"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LmsProvider, useLms, Role } from "./LmsContext";
import {
  DashboardIcon,
  BookIcon,
  UsersIcon,
  GraduationIcon,
  ShieldIcon,
  CalendarIcon,
  BellIcon,
  FileTextIcon,
  GridIcon,
  HelpIcon,
  SettingsIcon,
  ExportIcon,
  ImportIcon,
  LogoutIcon,
} from "./components/Icons";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  badgeAi?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function LmsLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, activeRole, switchActiveRole, isLoadingUser, logout } = useLms();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Redirect to /login if unauthenticated
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push("/login");
    }
  }, [isLoadingUser, currentUser, router]);

  // Loading Screen while verifying session
  if (isLoadingUser || !currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Đang kiểm tra phiên đăng nhập LMS...</span>
      </div>
    );
  }

  // Role-based Nav Sections
  let navSections: NavSection[] = [];

  if (activeRole === "ADMIN") {
    navSections = [
      {
        title: "QUẢN LÝ ĐÀO TẠO",
        items: [
          { label: "Khóa học AI & Data", icon: <BookIcon />, href: "/lms/courses", badgeAi: true },
          { label: "Lớp học & Gán học viên", icon: <UsersIcon />, href: "/lms/classes" },
          { label: "Lịch lớp học & Buổi học", icon: <CalendarIcon />, href: "/lms/sessions" },
        ],
      },
      {
        title: "NGƯỜI DÙNG & HỆ THỐNG",
        items: [
          { label: "Người dùng & Phân quyền", icon: <ShieldIcon />, href: "/lms/users" },
          { label: "Cài đặt hệ thống", icon: <SettingsIcon />, href: "/lms/settings" },
        ],
      },
    ];
  } else if (activeRole === "TEACHER") {
    navSections = [
      {
        title: "GIẢNG DẠY & ĐÀO TẠO",
        items: [
          { label: "Lớp học phụ trách", icon: <UsersIcon />, href: "/lms/classes" },
          { label: "Lịch giảng dạy", icon: <CalendarIcon />, href: "/lms/sessions" },
          { label: "Học viên của tôi", icon: <ShieldIcon />, href: "/lms/users" },
          { label: "Phòng học trực tuyến", icon: <GraduationIcon />, href: "/lms/learn", badgeAi: true },
        ],
      },
    ];
  } else {
    // STUDENT
    navSections = [
      {
        title: "HỌC TẬP CỦA TÔI",
        items: [
          { label: "Khóa học của tôi", icon: <BookIcon />, href: "/lms/courses" },
          { label: "Lớp học của tôi", icon: <UsersIcon />, href: "/lms/classes" },
          { label: "Lịch học của tôi", icon: <CalendarIcon />, href: "/lms/sessions" },
          { label: "Vào phòng học", icon: <GraduationIcon />, href: "/lms/learn", badgeAi: true },
        ],
      },
    ];
  }

  const roleLabel =
    activeRole === "ADMIN"
      ? "Quản trị viên"
      : activeRole === "TEACHER"
      ? "Giảng viên"
      : "Học viên";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 w-full h-14 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Hamburger + Blue Module Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            ☰
          </button>

          <div className="flex items-center gap-2">
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs">
              <GraduationIcon className="w-4 h-4" />
              <span>Quản trị đào tạo</span>
            </div>
          </div>
        </div>

        {/* Right Tools & User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Role Pill */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-tight">
            <span>Vai trò:</span>
            <span className="text-blue-900">{roleLabel}</span>
          </div>

          {/* Language Switcher */}
          <button className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs hover:bg-blue-100 transition-colors">
            文A
          </button>

          {/* Grid Apps */}
          <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors">
            <GridIcon className="w-4 h-4" />
          </button>

          {/* Help Question Icon */}
          <button className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors">
            <HelpIcon className="w-4 h-4" />
          </button>

          {/* Notification Bell with Badge */}
          <button className="relative w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-colors">
            <BellIcon className="w-4 h-4 text-blue-600" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              2
            </span>
          </button>

          {/* User Profile Pill with Interactive Dropdown */}
          <div className="relative pl-2 border-l border-slate-200" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors text-left"
            >
              <div className="hidden sm:block text-right">
                <span className="block text-[10px] text-slate-400 font-medium">Xin chào!</span>
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.fullName}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                {currentUser.fullName.charAt(0)}
              </div>
            </button>

            {/* DROPDOWN MENU */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Đổi ngữ cảnh vai trò:
                  </span>
                  <span className="text-xs font-bold text-blue-600 block mt-0.5">
                    {roleLabel} (Đang dùng)
                  </span>
                </div>

                {/* Role Switcher Options - ONLY shows roles the user actually has in database! */}
                <div className="px-2 py-1">
                  {currentUser.roles.includes("ADMIN") && (
                    <button
                      onClick={() => {
                        switchActiveRole("ADMIN");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg flex items-center justify-between hover:bg-slate-50 text-slate-800"
                    >
                      <span>Quản trị viên</span>
                      {activeRole === "ADMIN" && (
                        <span className="text-emerald-500 font-bold">✓</span>
                      )}
                    </button>
                  )}

                  {currentUser.roles.includes("TEACHER") && (
                    <button
                      onClick={() => {
                        switchActiveRole("TEACHER");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg flex items-center justify-between hover:bg-slate-50 text-slate-800"
                    >
                      <span>Giảng viên</span>
                      {activeRole === "TEACHER" && (
                        <span className="text-emerald-500 font-bold">✓</span>
                      )}
                    </button>
                  )}

                  {currentUser.roles.includes("STUDENT") && (
                    <button
                      onClick={() => {
                        switchActiveRole("STUDENT");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg flex items-center justify-between hover:bg-slate-50 text-slate-800"
                    >
                      <span>Học viên</span>
                      {activeRole === "STUDENT" && (
                        <span className="text-emerald-500 font-bold">✓</span>
                      )}
                    </button>
                  )}
                </div>

                <div className="my-1 border-t border-slate-100" />

                {/* Sub-menu items */}
                <div className="px-2 py-1 space-y-0.5 text-xs text-slate-700 font-medium">
                  <div className="w-full px-3 py-1.5 text-left rounded-lg text-slate-400 text-[11px]">
                    Email: {currentUser.email}
                  </div>
                </div>

                <div className="my-1 border-t border-slate-100" />

                <div className="px-2 py-1">
                  <Link
                    href="/"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-slate-50 text-blue-600 flex items-center gap-2.5"
                  >
                    <span className="text-sm">←</span>
                    <span>Về Trang Chủ 3D</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2.5"
                  >
                    <LogoutIcon className="w-4 h-4 text-red-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + CONTENT */}
      <div className="flex-1 flex">
        {/* SIDEBAR */}
        <aside
          className={`fixed md:sticky top-14 h-[calc(100vh-3.5rem)] w-60 border-r border-slate-200 bg-white p-3.5 flex flex-col justify-between z-30 transition-transform duration-300 overflow-y-auto ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="space-y-4">
            {/* Top Brand Logo */}
            <div className="px-2 py-2 flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                S
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 tracking-tight block">
                  THẦY ĐỖ TRƯỜNG SƠN
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  LMS ĐÀO TẠO AI & DATA
                </span>
              </div>
            </div>

            {/* Dashboard active button */}
            <Link
              href="/lms"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                pathname === "/lms"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <DashboardIcon className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {/* Nav Sections */}
            <div className="space-y-4 pt-1">
              {navSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {section.title}
                  </span>
                  <div className="space-y-0.5">
                    {section.items.map((item, itemIdx) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={itemIdx}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                            isActive
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={isActive ? "text-blue-600" : "text-slate-400"}>
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                          </div>
                          {item.badgeAi && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 uppercase">
                              AI
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom user badge */}
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="text-[11px] truncate">{currentUser.fullName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
              {activeRole}
            </span>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function LmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <LmsProvider>
      <LmsLayoutContent>{children}</LmsLayoutContent>
    </LmsProvider>
  );
}
