"use client";

import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import "./public-site.css";

type PublicSiteProps = {
  onExperience: () => void;
};

const navigation = [
  ["01", "Kiến thức", "#knowledge-lab"],
  ["02", "Khóa học", "#khoa-hoc"],
  ["03", "Lịch học", "#lich-hoc"],
  ["04", "Tư vấn", "#dang-ky"],
];

const principles = [
  {
    title: "Hệ thống biến số",
    description:
      "Mỗi tách cà phê là kết quả của nhiều biến số tương tác — nguồn gốc, sơ chế, rang, chiết xuất, cảm quan — không phải một bước duy nhất quyết định tất cả.",
  },
  {
    title: "Học bằng quan sát",
    description:
      "Công cụ tương tác giúp bạn nhìn thấy điều đang xảy ra bên trong một quả cà phê, một mẻ rang, một lần chiết xuất — không chỉ ghi nhớ lý thuyết suông.",
  },
  {
    title: "Tiêu chuẩn khoa học",
    description:
      "Mỗi khẳng định chuyên môn đều có căn cứ, phân biệt rõ dữ liệu thực tế và hình ảnh minh hoạ mang tính khái niệm.",
  },
];

const instructor = {
  role: "Head Trainer",
  name: "Đội ngũ giảng viên Crema Lab",
  bio:
    "Trực tiếp vận hành rang, pha chế và huấn luyện hằng ngày tại Lab — không đứng lớp thuần lý thuyết. Mỗi buổi học đi từ quan sát thực tế đến nguyên lý, rồi quay lại thực hành để học viên tự kiểm chứng.",
  focus: ["Espresso & Sữa", "Rang & Đánh giá cảm quan", "Chiết xuất & Kiểm soát biến số"],
};

const knowledgeTools = [
  {
    number: "01",
    title: "Bánh xe hương vị cà phê",
    description:
      "Đi từ nhóm hương tổng quát đến những mô tả cụ thể để gọi tên điều bạn thật sự cảm nhận trong tách cà phê.",
    href: "/tools/flavor-wheel.html",
    action: "Mở bánh xe hương vị",
    kind: "wheel",
    meta: "Công cụ tương tác · Song ngữ",
  },
  {
    number: "02",
    title: "Bản đồ vùng trồng Việt Nam",
    description:
      "Khám phá vùng trồng, độ cao, giống và phương pháp sơ chế để hiểu vì sao mỗi vùng tạo nên một hồ sơ hương vị khác nhau.",
    href: "/tools/vietnam-coffee-map.html",
    action: "Mở bản đồ vùng trồng",
    kind: "map",
    meta: "Dữ liệu vùng trồng · Có nguồn",
  },
  {
    number: "03",
    title: "Extraction Lab",
    description:
      "Chỉnh Dose, Ratio, Grind size và Contact time để xem chúng ảnh hưởng đến tốc độ dòng chảy và kết quả trong tách như thế nào.",
    href: "/tools/extraction-lab.html",
    action: "Mở Extraction Lab",
    kind: "lab",
    meta: "Mô phỏng tương tác · 3 tầng kiến thức",
  },
];

const courses = [
  {
    number: "01",
    title: "Barista Foundation",
    level: "Nền tảng",
    duration: "6 buổi",
    format: "Tại Lab",
    tuition: "Tư vấn 1:1",
    description:
      "Nắm vững nguyên lý espresso, sữa, quy trình làm việc và cách tự điều chỉnh thay vì phụ thuộc vào công thức.",
  },
  {
    number: "02",
    title: "Sensory & Flavor",
    level: "Chuyên sâu",
    duration: "4 buổi",
    format: "Tại Lab",
    tuition: "Tư vấn 1:1",
    description:
      "Xây dựng ngôn ngữ cảm quan, hiệu chỉnh vị giác và đọc mối liên hệ giữa hương, vị, cấu trúc và hậu vị.",
  },
  {
    number: "03",
    title: "Brewing Control",
    level: "Ứng dụng",
    duration: "4 buổi",
    format: "Tại Lab",
    tuition: "Tư vấn 1:1",
    description:
      "Kiểm soát chiết xuất bằng dữ liệu, biến số và quan sát để chủ động tạo ra hương vị mong muốn.",
  },
];

