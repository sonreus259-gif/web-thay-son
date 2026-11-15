import type { NextConfig } from "next";

// Bản build tĩnh cho GitHub Pages (https://<user>.github.io/web-thay-son/).
// Bật bằng biến môi trường GITHUB_PAGES=true — xem .github/workflows/pages.yml.
// Ở chế độ này không có máy chủ: API được mô phỏng trong trình duyệt (lib/demoApi.ts).
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/web-thay-son" : "";

const nextConfig: NextConfig = {
  ...(isPages
    ? {
        output: "export" as const,
        basePath,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_DEMO_API: isPages ? "1" : "",
  },
};

export default nextConfig;
