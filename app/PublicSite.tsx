"use client";

import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import "./public-site.css";

type PublicSiteProps = {
  onExperience: () => void;
};

const navigation = [
  ["01", "Kiến thức", "#knowledge-lab"],
  ["02", "Khóa học", "#khoa-hoc"],
  ["03", "Tư vấn", "#dang-ky"],
];

const mobileNav = [
  {
    label: "Kiến thức",
    href: "#knowledge-lab",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4.8A2.8 2.8 0 0 1 6.8 2H12v20H6.8A2.8 2.8 0 0 1 4 19.2V4.8Z" />
        <path d="M20 4.8A2.8 2.8 0 0 0 17.2 2H12v20h5.2a2.8 2.8 0 0 0 2.8-2.8V4.8Z" opacity=".5" />
      </svg>
    ),
  },
  {
    label: "Khóa học",
    href: "#khoa-hoc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3 2 8.2l10 5.2 10-5.2L12 3Z" />
        <path d="M6.2 12.6v4.3c0 1.7 2.6 3.1 5.8 3.1s5.8-1.4 5.8-3.1v-4.3L12 15.4l-5.8-2.8Z" />
      </svg>
    ),
  },
  {
    label: "Tư vấn",
    href: "#dang-ky",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 5.8A2.8 2.8 0 0 1 6.8 3h10.4A2.8 2.8 0 0 1 20 5.8v7.4a2.8 2.8 0 0 1-2.8 2.8H9.4L4 20V5.8Z" />
      </svg>
    ),
  },
];

const instructor = {
  role: "Head Trainer",
  name: "Đội ngũ giảng viên Crema Lab",
  bio:
    "Trực tiếp vận hành rang, pha chế và huấn luyện hằng ngày tại Lab. Mỗi buổi đi từ quan sát thực tế đến nguyên lý, rồi quay lại thực hành để học viên tự kiểm chứng.",
};

const stages = [
  {
    label: "Origin",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="15" r="5.5" />
        <circle cx="15.5" cy="10" r="5.5" />
      </svg>
    ),
  },
  {
    label: "Processing",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.2c3.4 4.4 6.8 8.5 6.8 12.3a6.8 6.8 0 1 1-13.6 0c0-3.8 3.4-7.9 6.8-12.3Z" />
      </svg>
    ),
  },
  {
    label: "Roasting",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.2 1.8c.9 2.7-1.6 4-2.4 6.2-1 2.7.3 4.4 1.7 4.4 1.1 0 1.9-1 1.5-2.3 2 1.6 3.2 3.9 3.2 6.1a5.4 5.4 0 1 1-10.8 0c0-5.3 4.3-8.4 6.8-14.4Z" />
      </svg>
    ),
  },
  {
    label: "Extraction",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.5 4h17L18 10.5H6L3.5 4Z" />
        <path d="M6.6 12.5h10.8l-1.3 7.4a2.4 2.4 0 0 1-2.4 2h-3.4a2.4 2.4 0 0 1-2.4-2l-1.3-7.4Z" />
      </svg>
    ),
  },
  {
    label: "Sensory",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
        <path d="M4 9.5c1.9-2.4 3.8-2.4 5.7 0s3.8 2.4 5.7 0 3.8-2.4 5.7 0" />
        <path d="M4 16.5c1.9-2.4 3.8-2.4 5.7 0s3.8 2.4 5.7 0 3.8-2.4 5.7 0" />
      </svg>
    ),
  },
];

const knowledgeTools = [
  {
    number: "01",
    title: "BÁNH XE HƯƠNG VỊ CÀ PHÊ",
    description:
      "Đi từ nhóm hương tổng quát đến mô tả cụ thể — gọi tên đúng điều bạn cảm nhận trong tách.",
    href: "/tools/flavor-wheel.html",
    kind: "wheel",
    meta: "Công cụ tương tác · Song ngữ",
  },
  {
    number: "02",
    title: "BẢN ĐỒ VÙNG TRỒNG VIỆT NAM",
    description:
      "Khám phá vùng trồng, độ cao, giống và sơ chế — hiểu vì sao mỗi vùng cho một hồ sơ hương vị riêng.",
    href: "/tools/vietnam-coffee-map.html",
    kind: "map",
    meta: "Dữ liệu vùng trồng · Có nguồn",
  },
  {
    number: "03",
    title: "EXTRACTION LAB",
    description:
      "Chỉnh Dose, Ratio, Grind size, Contact time — xem chúng ảnh hưởng thế nào đến dòng chảy và kết quả trong tách.",
    href: "/tools/extraction-lab.html",
    kind: "lab",
    meta: "Mô phỏng tương tác · 3 tầng kiến thức",
  },
];

