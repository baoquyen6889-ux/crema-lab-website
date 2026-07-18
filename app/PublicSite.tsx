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

const principles = [
  {
    title: "Hệ thống biến số",
    description:
      "Một tách cà phê là kết quả của nhiều biến số tương tác — nguồn gốc, sơ chế, rang, chiết xuất, cảm quan.",
  },
  {
    title: "Học bằng quan sát",
    description:
      "Công cụ tương tác cho thấy điều đang xảy ra bên trong một quả cà phê, một mẻ rang, một lần chiết xuất.",
  },
  {
    title: "Tiêu chuẩn khoa học",
    description:
      "Mỗi khẳng định đều có căn cứ, tách bạch dữ liệu thực tế và hình minh hoạ mang tính khái niệm.",
  },
];

const instructor = {
  role: "Head Trainer",
  name: "ĐỘI NGŨ GIẢNG VIÊN CREMA LAB",
  bio:
    "Trực tiếp vận hành rang, pha chế và huấn luyện hằng ngày tại Lab. Mỗi buổi đi từ quan sát thực tế đến nguyên lý, rồi quay lại thực hành để học viên tự kiểm chứng.",
  focus: ["ESPRESSO & SỮA", "RANG & ĐÁNH GIÁ CẢM QUAN", "CHIẾT XUẤT & KIỂM SOÁT BIẾN SỐ"],
};

