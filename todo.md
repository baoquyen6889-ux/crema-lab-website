# TODO — Crema Lab Release 1

Phạm vi khoá cứng: xem `CLAUDE.md`. Không tự thêm Release 2/3 vào danh sách này.

## Đã xong

- [x] Gỡ bỏ vinext/Cloudflare tooling, chuyển sang Next.js chuẩn (`next dev`/`next build`)
- [x] `npm run build` production thành công (static prerender)
- [x] Landing hero + Experience Mode rút gọn (Origin/Anatomy → Processing → Roasting)
- [x] Courses, Schedule, Contact/Registration (đã có từ trước)
- [x] About/Philosophy (`#about`)
- [x] Instructor (`#instructor`) — **placeholder, cần bio/ảnh giảng viên thật**
- [x] Tuition (`#hoc-phi`) — **placeholder "Tư vấn 1:1", cần xác nhận học phí thật**
- [x] Extraction Lab bản cơ bản (`public/tools/extraction-lab.html`) — Dose/Ratio/
      Grind size/Contact time, cơ chế Discover/Understand/Deep Dive
- [x] `content-tiers.md` cho Extraction Lab
- [x] `CLAUDE.md`

## Còn lại trước khi publish thật

- [ ] Thay placeholder giảng viên bằng bio/ảnh thật
- [ ] Xác nhận học phí thật cho từng khóa (thay "Tư vấn 1:1" nếu muốn công bố giá)
- [ ] Review nội dung khoa học Extraction Lab/Roasting/Processing (Q-grader/roaster)
- [ ] Review hiệu năng (ảnh roast-bean-*.png khá nặng, ~1-2MB/ảnh — cân nhắc nén),
      accessibility (Reduce Motion, keyboard nav, ARIA — đã có phần cơ bản, cần audit lại)
- [ ] Kết nối form đăng ký với backend thật (hiện chỉ set state `submitted`, không gửi đi đâu)
- [ ] Git init + GitHub repo + Vercel deploy (xem README.md)
- [ ] `npm run lint` có 17 lỗi có sẵn từ code Codex cũ trong `ParticleUniverse.tsx`/
      `ChapterOne.tsx`/`ChapterTwo.tsx`/`page.tsx` (chủ yếu `react-hooks/set-state-in-effect`,
      `react-hooks/immutability` — quy tắc mới trong `eslint-config-next@16`). Không chặn
      build/deploy, nhưng nên dọn khi có thời gian.
