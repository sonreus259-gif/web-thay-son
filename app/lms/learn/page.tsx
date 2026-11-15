"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLms } from "../LmsContext";
import { BookIcon, CheckCircleIcon, GraduationIcon, ClockIcon } from "../components/Icons";

export default function StudentLearningPage() {
  const { currentUser, classes, sessions } = useLms();

  const [activeClassId, setActiveClassId] = useState<string>(classes[0]?.id || "");
  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];

  // Sessions of the active class
  const classSessions = sessions.filter((s) => s.class_id === activeClass?.id);

  // Lesson checklist state
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);
  const [qaInput, setQaInput] = useState("");
  const [qaList, setQaList] = useState([
    {
      author: "Nguyễn Văn An",
      time: "2 giờ trước",
      content: "Thầy Sơn ơi, khi triển khai Agentic AI với LangGraph thì nên dùng SQLite hay PostgreSQL để lưu Memory state ạ?",
      reply: "Thầy Sơn: Chào An, trong giai đoạn thử nghiệm em có thể dùng SQLite cho nhẹ, nhưng khi lên hệ thống thực tế doanh nghiệp nên dùng PostgreSQL hoặc Redis nhé!",
    },
  ]);

  if (!currentUser) return null;

  const toggleSessionComplete = (sessionId: string) => {
    if (completedSessions.includes(sessionId)) {
      setCompletedSessions(completedSessions.filter((id) => id !== sessionId));
    } else {
      setCompletedSessions([...completedSessions, sessionId]);
    }
  };

  const handlePostQa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaInput.trim()) return;
    setQaList([
      {
        author: currentUser.fullName,
        time: "Vừa xong",
        content: qaInput,
        reply: "Thầy Sơn: Thầy đã ghi nhận câu hỏi của em và sẽ giải đáp chi tiết trong buổi học tới hoặc gửi tài liệu qua LMS nhé!",
      },
      ...qaList,
    ]);
    setQaInput("");
  };

  const progressPercent = classSessions.length > 0
    ? Math.round((completedSessions.length / classSessions.length) * 100)
    : 25;

  return (
    <div className="space-y-6">
      {/* 1. HEADER & CLASS SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Phòng học trực tuyến
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            Không Gian Học Tập & Trợ Lý AI
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tham gia các buổi học trực tuyến, xem tài liệu bài giảng và tương tác trực tiếp cùng Thầy Đỗ Trường Sơn.
          </p>
        </div>

        {classes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Đang chọn lớp:</span>
            <select
              value={activeClassId}
              onChange={(e) => setActiveClassId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white shadow-2xs"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  [{cls.code}] {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {classes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <GraduationIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Chưa có lớp học được ghi danh</p>
          <p className="text-[11px] text-slate-400">
            Vui lòng liên hệ Quản trị viên để được ghi danh vào lớp đào tạo phù hợp.
          </p>
          <Link
            href="/lms/classes"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Xem danh sách lớp
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stage (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Classroom Banner */}
            <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-lg border border-slate-800 p-6 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Phòng học sẵn sàng
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white mt-1">
                  {activeClass?.name}
                </h2>
                <p className="text-xs text-slate-300">
                  Khóa học: {activeClass?.course_title} • Hình thức: {activeClass?.delivery_mode}
                </p>
              </div>

              {/* Next session info inside classroom */}
              {classSessions.length > 0 ? (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                    Buổi học kế tiếp:
                  </span>
                  <h4 className="text-sm font-bold text-white">{classSessions[0].title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ClockIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {new Date(classSessions[0].start_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(classSessions[0].end_at).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      , {new Date(classSessions[0].start_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {classSessions[0].meeting_url && (
                    <div className="pt-2">
                      <a
                        href={classSessions[0].meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
                      >
                        🚀 Tham gia lớp học trực tuyến ngay
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-800/80 text-xs text-slate-400">
                  Chưa có lịch buổi học nào được lên cho lớp này.
                </div>
              )}
            </div>

            {/* Q&A Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Hỏi đáp & Trao đổi cùng Giảng viên</span>
              </h3>

              <form onSubmit={handlePostQa} className="space-y-2">
                <textarea
                  rows={2}
                  value={qaInput}
                  onChange={(e) => setQaInput(e.target.value)}
                  placeholder="Đặt câu hỏi về bài giảng, code mẫu hoặc bài tập thực hành..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Gửi câu hỏi
                  </button>
                </div>
              </form>

              <div className="space-y-3 pt-2">
                {qaList.map((qa, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-bold text-slate-900">{qa.author}</span>
                      <span className="text-[11px] text-slate-400">{qa.time}</span>
                    </div>
                    <p className="text-slate-700">{qa.content}</p>
                    {qa.reply && (
                      <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-900 text-[11px] leading-relaxed">
                        {qa.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sessions checklist & Progress */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Tiến độ lớp học</span>
                <span className="font-bold text-blue-600">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Đã hoàn thành {completedSessions.length} / {classSessions.length} buổi học
              </p>
            </div>

            {/* Sessions Checklist */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookIcon className="w-4 h-4 text-blue-600" />
                <span>Nội dung các buổi học</span>
              </h3>

              {classSessions.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">Chưa có buổi học nào.</p>
              ) : (
                <div className="space-y-2">
                  {classSessions.map((sess) => {
                    const isDone = completedSessions.includes(sess.id);
                    return (
                      <div
                        key={sess.id}
                        onClick={() => toggleSessionComplete(sess.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                          isDone
                            ? "bg-emerald-50/50 border-emerald-200 text-slate-800"
                            : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}}
                          className="mt-0.5 w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                        />
                        <div className="flex-1">
                          <h4 className={`font-bold ${isDone ? "line-through text-slate-500" : "text-slate-900"}`}>
                            {sess.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {new Date(sess.start_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
