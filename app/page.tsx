"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Character3D from "./components/Character3D";

export default function Home() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginTab, setLoginTab] = useState<"student" | "instructor">("student");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bgTheme, setBgTheme] = useState<"twilight" | "sunset" | "core">("twilight");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Audio Context Ref for cyber/focus ambient soundtrack
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const router = useRouter();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      triggerToast("Vui lòng nhập Email hoặc Mã học viên");
      return;
    }
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    triggerToast(`Đăng nhập thành công! Đang chuyển hướng vào hệ thống LMS...`);
    setTimeout(() => {
      if (loginTab === "student") {
        router.push("/lms/learn");
      } else {
        router.push("/lms");
      }
    }, 600);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    triggerToast("Đã đăng xuất khỏi cổng học tập.");
  };

  const toggleAudio = () => {
    if (!isAudioEnabled) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        // Cyber focus synth chord: C minor 9 (C3, Eb3, G3, Bb3, D4)
        const freqs = [130.81, 155.56, 196.0, 233.08, 293.66];
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.connect(ctx.destination);

        const oscs = freqs.map((f, i) => {
          const osc = ctx.createOscillator();
          osc.type = i % 2 === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          const lfo = ctx.createOscillator();
          lfo.frequency.setValueAtTime(0.12 + i * 0.05, ctx.currentTime);
          const lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(1.0, ctx.currentTime);
          lfo.connect(osc.frequency);
          lfo.start();

          osc.connect(gainNode);
          osc.start();
          return osc;
        });

        oscNodesRef.current = oscs;
        setIsAudioEnabled(true);
        triggerToast("Đã bật âm thanh tập trung nghiên cứu AI");
      } catch (err) {
        console.error("Audio init error:", err);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsAudioEnabled(false);
      triggerToast("Đã tắt âm thanh");
    }
  };

  const courses = [
    {
      id: "AI-01",
      badge: "HOT • THỰC CHIẾN",
      title: "ỨNG DỤNG AI & GENAI TOÀN DIỆN",
      category: "Trí tuệ nhân tạo (AI)",
      desc: "Làm chủ ChatGPT, Claude, Gemini, xây dựng AI Agents tự hành, tự động hóa quy trình nghiệp vụ và tích hợp LLMs vào doanh nghiệp.",
      lessons: "36 bài giảng",
      duration: "8 tuần",
      rating: "5.0 ★",
    },
    {
      id: "DATA-02",
      badge: "CHUYÊN SÂU",
      title: "KHOA HỌC DỮ LIỆU & PHÂN TÍCH (DATA SCIENCE)",
      category: "Dữ liệu lớn (Big Data)",
      desc: "Từ tư duy dữ liệu, xử lý dữ liệu lớn với Python & SQL, xây dựng Dashboard PowerBI chuẩn doanh nghiệp đến Machine Learning ứng dụng.",
      lessons: "42 bài giảng",
      duration: "10 tuần",
      rating: "5.0 ★",
    },
    {
      id: "DEV-03",
      badge: "FULL-STACK CODE",
      title: "LẬP TRÌNH ỨNG DỤNG & FULL-STACK HIỆN ĐẠI",
      category: "Kỹ thuật phần mềm",
      desc: "Thực hành xây dựng hệ thống Web SaaS quy mô lớn với Next.js, TypeScript, RESTful API và tích hợp mô hình AI vào sản phẩm.",
      lessons: "48 bài giảng",
      duration: "12 tuần",
      rating: "4.9 ★",
    },
  ];

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#020617] text-white select-none flex flex-col justify-between font-sans">
      {/* 1. DREAMFRAME SURREAL AI WONDERLAND BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Image
          src={
            bgTheme === "twilight"
              ? "/ai-bg-dream-twilight.jpg"
              : bgTheme === "sunset"
              ? "/ai-bg-dream-sunset.jpg"
              : "/ai-bg-core.jpg"
          }
          alt="Không gian AI và Dữ liệu Thầy Đỗ Trường Sơn"
          fill
          priority
          quality={100}
          className="object-cover object-center filter brightness-[1.0] contrast-[1.06] transition-all duration-700"
        />
        {/* Soft magical twilight gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0728]/80 via-transparent to-[#0f0728]/45 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,114,182,0.06)_0%,rgba(15,7,40,0.5)_90%)] pointer-events-none" />
      </div>

      {/* 2. FLOATING MAGICAL SPARKS & GLOWING FIREFLIES */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {[...Array(28)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full blur-[0.4px] animate-pulse ${
              i % 3 === 0
                ? "bg-amber-300"
                : i % 3 === 1
                ? "bg-pink-300"
                : "bg-cyan-200"
            }`}
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 88 + 5}%`,
              left: `${Math.random() * 92 + 4}%`,
              boxShadow:
                i % 3 === 0
                  ? "0 0 12px 3px rgba(251, 191, 36, 0.85)"
                  : i % 3 === 1
                  ? "0 0 12px 3px rgba(244, 114, 182, 0.85)"
                  : "0 0 12px 3px rgba(103, 232, 249, 0.85)",
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 3. TOP BAR NAVIGATION & LMS TOOLBAR */}
      <header className="relative z-30 w-full px-4 sm:px-8 md:px-12 py-5 flex items-center justify-between pointer-events-auto">
        {/* Left: Brand Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-xl border border-cyan-500/35 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer transition-all duration-300 group">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs sm:text-sm font-black tracking-[0.2em] text-white uppercase group-hover:text-cyan-300 transition-colors">
              THẦY ĐỖ TRƯỜNG SƠN
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-[11px] font-semibold tracking-wider text-cyan-300/90 bg-cyan-950/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30">
            <span className="text-cyan-400">❖</span>
            <span>AI • DATA SCIENCE • LẬP TRÌNH</span>
          </div>
        </div>

        {/* Center: Audio & Navigation Links */}
        <div className="hidden md:flex items-center gap-6 px-6 py-2.5 rounded-full bg-black/65 backdrop-blur-xl border border-white/15 shadow-xl text-xs font-semibold tracking-wider text-neutral-300">
          <button
            onClick={() => setIsCoursesModalOpen(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            KHÓA HỌC
          </button>
          <span className="text-white/20">•</span>
          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            LỘ TRÌNH
          </button>
          <span className="text-white/20">•</span>
          <button
            onClick={toggleAudio}
            className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
            title="Bật/Tắt âm thanh tập trung"
          >
            <span>{isAudioEnabled ? "🔊 AUDIO ON" : "🔈 AUDIO OFF"}</span>
          </button>
          <span className="text-white/20">•</span>
          <button
            onClick={() => {
              const next: "twilight" | "sunset" | "core" =
                bgTheme === "twilight"
                  ? "sunset"
                  : bgTheme === "sunset"
                  ? "core"
                  : "twilight";
              setBgTheme(next);
              triggerToast(
                next === "twilight"
                  ? "🌌 Dreamframe: Hoàng Hôn Lãng Mạn & Robot AI Trên Mây"
                  : next === "sunset"
                  ? "🌸 Dreamframe: Cánh Đồng Hoa & Cổng Mặt Trời AI"
                  : "🔮 High-Tech: Lõi Lượng Tử AI Quantum Core"
              );
            }}
            className="flex items-center gap-1.5 text-amber-300 hover:text-pink-300 transition-colors font-bold"
            title="Đổi phong cách nền Dreamframe AI"
          >
            <span>✨ ĐỔI NỀN</span>
          </button>
        </div>

        {/* Right: LMS Login & Direct Access */}
        <div className="flex items-center gap-3">
          <Link
            href="/lms"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-400 hover:text-black text-cyan-300 border border-cyan-500/40 text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <span>🚀 CỔNG LMS ↗</span>
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/lms/learn"
                className="px-4 py-2 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-black tracking-wider transition-all shadow-lg"
              >
                Vào Phòng Học →
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-full bg-black/60 hover:bg-red-950/80 text-neutral-300 hover:text-red-300 border border-white/20 hover:border-red-500/40 text-xs font-medium backdrop-blur-xl transition-all"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black text-xs font-black tracking-[0.16em] uppercase shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all duration-300 active:scale-95"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              <span>ĐĂNG NHẬP LMS</span>
            </Link>
          )}
        </div>
      </header>

      {/* 4. BALANCED CENTER STAGE TYPOGRAPHY (PERFECT SYMMETRY AROUND HEAD) */}
      <div className="relative flex-1 w-full flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 flex flex-col items-center justify-center select-none z-10 pointer-events-none -translate-y-6 sm:-translate-y-10">
          {/* Top Pill Tag (Above head) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/75 border border-cyan-500/40 text-cyan-300 text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase backdrop-blur-md mb-2 sm:mb-4 shadow-[0_0_20px_rgba(6,182,212,0.35)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI ARCHITECTURE • BIG DATA • FULLSTACK CODE</span>
          </div>

          {/* Symmetrical Left/Right Brand Typography */}
          <div className="w-full max-w-[1360px] px-6 sm:px-12 md:px-20 lg:px-28 flex items-center justify-between">
            {/* Left: THẦY */}
            <div className="text-left">
              <span className="block text-[14vw] sm:text-[13vw] md:text-[12vw] lg:text-[150px] xl:text-[180px] font-black tracking-[-0.03em] text-white leading-none drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]">
                THẦY
              </span>
              <span className="block text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] text-cyan-400 uppercase mt-1 pl-1">
                // ARTIFICIAL INTELLIGENCE
              </span>
            </div>

            {/* Right: SƠN */}
            <div className="text-right">
              <span className="block text-[14vw] sm:text-[13vw] md:text-[12vw] lg:text-[150px] xl:text-[180px] font-black tracking-[-0.03em] text-white leading-none drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]">
                SƠN
              </span>
              <span className="block text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] text-amber-300 uppercase mt-1 pr-1">
                // DATA SCIENCE & CODING
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 3D CHARACTER PORTRAIT CONTAINER - ANCHORED FLUSH TO BOTTOM OF ENTIRE SCREEN */}
      <div className="absolute inset-x-0 bottom-0 top-0 z-20 flex items-end justify-center pointer-events-none overflow-hidden">
        <div className="relative w-full h-[88vh] sm:h-[92vh] md:h-[96vh] max-w-[1100px] flex items-end justify-center pointer-events-auto">
          <Character3D modelUrl="/realistic-man.glb" bgTheme={bgTheme} />
        </div>
      </div>

      {/* 6. BOTTOM FLOATING BAR */}
      <footer className="relative z-30 w-full px-4 sm:px-8 md:px-12 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
        {/* Left: Mission Statement Card */}
        <div className="bg-black/75 hover:bg-black/90 backdrop-blur-xl border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-4 sm:p-5 max-w-[360px] md:max-w-[440px] shadow-[0_15px_35px_rgba(0,0,0,0.85)] transition-all duration-300">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] tracking-widest uppercase font-bold text-cyan-300">
              TRUNG TÂM ĐÀO TẠO CÔNG NGHỆ CAO
            </span>
          </div>
          <p className="text-xs sm:text-[13px] font-normal text-neutral-200 leading-relaxed tracking-wide">
            Cùng Thầy Đỗ Trường Sơn làm chủ Trí tuệ nhân tạo (AI), kỹ thuật Dữ liệu (Data) và tư duy Lập trình thực chiến để bứt phá trong kỷ nguyên số.
          </p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsCoursesModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black/75 hover:bg-white text-white hover:text-black border border-cyan-500/40 hover:border-white text-xs font-bold tracking-[0.16em] uppercase backdrop-blur-xl shadow-xl transition-all duration-300 group"
          >
            <span>Khám phá Khóa học</span>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </button>

          <button
            onClick={() => setIsAboutModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-cyan-400 hover:bg-white text-black border border-cyan-400 hover:border-white text-xs font-black tracking-[0.16em] uppercase shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all duration-300 group"
          >
            <span>Về Thầy Sơn</span>
            <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </button>
        </div>
      </footer>

      {/* MODAL 1: KHÓA HỌC TIÊU BIỂU */}
      {isCoursesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#0b1120] border border-cyan-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-10 relative shadow-[0_0_50px_rgba(6,182,212,0.25)]">
            <button
              onClick={() => setIsCoursesModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-neutral-700 hover:border-cyan-400 transition-colors"
            >
              Đóng ✕
            </button>

            <div className="mb-8">
              <span className="text-[11px] font-mono tracking-[0.25em] text-cyan-400 uppercase">
                HỆ THỐNG ĐÀO TẠO CHUYÊN SÂU
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 uppercase tracking-tight">
                CÁC KHÓA HỌC DO THẦY SƠN GIẢNG DẠY
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 tracking-wide mt-2">
                Chương trình học thực chiến, cập nhật công nghệ mới nhất về Trí tuệ Nhân tạo, Khoa học Dữ liệu và Kỹ thuật phần mềm.
              </p>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="bg-black/60 border border-neutral-800 hover:border-cyan-400/80 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                        {c.badge}
                      </span>
                      <span className="text-cyan-400 font-bold text-xs">{c.rating}</span>
                    </div>

                    <h3 className="text-sm font-black tracking-wide text-white group-hover:text-cyan-300 transition-colors uppercase leading-snug">
                      {c.title}
                    </h3>
                    <span className="inline-block text-[11px] font-medium text-emerald-400 mt-1">
                      {c.category}
                    </span>
                    <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-800">
                    <div className="flex justify-between items-center text-[11px] text-neutral-400 mb-3">
                      <span>📚 {c.lessons}</span>
                      <span>⏱ {c.duration}</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsCoursesModalOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="w-full py-2.5 rounded-full bg-cyan-950/80 hover:bg-cyan-400 hover:text-black text-cyan-200 text-xs font-bold uppercase tracking-wider border border-cyan-500/30 transition-all"
                    >
                      Đăng Ký Khóa Học
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VỀ THẦY ĐỖ TRƯỜNG SƠN */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#0b1120] border border-cyan-500/30 max-w-2xl w-full rounded-3xl p-6 sm:p-8 relative shadow-[0_0_50px_rgba(6,182,212,0.25)]">
            <button
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white text-xs uppercase tracking-widest px-3 py-1.5 rounded-full border border-neutral-700 hover:border-cyan-400 transition-colors"
            >
              Đóng ✕
            </button>

            <span className="text-[11px] font-mono tracking-[0.25em] text-cyan-400 uppercase">
              THÔNG TIN GIẢNG VIÊN
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 uppercase tracking-tight">
              THẦY ĐỖ TRƯỜNG SƠN
            </h2>
            <p className="text-xs text-cyan-400 font-semibold mt-0.5">
              Chuyên gia Đào tạo AI • Khoa học Dữ liệu (Data) • Lập trình Phần mềm
            </p>

            <div className="my-5 p-4 rounded-2xl bg-black/60 border border-white/10 text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-3">
              <p>
                Với nhiều năm kinh nghiệm nghiên cứu và triển khai thực tế trong lĩnh vực công nghệ thông tin, Thầy Đỗ Trường Sơn mang đến phương pháp giảng dạy trực quan, thực chiến và dễ tiếp cận nhất cho học viên ở mọi trình độ.
              </p>
              <p>
                🎯 <strong>Triết lý đào tạo:</strong> Học đi đôi với hành, biến những lý thuyết phức tạp của AI và Khoa học Dữ liệu thành các giải pháp ứng dụng thiết thực, có thể triển khai ngay vào công việc và dự án thực tế.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 my-5 text-center">
              <div className="bg-black/50 border border-cyan-500/20 rounded-xl p-3">
                <span className="text-lg font-black text-cyan-300">1000+</span>
                <p className="text-[10px] text-neutral-400 uppercase mt-0.5">Học viên theo học</p>
              </div>
              <div className="bg-black/50 border border-cyan-500/20 rounded-xl p-3">
                <span className="text-lg font-black text-cyan-300">100%</span>
                <p className="text-[10px] text-neutral-400 uppercase mt-0.5">Học thực chiến</p>
              </div>
              <div className="bg-black/50 border border-cyan-500/20 rounded-xl p-3">
                <span className="text-lg font-black text-cyan-300">24/7</span>
                <p className="text-[10px] text-neutral-400 uppercase mt-0.5">Hỗ trợ kỹ thuật</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsAboutModalOpen(false);
                  setIsCoursesModalOpen(true);
                }}
                className="flex-1 py-3 text-center rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs uppercase tracking-wider transition-colors shadow-lg"
              >
                Xem Danh Sách Khóa Học
              </button>
              <button
                onClick={() => {
                  setIsAboutModalOpen(false);
                  triggerToast("Liên hệ: Hãy kết nối qua Zalo / Email của Thầy Sơn");
                }}
                className="flex-1 py-3 text-center rounded-full bg-black/70 hover:bg-white hover:text-black text-white border border-white/30 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Liên Hệ Tư Vấn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ĐĂNG NHẬP HỆ THỐNG LMS */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#0b1120] border border-cyan-500/30 max-w-md w-full rounded-3xl p-6 sm:p-8 relative shadow-[0_0_50px_rgba(6,182,212,0.25)]">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white text-xs uppercase tracking-widest px-2.5 py-1 rounded-full border border-neutral-700 hover:border-cyan-400 transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-400 uppercase">
                CỔNG HỌC TẬP TRỰC TUYẾN
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase tracking-tight">
                ĐĂNG NHẬP LMS
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Hệ thống Quản lý Học tập Thầy Đỗ Trường Sơn
              </p>
            </div>

            {/* Role Tabs */}
            <div className="flex bg-black/50 p-1 rounded-full border border-white/10 mb-5">
              <button
                type="button"
                onClick={() => setLoginTab("student")}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                  loginTab === "student"
                    ? "bg-cyan-400 text-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Học Viên
              </button>
              <button
                type="button"
                onClick={() => setLoginTab("instructor")}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
                  loginTab === "instructor"
                    ? "bg-cyan-400 text-black shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Giảng Viên
              </button>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  {loginTab === "student" ? "Email hoặc Mã học viên" : "Email Giảng viên"}
                </label>
                <input
                  type="text"
                  placeholder={
                    loginTab === "student"
                      ? "hv.truongson@gmail.com"
                      : "gv.truongson@lms.edu.vn"
                  }
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded accent-cyan-400"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    triggerToast("Vui lòng liên hệ Thầy Sơn để cấp lại mật khẩu.")
                  }
                  className="hover:text-cyan-300 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs uppercase tracking-[0.2em] shadow-lg transition-all"
              >
                VÀO HỌC NGAY
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <span className="text-[11px] text-neutral-400">
                Hoặc đăng nhập nhanh bằng
              </span>
              <div className="flex gap-2.5 mt-3">
                <button
                  onClick={() => {
                    setIsLoggedIn(true);
                    setIsLoginModalOpen(false);
                    triggerToast("Đăng nhập thành công! Đang vào hệ thống...");
                    setTimeout(() => router.push(loginTab === "student" ? "/lms/learn" : "/lms"), 500);
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-medium border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Google</span>
                </button>
                <button
                  onClick={() => {
                    setIsLoggedIn(true);
                    setIsLoginModalOpen(false);
                    triggerToast("Đăng nhập thành công! Đang vào hệ thống...");
                    setTimeout(() => router.push(loginTab === "student" ? "/lms/learn" : "/lms"), 500);
                  }}
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-medium border border-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Microsoft</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1120] border border-cyan-400/50 text-white text-xs px-4 py-3 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2.5 animate-bounce">
          <span className="text-cyan-400 text-base">❖</span>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}
    </main>
  );
}