const schedule = [
  ["Barista Foundation", "20.07", "Thứ 3 · 5 · 7", "18:30 — 21:00", "Còn 4 chỗ"],
  ["Sensory & Flavor", "03.08", "Thứ 7 · CN", "09:00 — 12:00", "Còn 6 chỗ"],
  ["Brewing Control", "17.08", "Thứ 2 · 4", "18:30 — 21:00", "Đang nhận đăng ký"],
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
            <i />
            <i />
          </span>
          <span>
            <strong>CREMA</strong>
            <small>LAB</small>
          </span>
        </a>

        <nav aria-label="Điều hướng chính">
          {navigation.map(([number, label, href]) => (
            <a key={href} href={href}>
              <small>{number}</small>
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
          {navigation.map(([number, label, href]) => (
            <a key={href} href={href}>
              <small>{number}</small>
              <strong>{label}</strong>
              <span aria-hidden="true">↘</span>
            </a>
          ))}
        </div>
      </section>

      <div className="system-strip" aria-label="Chuỗi biến số cà phê">
        {['Nguồn gốc', 'Sơ chế', 'Rang', 'Chiết xuất', 'Cảm quan'].map((item, index) => (
          <span key={item}><small>0{index + 1}</small>{item}</span>
        ))}
      </div>

      <section className="about-section" id="about" aria-labelledby="about-heading">
        <div className="section-heading reveal">
          <div>
            <p className="section-kicker">01 — Về Crema Lab</p>
            <h2 id="about-heading">TRIẾT LÝ VẬN HÀNH.</h2>
          </div>
          <p>
            Crema Lab tin hương vị không đến từ một công thức cố định, mà từ khả
            năng đọc và kiểm soát một hệ thống biến số. Chúng tôi dạy cách nhìn
            thấy hệ thống đó, không chỉ ghi nhớ con số.
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
            <p className="section-kicker">02 — Kiến thức</p>
            <h2 id="knowledge-heading">HỌC BẰNG CÁCH KHÁM PHÁ.</h2>
          </div>
          <p>
            Hai công cụ trực quan giúp biến dữ liệu cà phê phức tạp thành trải
            nghiệm dễ hiểu, dễ nhớ và có thể sử dụng ngay.
          </p>
        </div>

        <div className="tool-grid">
          {knowledgeTools.map((tool, index) => (
            <article
              className="tool-card reveal spotlight"
              key={tool.href}
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
                <a href={tool.href} target="_blank" rel="noreferrer">
                  {tool.action} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="tool-note">Các công cụ mở ở tab riêng để giữ nguyên không gian tương tác.</p>
      </section>

      <section className="instructor-section" id="instructor" aria-labelledby="instructor-heading">
        <div className="section-heading reveal">
          <div>
            <p className="section-kicker">03 — Giảng viên</p>
            <h2 id="instructor-heading">HỌC TỪ NGƯỜI TRỰC TIẾP LÀM NGHỀ.</h2>
          </div>
          <p>Đứng lớp là người trực tiếp vận hành, không chỉ giảng lý thuyết.</p>
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
            <p className="section-kicker">04 — Khóa học</p>
            <h2 id="courses-heading">HỌC ĐỂ TỰ ĐIỀU CHỈNH.</h2>
          </div>
          <p>
            Mỗi khóa học đi từ nguyên lý đến thực hành, giúp bạn hiểu biến số và
            tự đưa ra quyết định trong những tình huống thật.
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
            <p className="section-kicker">05 — Học phí</p>
            <h2 id="tuition-heading">ĐẦU TƯ CHO KỸ NĂNG.</h2>
          </div>
          <p>
            Học phí được tư vấn 1:1 theo lộ trình và số buổi phù hợp — không
            công bố một mức giá chung cho mọi học viên.
          </p>
        </div>

        <div className="tuition-table" role="table" aria-label="Học phí theo khóa">
          <div className="tuition-row tuition-header" role="row">
            <span>Khóa học</span>
            <span>Thời lượng</span>
            <span>Hình thức</span>
            <span>Học phí</span>
          </div>
          {courses.map((course, index) => (
            <a className="tuition-row reveal" href="#dang-ky" role="row" key={course.number} style={{ transitionDelay: `${index * 70}ms` }}>
              <span data-label="Khóa học">{course.title}</span>
              <span data-label="Thời lượng">{course.duration}</span>
              <span data-label="Hình thức">{course.format}</span>
              <span data-label="Học phí">{course.tuition}</span>
            </a>
          ))}
        </div>
        <p className="tool-note">Bấm vào một dòng để gửi yêu cầu tư vấn học phí cho khóa đó.</p>
      </section>

      <section className="schedule-section" id="lich-hoc" aria-labelledby="schedule-heading">
        <div className="section-heading reveal">
          <div>
            <p className="section-kicker">06 — Lịch học</p>
            <h2 id="schedule-heading">LỊCH GẦN NHẤT.</h2>
          </div>
          <p>Lớp nhỏ để giảng viên có đủ thời gian quan sát và phản hồi trực tiếp cho từng học viên.</p>
        </div>

        <div className="schedule-table" role="table" aria-label="Lịch khai giảng">
          <div className="schedule-row schedule-header" role="row">
            <span>Khóa học</span>
            <span>Khai giảng</span>
            <span>Lịch học</span>
            <span>Thời gian</span>
            <span>Tình trạng</span>
          </div>
          {schedule.map((row, index) => (
            <a className="schedule-row reveal" href="#dang-ky" role="row" key={`${row[0]}-${row[1]}`} style={{ transitionDelay: `${index * 70}ms` }}>
              {row.map((cell, index) => (
                <span key={cell} data-label={schedule[0] ? ["Khóa học", "Khai giảng", "Lịch học", "Thời gian", "Tình trạng"][index] : ""}>
                  {cell}
                </span>
              ))}
            </a>
          ))}
        </div>
      </section>

      <section className="registration-section" id="dang-ky" aria-labelledby="register-heading">
        <div className="registration-copy reveal">
          <p className="section-kicker">07 — Tư vấn</p>
          <h2 id="register-heading">CHỌN ĐÚNG ĐIỂM BẮT ĐẦU.</h2>
          <p>
            Hãy để lại mục tiêu của bạn. Crema Lab sẽ liên hệ để tư vấn khóa học
            phù hợp, không ép đăng ký và không gửi thông tin dư thừa.
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
          <span className="brand-mark" aria-hidden="true"><i /><i /></span>
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
