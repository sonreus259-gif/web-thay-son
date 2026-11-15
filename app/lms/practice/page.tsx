"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLms } from "../LmsContext";
import { FileTextIcon, PlusIcon, CheckCircleIcon } from "../components/Icons";

export default function PracticePage() {
  const { currentUser, activeRole } = useLms();
  const [labs, setLabs] = useState([
    {
      id: "lab-1",
      title: "Lab 01: Xây dựng Chatbot AI với OpenAI & LangChain",
      topic: "AI Agent",
      difficulty: "Trung bình",
      estimatedTime: "60 phút",
      status: "completed",
    },
    {
      id: "lab-2",
      title: "Lab 02: Xử lý dữ liệu lớn với Pandas & Trực quan hóa Seaborn",
      topic: "Data Analysis",
      difficulty: "Cơ bản",
      estimatedTime: "45 phút",
      status: "in-progress",
    },
    {
      id: "lab-3",
      title: "Lab 03: Tích hợp Vector Database (ChromaDB / Pinecone) cho RAG",
      topic: "Generative AI",
      difficulty: "Nâng cao",
      estimatedTime: "90 phút",
      status: "not-started",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileTextIcon className="w-6 h-6 text-blue-600" />
            <span>Luyện thực hành Code & AI Lab</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Không gian thực hành lập trình tương tác, chạy code Python và thử nghiệm AI Agents trực tiếp trên trình duyệt.
          </p>
        </div>

        {activeRole !== "STUDENT" && (
          <button
            onClick={() => alert("Mở form thêm bài lab & repo code mẫu.")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Thêm bài Lab mới</span>
          </button>
        )}
      </div>

      {/* Lab List */}
      <div className="space-y-3">
        {labs.map((lab) => (
          <div
            key={lab.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-mono font-bold flex items-center justify-center flex-shrink-0">
                &lt;/&gt;
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                    {lab.topic}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Độ khó: {lab.difficulty} • {lab.estimatedTime}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{lab.title}</h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => alert(`Mở môi trường Code Sandbox cho: ${lab.title}`)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Mở Code Editor ⚡
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
