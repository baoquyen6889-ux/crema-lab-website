# CLAUDE.md — Crema Lab

Hướng dẫn cho Claude Code khi làm việc trong repo này. Xem thêm `todo.md` (checklist
Release 1) và `content-tiers.md` (nội dung 3 tầng cho Extraction Lab).

## Phạm vi Release 1 — KHÔNG tự mở rộng

Chỉ build: Landing hero (immersive, ngắn) + Courses + Instructor + Schedule + Tuition
+ About/Philosophy + Contact/Registration + Extraction Lab bản cơ bản.

Chưa build (Release 2/3, không tự làm thêm trừ khi được yêu cầu):
- 5 chương Experience Mode đầy đủ theo concept gốc (hiện có bản rút gọn 3 chương:
  Origin/Anatomy, Processing, Roasting — đã đủ cho Release 1, không cần thêm chương).
- Knowledge Universe đầy đủ (Vietnam Coffee Map, Variety Universe, Flavor Universe,
  Technique Atlas) — Flavor Wheel và Vietnam Coffee Map đã có sẵn như tiện ích bổ
  sung, không phải yêu cầu bắt buộc của Release 1.

## Non-goals

- Không phải sàn thương mại điện tử bán cà phê/dụng cụ.
- Không phải blog tin tức cập nhật liên tục.
- Không thay thế lớp học thực hành trực tiếp.
- Không đưa ra khẳng định khoa học tuyệt đối thay cho nghiên cứu chuyên ngành.
- Không ép buộc người dùng phải xem hết Experience Mode mới tiếp cận được thông tin
  khóa học — "Khám phá Crema Lab" luôn hiển thị, luôn bấm được.

## Glossary — Flavor Core

Cấu trúc dữ liệu thị giác đại diện cho trạng thái hương vị đang hình thành trong
Experience Mode. Chỉ thay đổi hình thái để chuyển cảnh, không "trở thành" vật thể
khác theo nghĩa đen. Trình tự: trường hạt chưa ổn định → khung cấu trúc (Origin/
Variety) → thay đổi mật độ/nhiệt/màu (Processing/Roasting) → hòa tan/phân tách
(Extraction) → bung thành cảm nhận (Sensory).

## Nguyên tắc chuyển động

> Every motion must reveal information.

Nếu một hiệu ứng (particle, glow, camera move...) không giúp người xem hiểu thêm
điều gì đó về cà phê, nó không nên tồn tại — bất kể đẹp đến đâu.

## Tiêu chuẩn khoa học

- Mỗi khẳng định chuyên môn quan trọng phải có nguồn hoặc được ghi rõ là minh hoạ
  khái niệm ("conceptual visualization").
- Không biến tương quan thành quan hệ nhân quả tuyệt đối.
- Không mô tả một phương pháp chế biến luôn tạo ra một nhóm hương cố định.
- Không khẳng định độ cao cao hơn luôn đồng nghĩa chất lượng tốt hơn.
- Không đơn giản hóa roast level thành một kết quả cảm quan tuyệt đối.
- Nội dung Extraction Lab, Roasting, Processing cần một người có chuyên môn
  (Q-grader, roaster có kinh nghiệm) kiểm tra trước khi publish thật.

## Kỹ thuật

- Next.js App Router chuẩn (không dùng vinext/Cloudflare-specific tooling — đã gỡ
  bỏ hoàn toàn khỏi repo này). Deploy trên Vercel.
- Experience Mode dùng `@react-three/fiber` + `three` — chỉ trong các file đã có
  (`ParticleUniverse.tsx`, `ChapterOne/Two/Three.tsx`). Không thêm thư viện 3D khác.
- Các công cụ tương tác độc lập (`public/tools/*.html`) là vanilla HTML/CSS/JS, tự
  chứa, mở tab riêng — không phụ thuộc vào build của Next.js app.
- Cơ chế 3 tầng kiến thức (Discover mặc định → "Đi sâu hơn" mở Understand tại chỗ →
  tab riêng cho Deep Dive) chỉ áp dụng cho Extraction Lab (và các công cụ Knowledge
  Universe khác ở Release sau) — không áp dụng cho About/Instructor/Courses/Tuition.
- Trước khi publish thật: thay placeholder giảng viên (`instructor` trong
  `PublicSite.tsx`) bằng bio/ảnh thật, và xác nhận học phí thật thay vì "Tư vấn 1:1".