const stages = [
  {
    label: "Nguồn gốc",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="15" r="5.5" />
        <circle cx="15.5" cy="10" r="5.5" />
      </svg>
    ),
  },
  {
    label: "Sơ chế",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.2c3.4 4.4 6.8 8.5 6.8 12.3a6.8 6.8 0 1 1-13.6 0c0-3.8 3.4-7.9 6.8-12.3Z" />
      </svg>
    ),
  },
  {
    label: "Rang",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.2 1.8c.9 2.7-1.6 4-2.4 6.2-1 2.7.3 4.4 1.7 4.4 1.1 0 1.9-1 1.5-2.3 2 1.6 3.2 3.9 3.2 6.1a5.4 5.4 0 1 1-10.8 0c0-5.3 4.3-8.4 6.8-14.4Z" />
      </svg>
    ),
  },
  {
    label: "Chiết xuất",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.5 4h17L18 10.5H6L3.5 4Z" />
        <path d="M6.6 12.5h10.8l-1.3 7.4a2.4 2.4 0 0 1-2.4 2h-3.4a2.4 2.4 0 0 1-2.4-2l-1.3-7.4Z" />
      </svg>
    ),
  },
  {
    label: "Cảm quan",
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
      "Nắm nguyên lý espresso, sữa và quy trình làm việc — tự điều chỉnh thay vì phụ thuộc công thức.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 3h11l-1 12.4A4 4 0 0 1 11 19H10a4 4 0 0 1-4-3.6L5 3Z" />
        <path d="M16 6.5h1.5a3 3 0 0 1 0 6H16v-2h1.5a1 1 0 0 0 0-2H16v-2Z" />
        <path d="M7 21h8v1.5H7V21Z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Sensory & Flavor",
    level: "CHUYÊN SÂU",
    duration: "4 buổi",
    format: "Tại Lab",
    khaiGiang: "03.08",
    description:
      "Xây ngôn ngữ cảm quan, hiệu chỉnh vị giác, đọc mối liên hệ hương – vị – cấu trúc – hậu vị.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 10c1.9-2.4 3.8-2.4 5.7 0s3.8 2.4 5.7 0 3.8-2.4 5.7 0" />
        <path d="M4 16c1.9-2.4 3.8-2.4 5.7 0s3.8 2.4 5.7 0 3.8-2.4 5.7 0" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Brewing Control",
    level: "ỨNG DỤNG",
    duration: "4 buổi",
    format: "Tại Lab",
    khaiGiang: "17.08",
    description:
      "Kiểm soát chiết xuất bằng dữ liệu và quan sát để chủ động tạo hương vị mong muốn.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.5 4h17L18 10.5H6L3.5 4Z" />
        <path d="M6.6 12.5h10.8l-1.3 7.4a2.4 2.4 0 0 1-2.4 2h-3.4a2.4 2.4 0 0 1-2.4-2l-1.3-7.4Z" />
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
        <div className="intro-copy">
          <p className="section-kicker">Crema Lab · Coffee Education</p>
          <h2 id="public-heading">
            <span>HIỂU CÀ PHÊ.</span>
            <span>LÀM CHỦ KẾT QUẢ.</span>
          </h2>
          <p>
            Kiến thức thực tế, công cụ tương tác và khóa học có hệ thống dành cho
            người muốn hiểu điều gì thật sự xảy ra bên trong một tách cà phê.
          </p>
          <div className="intro-actions">
            <a className="copper-button" href="#knowledge-lab">
              Khám phá kiến thức
            </a>
            <a className="text-link" href="#khoa-hoc">
              Xem khóa học <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>

        <div className="public-index" aria-label="Cấu trúc website">
          <div className="intro-system">
            <small>THE VARIABLE SYSTEM</small>
            <p>Flavor is not a formula.<br />It is a system.</p>
          </div>
          {navigation.map(([, label, href]) => (
            <a key={href} href={href}>
              <strong>{label}</strong>
              <span aria-hidden="true">↘</span>
            </a>
          ))}
        </div>
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

      <section className="about-section" id="about" aria-label="Triết lý vận hành">
        <div className="principle-grid">
          {principles.map((principle, index) => (
            <article
              className="principle-card reveal spotlight"
              key={principle.title}
              style={{ transitionDelay: `${index * 90}ms` }}
              onMouseMove={handleSpotlight}
            >
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </article>
          ))}
        </div>
      </section>

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
        <div className="section-heading reveal">
          <div>
            <p className="section-kicker">Giảng viên</p>
            <h2 id="instructor-heading">HỌC TỪ NGƯỜI LÀM NGHỀ.</h2>
          </div>
        </div>

        <div className="instructor-card reveal">
          <div className="instructor-portrait" aria-hidden="true" />
          <div className="instructor-copy">
            <p className="instructor-role">{instructor.role}</p>
            <h3>{instructor.name}</h3>
            <p className="instructor-bio">{instructor.bio}</p>
            <ul className="instructor-focus">
              {instructor.focus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
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
              style={{ top: `calc(88px + ${index * 18}px)`, zIndex: index + 1 }}
            >
              <div className="course-stack-copy">
                <div className="course-number">{course.number}</div>
                <p className="course-level">{course.level}</p>
                <h3>{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span>{course.duration}</span>
                  <span>{course.format}</span>
                  <span>Khai giảng {course.khaiGiang}</span>
                </div>
                <a className="course-cta" href="#dang-ky">
                  Nhận tư vấn khóa học <span aria-hidden="true">↘</span>
                </a>
              </div>
              <div className="course-stack-visual" aria-hidden="true">
                <span className="course-stack-icon">{course.icon}</span>
                <small>Ảnh khóa học · sắp cập nhật</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="registration-section" id="dang-ky" aria-labelledby="register-heading">
        <div className="registration-copy reveal">
          <p className="section-kicker">Tư vấn</p>
          <h2 id="register-heading">CHỌN ĐIỂM BẮT ĐẦU.</h2>
          <p>
            Để lại mục tiêu của bạn — Crema Lab liên hệ tư vấn phù hợp, không
            làm phiền.
          </p>
          <div className="contact-lines">
            <span>hello@cremalab.vn</span>
            <span>TP. Hồ Chí Minh</span>
          </div>
        </div>

        <form className="registration-form reveal" onSubmit={submitConsultation} style={{ transitionDelay: "90ms" }}>
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
              <option>Sensory &amp; Flavor</option>
              <option>Brewing Control</option>
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
          <p>Flavor is not a formula.<br />It is a system.</p>
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
