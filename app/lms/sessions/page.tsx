"use client";

import React, { useState } from "react";
import { useLms, SessionItem } from "../LmsContext";
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
} from "../components/Icons";

export default function SessionsPage() {
  const {
    activeRole,
    sessions,
    classes,
    users,
    rooms,
    createSession,
    deleteSession,
  } = useLms();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("2026-10-12");
  const [startTime, setStartTime] = useState("19:30");
  const [endDate, setEndDate] = useState("2026-10-12");
  const [endTime, setEndTime] = useState("21:30");
  const [teacherId, setTeacherId] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("HYBRID");
  const [roomId, setRoomId] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("https://meet.google.com/xyz-thay-son-ai");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter teachers for dropdown
  const teachers = users.filter((u) => u.roles.includes("TEACHER") || u.roles.includes("ADMIN"));

  const handleOpenModal = () => {
    setSelectedClassId(classes[0]?.id || "");
    setTitle("");
    setDescription("");
    setStartDate("2026-10-12");
    setStartTime("19:30");
    setEndDate("2026-10-12");
    setEndTime("21:30");
    setTeacherId(teachers[0]?.id || "");
    setRoomId(rooms[0]?.id || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const startAt = `${startDate}T${startTime}:00`;
    const endAt = `${endDate}T${endTime}:00`;

    const res = await createSession({
      classId: selectedClassId,
      title,
      description,
      startAt,
      endAt,
      teacherId: teacherId || undefined,
      deliveryMode,
      roomId: roomId || undefined,
      meetingUrl: meetingUrl || undefined,
      note,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || "Không thể tạo buổi học.");
      return;
    }

    setIsModalOpen(false);
  };

  const handleDeleteSession = async (id: string, sessionTitle: string) => {
    if (confirm(`Bạn có chắc muốn hủy buổi học: "${sessionTitle}"?`)) {
      const res = await deleteSession(id);
      if (!res.success) {
        alert(res.error || "Không thể hủy buổi học");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <span>
              {activeRole === "ADMIN"
                ? "Quản lý Lịch lớp học & Buổi học"
                : activeRole === "TEACHER"
                ? "Lịch Giảng Dạy Của Tôi"
                : "Lịch Học Của Tôi"}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeRole === "ADMIN"
              ? "Lên lịch các buổi học, kiểm tra chống trùng lịch giảng viên và phòng học tự động."
              : activeRole === "TEACHER"
              ? "Danh sách các buổi học Thầy được phân công giảng dạy cùng phòng học và link trực tuyến."
              : "Danh sách các buổi học của các lớp bạn đang được ghi danh tham gia."}
          </p>
        </div>

        {activeRole === "ADMIN" && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Tạo Buổi Học Mới</span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Danh sách buổi học ({sessions.length})
          </h2>
          <span className="text-xs text-slate-400">Sắp xếp theo thời gian</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Chưa có lịch học sắp tới</p>
            <p className="text-[11px] text-slate-400">
              {activeRole === "ADMIN"
                ? "Bấm 'Tạo Buổi Học Mới' để thiết lập lịch học cho các lớp."
                : "Khi lớp học có lịch mới, thông tin buổi học sẽ hiển thị tại đây."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sessions.map((sess: SessionItem) => {
              const startDateObj = new Date(sess.start_at);
              const endDateObj = new Date(sess.end_at);

              return (
                <div
                  key={sess.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                        {sess.class_code}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {sess.delivery_mode}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Lớp: {sess.class_name}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{sess.title}</h3>

                    {sess.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{sess.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>
                          {startDateObj.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {endDateObj.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          , {startDateObj.toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      {sess.teacher_name && (
                        <div>
                          Giảng viên:{" "}
                          <span className="font-semibold text-slate-800">
                            {sess.teacher_name}
                          </span>
                        </div>
                      )}

                      {sess.room_name && (
                        <div>
                          Phòng:{" "}
                          <span className="font-semibold text-slate-800">
                            {sess.room_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {sess.meeting_url && (
                      <div className="pt-1">
                        <a
                          href={sess.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
                        >
                          🔗 Vào phòng học trực tuyến ({sess.meeting_url})
                        </a>
                      </div>
                    )}
                  </div>

                  {activeRole === "ADMIN" && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleDeleteSession(sess.id, sess.title)}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                      >
                        Hủy buổi
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Tạo Buổi Học Mới (Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span>Lên Lịch Buổi Học Mới</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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

            <form onSubmit={handleCreateSession} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chọn Lớp học *
                </label>
                <select
                  required
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      [{cls.code}] {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên buổi học *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Buổi 03: Xây dựng AI Agent với LangChain"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả / Nội dung buổi học
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nội dung chính hoặc chuẩn bị bài tập..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setEndDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Giờ bắt đầu *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Giờ kết thúc *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phân công Giảng viên
                  </label>
                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    <option value="">-- Chưa gán giảng viên --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hình thức
                  </label>
                  <select
                    value={deliveryMode}
                    onChange={(e) => setDeliveryMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    <option value="HYBRID">Hybrid (Trực tiếp & Online)</option>
                    <option value="ONLINE">Online (Trực tuyến)</option>
                    <option value="OFFLINE">Offline (Tại lớp)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phòng học (Nếu có)
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    <option value="">-- Không sử dụng phòng --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Link phòng học trực tuyến
                  </label>
                  <input
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú cho học viên
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Chuẩn bị tài liệu PDF, cài sẵn Python..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Đang kiểm tra & lưu..." : "Xác nhận tạo buổi học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
