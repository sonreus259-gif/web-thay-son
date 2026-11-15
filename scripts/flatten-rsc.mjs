// Sau khi `next build` xuất bản tĩnh, các tệp dữ liệu trang nằm ở dạng thư mục
// (vd. lms/__next.lms/__PAGE__.txt) nhưng trình duyệt lại xin theo tên có dấu chấm
// (lms/__next.lms.__PAGE__.txt). Máy chủ tĩnh như GitHub Pages không tự đổi được,
// nên script này tạo thêm bản sao theo tên có dấu chấm để tránh lỗi 404 khi prefetch.
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve(process.argv[2] || "out");
let copied = 0;

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? filesUnder(p) : [p];
  });
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (e.name.startsWith("__next.")) {
      for (const file of filesUnder(p)) {
        const flat = e.name + "." + path.relative(p, file).split(path.sep).join(".");
        fs.copyFileSync(file, path.join(dir, flat));
        copied++;
      }
    } else if (e.name !== "_next") {
      walk(p);
    }
  }
}

walk(outDir);
console.log(`flatten-rsc: đã tạo ${copied} tệp trong ${outDir}`);
