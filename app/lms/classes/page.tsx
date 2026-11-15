"use client";

import React, { useState, useEffect } from "react";
import { useLms, ClassItem } from "../LmsContext";
import { PlusIcon, UsersIcon, SearchIcon } from "../components/Icons";

export default function ClassesManagerPage() {
  const {
    classes,
    courses,
    users,
    createClass,
    deleteClass,
    enrollStudents,
    removeEnrollment,
    activeRole,
  } = useLms();

  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [selectedClassForDetail, setSelectedClassForDetail] = useState<ClassItem | null>(null);
  const [classDetailData, setClassDetailData] = useState<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    class?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teachers?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    students?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sessions?: any[];
  } | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // New Class Form State
  const [classCode, setClassCode] = useState("");
  const [className, setClassName] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("HYBRID");
  const [startDate, setStartDate] = useState("2026-10-06");
  const [endDate, setEndDate] = useState("2026-11-28");
  const [capacity, setCapacity] = useState(30);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enrollment modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [enrollError, setEnrollError] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Teachers for dropdown
  const teachers = users.filter((u) => u.roles.includes("TEACHER") || u.roles.includes("ADMIN"));
  // Students for enrollment
  const allStudents = users.filter((u) => u.roles.includes("STUDENT"));

  const filteredStudents = allStudents.filter(
    (std) =>
      std.full_name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      std.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Fetch full class detail with students and sessions
  const loadClassDetail = async (cls: ClassItem) => {
    setSelectedClassForDetail(cls);
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/classes/${cls.id}`);
      if (res.ok) {
        const d = await res.json();
        setClassDetailData(d);
      }
    } catch (err) {
      console.error("Error loading class detail:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedCourseId(courses[0]?.id || "");
    setSelectedTeacherId(teachers[0]?.id || "");
    setClassCode("");
    setClassName("");
    setFormError("");
    setIsCreateClassOpen(true);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const res = await createClass({
      courseId: selectedCourseId,
      code: classCode.trim().toUpperCase(),
      name: className.trim(),
      startDate,
      endDate,
      capacity: Number(capacity),
      deliveryMode,
      status: "OPEN",
      teacherIds: selectedTeacherId ? [selectedTeacherId] : [],
    });

    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || "Không thể tạo lớp học.");
      return;
    }

    setIsCreateClassOpen(false);
  };

  const handleOpenEnrollModal = () => {
    setSelectedStudentIds([]);
    setEnrollError("");
    setIsEnrollModalOpen(true);
  };

  const handleToggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sid) => sid !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedClassForDetail) return;
    if (selectedStudentIds.length === 0) {
      setEnrollError("Vui lòng chọn ít nhất một học viên để ghi danh.");
      return;
    }

    setIsEnrolling(true);
    setEnrollError("");

    const res = await enrollStudents(selectedClassForDetail.id, selectedStudentIds);
    setIsEnrolling(false);

    if (!res.success) {
      setEnrollError(res.error || "Ghi danh thất bại.");
      return;
    }

    setIsEnrollModalOpen(false);
    // Reload detail
    loadClassDetail(selectedClassForDetail);
  };

  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!selectedClassForDetail) return;
    if (confirm(`Bạn có chắc muốn hủy ghi danh học viên "${studentName}" khỏi lớp này?`)) {
      const res = await removeEnrollment(selectedClassForDetail.id, studentId);
      if (!res.success) {
        alert(res.error || "Không thể hủy ghi danh.");
        return;
      }
      loadClassDetail(selectedClassForDetail);
    }
  };

  const handleDeleteClass = async (id: string, className: string) => {
    if (confirm(`Bạn có chắc chắn muốn hủy lớp học: "${className}"?`)) {
      const res = await deleteClass(id);
      if (!res.success) {
        alert(res.error || "Không thể hủy lớp học.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            {activeRole === "STUDENT" ? "Học tập của tôi" : "Tổ chức đào tạo"}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            {activeRole === "STUDENT"
              ? "Lớp Học Của Tôi"
              : activeRole === "TEACHER"
              ? "Lớp Học Phụ Trách Giảng Dạy"
              : "Lớp Học & Ghi Danh Học Viên"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeRole === "ADMIN"
              ? "Tạo lớp học từ các khóa học, phân công giảng viên và ghi danh học viên vào lớp."
              : activeRole === "TEACHER"
              ? "Danh sách các lớp học Thầy được phân công quản lý, giảng dạy và theo dõi học viên."
              : "Các lớp học bạn đang tham gia. Theo dõi lịch học và tiến độ đào tạo của từng lớp."}
          </p>
        </div>

        {activeRole === "ADMIN" && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Mở Lớp Học Mới</span>
          </button>
        )}
      </div>

      {/* 2. CLASSES GRID */}
      {classes.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
          <UsersIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">Chưa có lớp học nào</p>
          <p className="text-[11px] text-slate-400">
            {activeRole === "ADMIN"
              ? "Bấm 'Mở Lớp Học Mới' để bắt đầu mở lớp và gán học viên."
              : "Bạn chưa được phân công hoặc ghi danh vào lớp nào."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 uppercase">
                    {cls.code}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {cls.delivery_mode}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                    {cls.name}
                  </h3>
                  <p className="text-[11px] text-blue-600 font-medium mt-1">
                    Khóa: {cls.course_title}
                  </p>
                </div>

                {cls.teachers && cls.teachers.length > 0 && (
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-[11px] text-slate-400">Giảng viên:</span>
                    <span className="font-semibold text-slate-800">
                      {cls.teachers.map((t) => t.full_name).join(", ")}
                    </span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Sĩ số:</span>
                    <span className="font-bold text-slate-900">
                      {cls.enrolled_count} / {cls.capacity} học viên
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số buổi học:</span>
                    <span className="font-semibold text-slate-800">
                      {cls.session_count} buổi lên lịch
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => loadClassDetail(cls)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Xem chi tiết lớp &gt;
                </button>

                {activeRole === "ADMIN" && (
                  <button
                    onClick={() => handleDeleteClass(cls.id, cls.name)}
                    className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
                  >
                    Hủy lớp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CHI TIẾT LỚP HỌC (TỔNG QUAN, HỌC VIÊN, LỊCH HỌC, GIẢNG VIÊN) */}
      {selectedClassForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  {selectedClassForDetail.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedClassForDetail.name}
                </h3>
                <p className="text-xs text-slate-500">Khóa học: {selectedClassForDetail.course_title}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedClassForDetail(null);
                  setClassDetailData(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {isDetailLoading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Đang tải dữ liệu chi tiết lớp học...
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                {/* 1. Giảng viên phụ trách */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Giảng viên phụ trách</h4>
                  {classDetailData?.teachers && classDetailData.teachers.length > 0 ? (
                    <div className="space-y-2">
                      {classDetailData.teachers.map((t) => (
                        <div
                          key={t.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{t.full_name}</span>
                            <span className="text-slate-400 text-[11px] block">{t.email}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">
                            Giảng viên
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Chưa phân công giảng viên</p>
                  )}
                </div>

                {/* 2. Danh sách Học viên ghi danh */}
                {(activeRole === "ADMIN" || activeRole === "TEACHER") && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900">
                        Danh sách học viên ({classDetailData?.students?.length || 0} /{" "}
                        {selectedClassForDetail.capacity})
                      </h4>

                      {activeRole === "ADMIN" && (
                        <button
                          onClick={handleOpenEnrollModal}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                        >
                          + Ghi danh học viên
                        </button>
                      )}
                    </div>

                    {classDetailData?.students && classDetailData.students.length > 0 ? (
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        {classDetailData.students.map((st) => (
                          <div
                            key={st.id}
                            className="p-2.5 bg-white hover:bg-slate-50 flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-slate-900 block">{st.full_name}</span>
                              <span className="text-slate-400 text-[10px] block">{st.email}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-slate-500 text-[11px]">
                                Tiến độ: {st.progress_percent}%
                              </span>

                              {activeRole === "ADMIN" && (
                                <button
                                  onClick={() => handleRemoveStudent(st.id, st.full_name)}
                                  className="text-red-500 hover:text-red-700 text-[11px] font-semibold"
                                >
                                  Hủy ghi danh
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Chưa có học viên nào được ghi danh.</p>
                    )}
                  </div>
                )}

                {/* 3. Lịch các buổi học */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">
                    Lịch các buổi học ({classDetailData?.sessions?.length || 0})
                  </h4>

                  {classDetailData?.sessions && classDetailData.sessions.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {classDetailData.sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{sess.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                              {sess.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(sess.start_at).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(sess.end_at).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            , {new Date(sess.start_at).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Chưa có buổi học nào được tạo.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setSelectedClassForDetail(null);
                  setClassDetailData(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GHI DANH HỌC VIÊN (ADMIN ONLY) */}
      {isEnrollModalOpen && selectedClassForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Ghi danh Học viên vào Lớp [{selectedClassForDetail.code}]
              </h3>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {enrollError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                ⚠️ {enrollError}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                placeholder="Tìm kiếm học viên theo tên hoặc email..."
                className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
              <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto border border-slate-100 rounded-xl p-2">
              {filteredStudents.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Không tìm thấy học viên nào</p>
              ) : (
                filteredStudents.map((std) => {
                  const isAlreadyEnrolled = classDetailData?.students?.some(
                    (s) => s.id === std.id
                  );
                  const isSelected = selectedStudentIds.includes(std.id);

                  return (
                    <label
                      key={std.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isAlreadyEnrolled
                          ? "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-50 border-blue-200"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          disabled={isAlreadyEnrolled}
                          checked={isSelected || isAlreadyEnrolled}
                          onChange={() => handleToggleSelectStudent(std.id)}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{std.full_name}</span>
                          <span className="text-slate-400 text-[10px] block">{std.email}</span>
                        </div>
                      </div>

                      {isAlreadyEnrolled && (
                        <span className="text-[10px] font-semibold text-emerald-600">Đã ở trong lớp</span>
                      )}
                    </label>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Đã chọn: {selectedStudentIds.length} học viên
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isEnrolling || selectedStudentIds.length === 0}
                  onClick={handleConfirmEnrollment}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isEnrolling ? "Đang ghi danh..." : "Xác nhận ghi danh"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MỞ LỚP HỌC MỚI (ADMIN ONLY) */}
      {isCreateClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-blue-600" />
                <span>Mở Lớp Học Mới</span>
              </h3>
              <button
                onClick={() => setIsCreateClassOpen(false)}
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

            <form onSubmit={handleCreateClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chọn Khóa học nền tảng *
                </label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã lớp *</label>
                  <input
                    type="text"
                    required
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="AI-K02"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 uppercase font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Tên lớp học *</label>
                  <input
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Lớp Chuyên Sâu Generative AI K02"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân công Giảng viên</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    <option value="">-- Chọn giảng viên --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức đào tạo</label>
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sĩ số tối đa</label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateClassOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Xác nhận mở lớp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