const courses = [
  {
    number: "01",
    title: "Barista Foundation",
    level: "NỀN TẢNG",
    duration: "6 buổi",
    format: "Tại Lab",
    khaiGiang: "20.07",
    description:
      "Nắm nguyên lý espresso, sữa và quy trình pha chế — hiểu đúng để tự điều chỉnh, không phụ thuộc công thức.",
    color: "#9D5429",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h14" />
        <path d="M7 8v4a5 5 0 0 0 10 0V8" />
        <path d="M10 17v3M14 17v3" />
        <path d="M9 20h6" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Latte Art Control",
    level: "KỸ THUẬT",
    duration: "4 buổi",
    format: "Tại Lab",
    khaiGiang: "03.08",
    description:
      "Kiểm soát kết cấu sữa, nhiệt độ và lực rót — làm chủ từng đường latte art thay vì phụ thuộc may rủi.",
    color: "#E1AD5F",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 18c3-8 6-8 8-14 2 6 5 6 8 14" />
        <path d="M8 18c1.5-4 3-4 4-7 1 3 2.5 3 4 7" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Brewing",
    level: "ỨNG DỤNG",
    duration: "4 buổi",
    format: "Tại Lab",
    khaiGiang: "17.08",
    description:
      "Kiểm soát chiết xuất bằng dữ liệu và quan sát — pour-over, thông số và hiệu chỉnh để chủ động tạo hương vị mong muốn.",
    color: "#A89070",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h14l-4 8H9L5 4Z" />
        <path d="M8 12v3a4 4 0 0 0 8 0v-3" />
        <path d="M6 19h12" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Menu Coffee & Beverage",
    level: "VẬN HÀNH",
    duration: "5 buổi",
    format: "Tại Lab",
    khaiGiang: "31.08",
    description:
      "Xây dựng menu đồ uống có hệ thống — chuẩn hoá công thức, tính giá vốn và vận hành nhất quán.",
    color: "#1E1F1F",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h9M4 10h9M4 14h6" />
        <path d="M16 9h4v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V9Z" />
        <path d="M20 10.5h1a1.3 1.3 0 0 1 0 2.6h-1" />
      </svg>
    ),
  },
];

