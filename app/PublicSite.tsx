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
    tuition: "Tư vấn 1:1",
    khaiGiang: "20.07",
    lich: "Thứ 3 · 5 · 7",
    description:
      "Nắm nguyên lý espresso, sữa và quy trình làm việc — tự điều chỉnh thay vì phụ thuộc công thức.",
  },
  {
    number: "02",
    title: "Sensory & Flavor",
    level: "CHUYÊN SÂU",
    duration: "4 buổi",
    format: "Tại Lab",
    tuition: "Tư vấn 1:1",
    khaiGiang: "03.08",
    lich: "Thứ 7 · CN",
    description:
      "Xây ngôn ngữ cảm quan, hiệu chỉnh vị giác, đọc mối liên hệ hương – vị – cấu trúc – hậu vị.",
  },
  {
    number: "03",
    title: "Brewing Control",
    level: "ỨNG DỤNG",
    duration: "4 buổi",
    format: "Tại Lab",
    tuition: "Tư vấn 1:1",
    khaiGiang: "17.08",
    lich: "Thứ 2 · 4",
    description:
      "Kiểm soát chiết xuất bằng dữ liệu và quan sát để chủ động tạo hương vị mong muốn.",
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
        {['Nguồn gốc', 'Sơ chế', 'Rang', 'Chiết xuất', 'Cảm quan'].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <section className="about-section" id="about" aria-labelledby="about-heading">
        <div className="section-heading reveal">
          <div>
            <p className="section-kicker">Về Crema Lab</p>
            <h2 id="about-heading">TRIẾT LÝ VẬN HÀNH.</h2>
          </div>
          <p>
            Hương vị không đến từ công thức cố định, mà từ khả năng đọc và kiểm
            soát một hệ thống biến số.
          </p>
        </div>

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
            trong tình huống thật.
          </p>
        </div>

        <div className="course-grid">
          {courses.map((course, index) => (
            <article className="course-card reveal" key={course.number} style={{ transitionDelay: `${index * 80}ms` }}>
              <div className="course-number">{course.number}</div>
              <p className="course-level">{course.level}</p>
              <h3>{course.title}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span>{course.duration}</span>
                <span>{course.format}</span>
              </div>
              <a href="#dang-ky">
                Nhận tư vấn khóa học <span aria-hidden="true">↘</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="tuition-section" id="hoc-phi" aria-labelledby="tuition-heading">
        <div className="section-heading reveal">
          <div>
            <p className="section-kicker">Học phí &amp; Lịch học</p>
            <h2 id="tuition-heading">ĐẦU TƯ CHO KỸ NĂNG.</h2>
          </div>
          <p>
            Học phí tư vấn 1:1 theo lộ trình phù hợp — không có mức giá chung.
            Lớp nhỏ, khai giảng theo lịch dưới đây.
          </p>
        </div>

        <div className="tuition-table" role="table" aria-label="Học phí và lịch khai giảng theo khóa">
          <div className="tuition-row tuition-header" role="row">
            <span>Khóa học</span>
            <span>Buổi</span>
            <span>Hình thức</span>
            <span>Khai giảng</span>
            <span>Lịch</span>
            <span>Học phí</span>
          </div>
          {courses.map((course, index) => (
            <a className="tuition-row reveal" href="#dang-ky" role="row" key={course.number} style={{ transitionDelay: `${index * 70}ms` }}>
              <span data-label="Khóa học">{course.title}</span>
              <span data-label="Buổi">{course.duration}</span>
              <span data-label="Hình thức">{course.format}</span>
              <span data-label="Khai giảng">{course.khaiGiang}</span>
              <span data-label="Lịch">{course.lich}</span>
              <span data-label="Học phí">{course.tuition}</span>
            </a>
          ))}
        </div>
        <p className="tool-note">Bấm vào một dòng để gửi yêu cầu tư vấn cho khóa đó.</p>
      </section>

      <section className="registration-section" id="dang-ky" aria-labelledby="register-heading">
        <div className="registration-copy reveal">
          <p className="section-kicker">Tư vấn</p>
          <h2 id="register-heading">CHỌN ĐIỂM BẮT ĐẦU.</h2>
          <p>
            Để lại mục tiêu của bạn — Crema Lab liên hệ tư vấn khóa học phù hợp,
            không ép đăng ký, không gửi thông tin dư thừa.
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
    </main>
  );
}
