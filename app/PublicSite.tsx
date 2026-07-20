"use client";

import { CSSProperties, FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
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

const alumniPhotos = [
  "/images/alumni/student-1.jpg",
  "/images/alumni/student-2.jpg",
  "/images/alumni/student-3.jpg",
  "/images/alumni/student-4.jpg",
  "/images/alumni/student-5.jpg",
  "/images/alumni/student-6.jpg",
];

const instructor = {
  role: "Người sáng lập & đào tạo",
  name: "Kỳ Long",
  bio: "Tham gia nghề cà phê từ 2012, hoàn thành chứng chỉ SCA Professional.",
  achievements: [
    "Champion — Vietnam Super Barista Championship 2016",
    "Champion — Vietnam Latte Art Competition 2015",
  ],
};

const contactChannels = [
  {
    name: "Hotline",
    href: "tel:0933066889",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
      </svg>
    ),
  },
  {
    name: "Zalo",
    href: "https://zalo.me/0933066889",
    color: "#0068FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z" />
      </svg>
    ),
  },
  {
    name: "Messenger",
    href: null,
    color: "#0866FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.521 3.769 8.61a.96.96 0 0 1 .323.683l.065 2.135a.96.96 0 0 0 1.347.85l2.381-1.053a.96.96 0 0 1 .641-.046A13 13 0 0 0 12 23.28c6.76 0 12-4.952 12-11.64S18.76 0 12 0m6.806 7.44c.522-.03.971.567.63 1.094l-4.178 6.457a.707.707 0 0 1-.977.208l-3.87-2.504a.44.44 0 0 0-.49.007l-4.363 3.01c-.637.438-1.415-.317-.995-.966l4.179-6.457a.706.706 0 0 1 .977-.21l3.87 2.505c.15.097.344.094.491-.007l4.362-3.008a.7.7 0 0 1 .364-.13" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: null,
    color: "#0866FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: null,
    color: "#FF0069",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: null,
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: null,
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Điền form",
    isFormToggle: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
        <path d="M14 2v5a1 1 0 0 0 1 1h5" />
        <path d="M10 9H8" />
        <path d="M16 13H8" />
        <path d="M16 17H8" />
      </svg>
    ),
  },
];

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
    dark: false,
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
    dark: true,
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
    level: "MỞ RỘNG",
    duration: "4 buổi",
    format: "Tại Lab",
    khaiGiang: "17.08",
    description:
      "Kiểm soát chiết xuất bằng dữ liệu và quan sát — pour-over, thông số và hiệu chỉnh để chủ động tạo hương vị mong muốn.",
    color: "#A89070",
    dark: true,
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
    level: "KẾT HỢP",
    duration: "5 buổi",
    format: "Tại Lab",
    khaiGiang: "31.08",
    description:
      "Xây dựng menu đồ uống có hệ thống — chuẩn hoá công thức, tính giá vốn và vận hành nhất quán.",
    color: "#1E1F1F",
    dark: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h9M4 10h9M4 14h6" />
        <path d="M16 9h4v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V9Z" />
        <path d="M20 10.5h1a1.3 1.3 0 0 1 0 2.6h-1" />
      </svg>
    ),
  },
  {
    number: "05",
    title: "Barista Operation",
    level: "VẬN HÀNH",
    duration: "6 buổi",
    format: "Riêng 1:1 · 1:2",
    khaiGiang: "Linh hoạt",
    description:
      "Từ quầy bar đến vận hành kinh doanh — chuẩn bị mở quán, xây dựng menu nền và chuẩn hoá vận hành quầy bar thực tế.",
    color: "#4A2E12",
    dark: false,
    link: "/documents/barista-operation-crema-lab.pdf",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9l1-5h14l1 5" />
        <path d="M4 9a2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0 4.4 0 2.2 2.2 0 0 0 4.4 0A2.2 2.2 0 0 0 21 9" />
        <path d="M5 9v10h14V9" />
        <path d="M9.5 19v-5h5v5" />
      </svg>
    ),
  },
];

