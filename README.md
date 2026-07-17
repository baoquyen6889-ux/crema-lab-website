# Crema Lab — The Unseen World of Coffee

Website Crema Lab: Experience Mode (WebGL, 3 chương) + Explore Mode (khóa học,
lịch học, đăng ký). Next.js chuẩn (App Router), deploy free trên Vercel.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # chạy bản build
```

## Cấu trúc

- `app/` — toàn bộ code site (Experience Mode: `ParticleUniverse.tsx`,
  `ChapterOne/Two/Three.tsx`; Explore Mode: `PublicSite.tsx`)
- `public/tools/` — công cụ tương tác độc lập (Flavor Wheel, Vietnam Coffee
  Map, Extraction Lab), mở ở tab riêng
- `public/images/` — ảnh dùng cho Chapter 03 (roasting)
- `CLAUDE.md` — phạm vi, non-goals, glossary, nguyên tắc thiết kế
- `todo.md` — checklist Release 1
- `content-tiers.md` — nội dung Discover/Understand/Deep Dive cho Extraction Lab

## Deploy

Push lên GitHub, import repo vào Vercel — build/deploy tự động mỗi lần push
`main`. Không cần biến môi trường hay database cho Release 1.

## Useful Commands

- `npm run dev` — local dev
- `npm run build` — production build
- `npm test` — build + smoke test nội dung trang
- `npm run lint` — ESLint
