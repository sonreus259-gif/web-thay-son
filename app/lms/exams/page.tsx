"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLms } from "../LmsContext";
import { ClipboardIcon, PlusIcon, CheckCircleIcon, ClockIcon } from "../components/Icons";

export default function ExamsPage() {
  const { currentUser, activeRole } = useLms();
  const [exams, setExams] = useState([
    {
      id: "exam-1",
      title: "Đánh Giá Năng Lực Nền Tảng: Python & Tư Duy Giải Thuật",
      course: "Python & Machine Learning thực chiến",
      duration: "45 phút",
      questionsCount: 30,
      passingScore: "70%",
      status: "active",
      submissions: 42,
    },
    {
      id: "exam-2",
      title: "Kiểm Tra Trắc Nghiệm: Prompt Engineering & RAG Architecture",
      course: "Generative AI Masterclass",
      duration: "30 phút",
      questionsCount: 25,
      passingScore: "80%",
      status: "active",
      submissions: 38,
    },
    {
      id: "exam-3",
      title: "Đề Thi Cuối Khóa: Thiết Kế Hệ Thống AI Agents Tự Động Hóa",
      course: "AI Agent Engineering Workflow",
      duration: "90 phút",
      questionsCount: 15,
      passingScore: "75%",
      status: "scheduled",
      submissions: 0,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardIcon className="w-6 h-6 text-blue-600" />
            <span>Kỳ thi & Đề kiểm tra</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đánh giá năng lực học viên về AI, Data và Lập trình thông qua các bài kiểm tra trắc nghiệm và thực hành.
          </p>
        </div>

        {activeRole !== "STUDENT" && (
          <button
            onClick={() => alert("Mở form tạo đề thi & ngân hàng câu hỏi mới.")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Tạo đề kiểm tra mới</span>
          </button>
        )}
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                  {exam.course}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    exam.status === "active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {exam.status === "active" ? "Đang mở" : "Sắp diễn ra"}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-1">
                {exam.title}
              </h3>

              <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-slate-400" />
                  <span>Thời lượng: {exam.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardIcon className="w-4 h-4 text-slate-400" />
                  <span>Số câu hỏi: {exam.questionsCount} câu</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-slate-400" />
                  <span>Điểm đạt chuẩn: {exam.passingScore}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {exam.submissions} lượt đã nộp bài
              </span>

              <button
                onClick={() => alert(`Bắt đầu làm bài thi: ${exam.title}`)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                {activeRole === "STUDENT" ? "Làm bài thi" : "Xem kết quả"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