export default function PublicSite({ onExperience }: PublicSiteProps) {
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
          <div className="instructor-tab">{instructor.role}</div>
          <div className="instructor-body">
            <div className="instructor-copy">
              <h2 id="instructor-heading">
                Học cùng <em>nhà vô địch</em>.
              </h2>
              <p className="instructor-bio">{instructor.bio}</p>
              <ul className="instructor-achievements">
                {instructor.achievements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="instructor-signature">{instructor.name}</p>
              <p className="instructor-signature-role">{instructor.role}, Crema Lab</p>
            </div>
            <div className="instructor-portrait">
              <Image
                src="/images/instructor-ky-long.jpg"
                alt={instructor.name}
                fill
                sizes="(max-width: 760px) 100vw, 45vw"
                style={{ objectFit: "cover", objectPosition: "50% 12%" }}
              />
            </div>
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
          {courses.map((course, index) => {
            const CardTag = course.link ? "a" : "article";
            return (
            <CardTag
              className="course-stack-card"
              key={course.number}
              style={{
                top: `calc(88px + ${index * 64}px)`,
                zIndex: index + 1,
              }}
              {...(course.link ? { href: course.link, target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <div
                className={`course-tab${course.dark ? " is-dark-text" : ""}`}
                style={{ backgroundColor: course.color }}
              >
                <span>{course.number} — {course.title}</span>
                <span className="course-tab-level">{course.level}</span>
              </div>
              <div className="course-stack-body">
                <div className="course-stack-copy">
                  <div>
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
            </CardTag>
            );
          })}
          <div className="course-stack-spacer" aria-hidden="true" />
        </div>
      </section>

      <section className="alumni-strip" aria-label="Học viên đã tham gia khóa học">
        <p className="alumni-kicker">Học viên đã đồng hành cùng Crema Lab</p>
        <div className="alumni-track" aria-hidden="true">
          {[...alumniPhotos, ...alumniPhotos].map((src, index) => (
            <span className="alumni-frame" key={index}>
              <Image src={src} alt="" fill sizes="360px" style={{ objectFit: "cover" }} />
            </span>
          ))}
        </div>
      </section>

      <section className="registration-section" id="dang-ky" aria-labelledby="register-heading">
        <div className="registration-panel reveal">
          <div className="registration-copy">
            <span className="registration-badge">Tư vấn</span>
            <h2 id="register-heading">CHỌN ĐIỂM BẮT ĐẦU.</h2>
            <p>
              Hãy kể Crema Lab nghe điều bạn đang hướng đến — chúng ta sẽ cùng
              tìm điểm bắt đầu phù hợp.
            </p>
          </div>

          <div className="registration-actions">
            <div className="contact-channels">
              {contactChannels.map((channel, index) => {
                const tileStyle = {
                  "--delay": `${index * 0.12}s`,
                  ...(channel.color ? { "--brand": channel.color } : {}),
                } as CSSProperties;
                if (channel.isFormToggle) {
                  return (
                    <button
                      type="button"
                      key={channel.name}
                      className={`contact-channel contact-channel-toggle${showForm ? " is-active" : ""}`}
                      style={tileStyle}
                      aria-expanded={showForm}
                      aria-controls="registration-form"
                      aria-label={channel.name}
                      title={channel.name}
                      onClick={() => setShowForm((prev) => !prev)}
                    >
                      <span className="contact-channel-icon" aria-hidden="true">{channel.icon}</span>
                    </button>
                  );
                }
                if (channel.href) {
                  const isExternal = !channel.href.startsWith("tel:");
                  return (
                    <a
                      key={channel.name}
                      className="contact-channel"
                      href={channel.href}
                      style={tileStyle}
                      aria-label={channel.name}
                      title={channel.name}
                      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <span className="contact-channel-icon" aria-hidden="true">{channel.icon}</span>
                    </a>
                  );
                }
                return (
                  <span
                    key={channel.name}
                    className="contact-channel is-soon"
                    style={tileStyle}
                    aria-label={channel.name}
                    title={channel.name}
                    aria-disabled="true"
                  >
                    <span className="contact-channel-icon" aria-hidden="true">{channel.icon}</span>
                  </span>
                );
              })}
            </div>

            {showForm && (
              <form id="registration-form" className="registration-form" onSubmit={submitConsultation}>
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
                    <option>Barista Operation</option>
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
            )}
          </div>
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