export default function PublicSite({ onExperience }: PublicSiteProps) {
  const [submitted, setSubmitted] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll(".reveal"));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function handleSpotlight(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    event.currentTarget.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }

  function submitConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main id="website" className="public-site" ref={rootRef}>
      <header className="public-nav">
        <a className="brand" href="#website" aria-label="Crema Lab — về đầu trang">
          <span className="brand-mark" aria-hidden="true">
            <Image src="/images/crema-lab-logo.png" alt="" width={64} height={64} priority />
          </span>
          <span>
            <strong>CREMA</strong>
            <small>LAB</small>
          </span>
        </a>

        <nav aria-label="Điều hướng chính">
          {navigation.map(([, label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <span className="public-nav-meta">HCM · VI</span>
      </header>

      <section className="public-intro" aria-labelledby="public-heading">
        <p className="intro-statement" id="public-heading">
          Flavor is not a formula.
          <br />
          <em>It is a system.</em>
        </p>
      </section>

      <div className="system-strip" aria-label="Chuỗi biến số cà phê">
        <div className="system-strip-track" aria-hidden="true">
          {[...stages, ...stages].map((stage, index) => (
            <span key={index}>
              <span className="stage-icon">{stage.icon}</span>
              {stage.label}
            </span>
          ))}
        </div>
        <span className="sr-only">
          {stages.map((stage) => stage.label).join(" · ")}
        </span>
      </div>

      <section className="knowledge-section" id="knowledge-lab" aria-labelledby="knowledge-heading">
        <div className="section-heading reveal">
          <div>
            <p className="section-kicker">Kiến thức</p>
            <h2 id="knowledge-heading">HỌC QUA KHÁM PHÁ.</h2>
          </div>
          <p>
            Ba công cụ trực quan giúp dữ liệu cà phê phức tạp trở nên dễ hiểu và
            dùng được ngay.
          </p>
        </div>

        <div className="tool-grid">
          {knowledgeTools.map((tool, index) => (
            <a
              className="tool-card reveal spotlight"
              key={tool.href}
              href={tool.href}
              target="_blank"
              rel="noreferrer"
              aria-label={tool.title}
              style={{ transitionDelay: `${index * 90}ms` }}
              onMouseMove={handleSpotlight}
            >
              <div className={`tool-visual tool-${tool.kind}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="tool-card-copy">
                <div className="tool-card-meta">
                  <span>{tool.number}</span>
                  <small>{tool.meta}</small>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </div>
            </a>
          ))}
        </div>
        <p className="tool-note">Các công cụ mở ở tab riêng để giữ nguyên không gian tương tác.</p>
      </section>

      <section className="instructor-section" id="instructor" aria-labelledby="instructor-heading">
        <div className="instructor-panel reveal">
          <div className="instructor-copy">
            <span className="instructor-badge">{instructor.role}</span>
            <h2 id="instructor-heading">
              Học từ <em>người làm nghề</em>.
            </h2>
            <p className="instructor-bio">{instructor.bio}</p>
            <p className="instructor-signature">{instructor.name}</p>
            <p className="instructor-signature-role">— {instructor.role}, Crema Lab</p>
          </div>
          <div className="instructor-portrait" aria-hidden="true" />
        </div>
      </section>

      <section className="courses-section" id="khoa-hoc" aria-labelledby="courses-heading">
        <div className="section-heading reveal">
          <div>
            <p className="section-kicker">Khóa học</p>
            <h2 id="courses-heading">HỌC ĐỂ TỰ ĐIỀU CHỈNH.</h2>
          </div>
          <p>
            Mỗi khóa đi từ nguyên lý đến thực hành — hiểu biến số, tự quyết định
            trong tình huống thật. Học phí và lịch khai giảng được tư vấn theo
            lộ trình phù hợp, không có mức giá chung.
          </p>
        </div>

        <div className="course-stack">
          {courses.map((course, index) => (
            <article
              className="course-stack-card"
              key={course.number}
              style={{
                top: `calc(88px + ${index * 64}px)`,
                zIndex: index + 1,
                borderColor: course.color,
              }}
            >
              <div className="course-tab" style={{ color: course.color }}>
                {course.number} — {course.title}
              </div>
              <div className="course-stack-body">
                <div className="course-stack-copy">
                  <div>
                    <p className="course-level" style={{ color: course.color }}>{course.level}</p>
                    <h3>{course.title}</h3>
                    <p className="course-description">{course.description}</p>
                  </div>
                  <div className="course-stat">
                    <strong style={{ color: course.color }}>{course.duration}</strong>
                    <span>Khai giảng {course.khaiGiang} · {course.format}</span>
                  </div>
                </div>
                <div className="course-stack-visual" aria-hidden="true" style={{ color: course.color }}>
                  <span className="course-stack-icon">{course.icon}</span>
                  <small>Ảnh khóa học · sắp cập nhật</small>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="registration-section" id="dang-ky" aria-labelledby="register-heading">
        <div className="registration-panel reveal">
          <div className="registration-copy">
            <span className="registration-badge">Tư vấn</span>
            <h2 id="register-heading">
              Chọn điểm <em>bắt đầu.</em>
            </h2>
            <p>
              Để lại mục tiêu của bạn — Crema Lab liên hệ tư vấn phù hợp, không
              làm phiền.
            </p>
            <div className="contact-lines">
              <span>hello@cremalab.vn</span>
              <span>TP. Hồ Chí Minh</span>
            </div>
          </div>

          <form className="registration-form" onSubmit={submitConsultation}>
            <label>
              Họ và tên
              <input name="name" autoComplete="name" required placeholder="Tên của bạn" />
            </label>
            <label>
              Số điện thoại hoặc email
              <input name="contact" autoComplete="tel" required placeholder="Thông tin liên hệ" />
            </label>
            <label>
              Bạn đang quan tâm điều gì?
              <select name="interest" defaultValue="">
                <option value="" disabled>Chọn nhu cầu</option>
                <option>Barista Foundation</option>
                <option>Latte Art Control</option>
                <option>Brewing</option>
                <option>Menu Coffee &amp; Beverage</option>
                <option>Tư vấn lộ trình cá nhân</option>
              </select>
            </label>
            <label>
              Mục tiêu của bạn
              <textarea name="goal" rows={3} placeholder="Chia sẻ ngắn để chúng tôi tư vấn chính xác hơn" />
            </label>
            <button type="submit">Gửi yêu cầu tư vấn</button>
            <p className={`form-success${submitted ? " is-visible" : ""}`} aria-live="polite">
              Đã ghi nhận. Crema Lab sẽ liên hệ với bạn sớm nhất.
            </p>
          </form>
        </div>
      </section>

      <footer className="public-footer">
        <a className="brand footer-brand" href="#website" aria-label="Crema Lab — về đầu trang">
          <span className="brand-mark" aria-hidden="true">
            <Image src="/images/crema-lab-logo.png" alt="" width={64} height={64} />
          </span>
          <span><strong>CREMA</strong><small>LAB</small></span>
        </a>
        <nav aria-label="Điều hướng cuối trang">
          {navigation.map(([, label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <button type="button" onClick={onExperience}>Xem lại trải nghiệm mở đầu</button>
        <div className="footer-statement">
          <small>CREMA LAB · 2026</small>
          <p>Flavor is not a formula.<br /><em>It is a system.</em></p>
        </div>
      </footer>

      <nav className="mobile-tabbar" aria-label="Điều hướng nhanh">
        {mobileNav.map((item) => (
          <a key={item.href} href={item.href}>
            <span className="mobile-tabbar-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </main>
  );
}
