"use client";

import React, { useState } from "react";
import { useLms, CourseItem } from "../LmsContext";
import { PlusIcon, BookIcon } from "../components/Icons";

export default function CoursesManagerPage() {
  const { courses, createCourse, deleteCourse, activeRole } = useLms();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<CourseItem | null>(null);

  // New course form state
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<string>("AI");
  const [level, setLevel] = useState<string>("Chuyên sâu");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(4500000);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [badge, setBadge] = useState("MỚI PHÁT HÀNH");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCourses =
    selectedCategory === "all"
      ? courses
      : courses.filter((c) => c.category === selectedCategory);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const res = await createCourse({
      title: title.trim(),
      code: code.trim().toUpperCase() || undefined,
      category,
      level,
      short_description: shortDescription,
      description,
      price: Number(price),
      duration_weeks: Number(durationWeeks),
      total_lessons: 24,
      thumbnail:
        category === "AI"
          ? "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800"
          : category === "Data"
          ? "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800"
          : "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
      badge,
      status: "PUBLISHED",
      is_published: 1,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.error || "Không thể tạo khóa học.");
      return;
    }

    setIsBuilderOpen(false);
    setTitle("");
    setCode("");
    setShortDescription("");
    setDescription("");
  };

  const handleDeleteCourse = async (id: string, courseTitle: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khóa học: "${courseTitle}"?`)) {
      const res = await deleteCourse(id);
      if (!res.success) {
        alert(res.error || "Không thể xóa khóa học.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Quản trị đào tạo
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            {activeRole === "STUDENT" ? "Khóa Học Đào Tạo" : "Xây Dựng & Quản Lý Khóa Học"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chương trình đào tạo công nghệ AI, Kỹ thuật dữ liệu (Data) và Lập trình của Thầy Đỗ Trường Sơn.
          </p>
        </div>

        {activeRole === "ADMIN" && (
          <button
            onClick={() => {
              setFormError("");
              setIsBuilderOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Xây Dựng Khóa Học Mới</span>
          </button>
        )}
      </div>

      {/* 2. CATEGORY FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {["all", "AI", "Data", "Coding"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat === "all" ? "Tất cả khóa học" : cat === "AI" ? "Trí Tuệ Nhân Tạo (AI)" : cat === "Data" ? "Khoa Học Dữ Liệu" : "Lập Trình Thực Chiến"}
          </button>
        ))}
      </div>

      {/* 3. COURSES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Thumbnail + Badge */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-md">
                  {course.badge || course.category}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/90 text-slate-800 shadow-xs">
                  {course.code || "CRS"}
                </span>
              </div>

              {/* Course Info */}
              <div className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-blue-600 uppercase">
                    {course.category} • {course.level}
                  </span>
                  <span>{course.duration_weeks} tuần</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {course.short_description || course.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{course.class_count || 0} lớp học đã mở</span>
                  <span className="font-bold text-slate-900">
                    {Number(course.price).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
              <button
                onClick={() => setPreviewCourse(course)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Xem chi tiết &gt;
              </button>

              {activeRole === "ADMIN" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteCourse(course.id, course.title)}
                    className="px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CHI TIẾT KHÓA HỌC */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  {previewCourse.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{previewCourse.title}</h3>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{previewCourse.description}</p>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Chuyên mục:</span>
                <span className="font-semibold">{previewCourse.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Cấp độ:</span>
                <span className="font-semibold">{previewCourse.level}</span>
              </div>
              <div className="flex justify-between">
                <span>Thời lượng đào tạo:</span>
                <span className="font-semibold">{previewCourse.duration_weeks} tuần</span>
              </div>
              <div className="flex justify-between">
                <span>Học phí:</span>
                <span className="font-bold text-blue-600">
                  {Number(previewCourse.price).toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewCourse(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO KHÓA HỌC MỚI (Admin only) */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookIcon className="w-5 h-5 text-blue-600" />
                <span>Xây Dựng Khóa Học Mới</span>
              </h3>
              <button
                onClick={() => setIsBuilderOpen(false)}
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

            <form onSubmit={handleCreateCourse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Tên khóa học *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ví dụ: Lập trình AI Agents Tự Hành"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã khóa *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="AI-AGENT"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chuyên mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    <option value="AI">Trí Tuệ Nhân Tạo (AI)</option>
                    <option value="Data">Khoa Học Dữ Liệu</option>
                    <option value="Coding">Lập Trình Web/SaaS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cấp độ</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 bg-white"
                  >
                    <option value="Chuyên sâu">Chuyên sâu</option>
                    <option value="Nâng cao">Nâng cao</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Cơ bản">Cơ bản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả ngắn</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Tóm tắt nội dung chính trong 1 câu..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mục tiêu đầu ra, nội dung chương trình..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Học phí (VND)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời lượng (Tuần)</label>
                  <input
                    type="number"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Đang lưu..." : "Xác nhận tạo khóa học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
