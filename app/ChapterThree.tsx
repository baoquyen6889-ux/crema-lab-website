"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type RoastId = "filter" | "phin" | "espresso";
type SpeciesId = "arabica" | "robusta";

const SPECIES: Array<{ id: SpeciesId; label: string; scientific: string; cue: string }> = [
  { id: "arabica", label: "Arabica", scientific: "Coffea arabica", cue: "Hạt dài · sucrose cao hơn" },
  { id: "robusta", label: "Robusta", scientific: "Coffea canephora", cue: "Hạt tròn · caffeine & CGA cao hơn" },
];

const ROAST_TURNTABLE_PAUSED = true;

type RoastEvent = {
  id: "charge" | "tp" | "yellow" | "cinnamon" | "fc" | "drop";
  short: string;
  label: string;
  time: number;
  timeLabel: string;
  temp: number;
  ror?: number;
};

type RoastProfile = {
  id: RoastId;
  number: string;
  name: string;
  english: string;
  intent: string;
  statement: string;
  colorTarget: string;
  weightLoss: string;
  development: string;
  cup: string;
  imageIndex: number;
  color: string;
  finalColor: string;
  agtronTarget: number;
  events: RoastEvent[];
};

const PROFILES: RoastProfile[] = [
  {
    id: "filter",
    number: "01",
    name: "Làm rõ nguồn gốc",
    english: "Filter clarity",
    intent: "Giữ cấu trúc hương của nguyên liệu",
    statement: "Năng lượng đầu mẻ đủ mạnh, Maillard gọn và giai đoạn sau nổ lần một ngắn để giữ độ sáng, hương hoa và dấu vết vùng trồng.",
    colorTarget: "Agtron 74–80",
    weightLoss: "12–13.5%",
    development: "1:10 · 12.7%",
    cup: "Hương hoa · quả sáng · độ trong cao",
    imageIndex: 0,
    color: "#b86f3e",
    finalColor: "#8a4b2e",
    agtronTarget: 77,
    events: [
      { id: "charge", short: "NẠP", label: "Nạp hạt", time: 0, timeLabel: "0:00", temp: 198 },
      { id: "tp", short: "TP", label: "Turning point", time: 1.25, timeLabel: "1:15", temp: 92, ror: 24 },
      { id: "yellow", short: "VÀNG", label: "Kết thúc sấy", time: 4.2, timeLabel: "4:12", temp: 150, ror: 15 },
      { id: "cinnamon", short: "CIN", label: "Cinnamon", time: 6.18, timeLabel: "6:11", temp: 174, ror: 11.2 },
      { id: "fc", short: "FC", label: "Nổ lần một", time: 7.92, timeLabel: "7:55", temp: 196, ror: 8.2 },
      { id: "drop", short: "XẢ", label: "Xả hạt", time: 9.08, timeLabel: "9:05", temp: 202, ror: 4.5 },
    ],
  },
  {
    id: "phin",
    number: "02",
    name: "Pha phin",
    english: "Vietnamese phin",
    intent: "Tạo thể chất dày và hậu vị dài",
    statement: "Kéo dài Maillard và phát triển có kiểm soát để tạo vị ngọt nâu, thể chất dày, độ hòa tan cao và hậu vị phù hợp pha phin.",
    colorTarget: "Robusta · Agtron 40–50",
    weightLoss: "15–18%",
    development: "Điều chỉnh theo hạt và máy",
    cup: "Chocolate · caramel đậm · thể chất dày",
    imageIndex: 1,
    color: "#9e5633",
    finalColor: "#683923",
    agtronTarget: 55,
    events: [
      { id: "charge", short: "NẠP", label: "Nạp hạt", time: 0, timeLabel: "0:00", temp: 200 },
      { id: "tp", short: "TP", label: "Turning point", time: 1.33, timeLabel: "1:20", temp: 91, ror: 23 },
      { id: "yellow", short: "VÀNG", label: "Kết thúc sấy", time: 4.5, timeLabel: "4:30", temp: 151, ror: 14.2 },
      { id: "cinnamon", short: "CIN", label: "Cinnamon", time: 6.55, timeLabel: "6:33", temp: 175, ror: 10.6 },
      { id: "fc", short: "FC", label: "Nổ lần một", time: 8.42, timeLabel: "8:25", temp: 197, ror: 7.7 },
      { id: "drop", short: "XẢ", label: "Xả hạt", time: 12, timeLabel: "12:00", temp: 207, ror: 4.1 },
    ],
  },
  {
    id: "espresso",
    number: "03",
    name: "Tối ưu espresso",
    english: "Espresso structure",
    intent: "Tăng độ hòa tan và cấu trúc vị",
    statement: "Maillard sâu hơn và giai đoạn phát triển dài hơn có kiểm soát để tăng độ hòa tan, vị ngọt đậm và thể chất mà không đẩy hạt đến vị cháy.",
    colorTarget: "Agtron 56–62",
    weightLoss: "15–16.5%",
    development: "1:55 · 17.8%",
    cup: "Chocolate · hạt rang · thể chất dày",
    imageIndex: 2,
    color: "#794029",
    finalColor: "#43241b",
    agtronTarget: 55,
    events: [
      { id: "charge", short: "NẠP", label: "Nạp hạt", time: 0, timeLabel: "0:00", temp: 202 },
      { id: "tp", short: "TP", label: "Turning point", time: 1.42, timeLabel: "1:25", temp: 90, ror: 22 },
      { id: "yellow", short: "VÀNG", label: "Kết thúc sấy", time: 4.75, timeLabel: "4:45", temp: 151, ror: 13.5 },
      { id: "cinnamon", short: "CIN", label: "Cinnamon", time: 6.82, timeLabel: "6:49", temp: 176, ror: 10.1 },
      { id: "fc", short: "FC", label: "Nổ lần một", time: 8.83, timeLabel: "8:50", temp: 198, ror: 7.2 },
      { id: "drop", short: "XẢ", label: "Xả hạt", time: 11.75, timeLabel: "11:45", temp: 213, ror: 3.8 },
    ],
  },
];

type StageId = "green" | "drying" | "yellow" | "cinnamon" | "first-crack" | "development" | "drop" | "second-crack" | "overroast";

type RoastStage = {
  id: StageId;
  number: string;
  label: string;
  english: string;
  imageIndex: number;
  progress: number;
  color: string;
  scale: number;
  agtron: number | null;
  temperature: string;
  physical: string;
  chemistry: string;
  signal: string;
};

const ROAST_STAGES: RoastStage[] = [
  {
    id: "green",
    number: "00",
    label: "Nhân xanh",
    english: "Green bean",
    imageIndex: 0,
    progress: 0,
    color: "#7f8966",
    scale: .8,
    agtron: null,
    temperature: "Trước khi nạp · 8–12% ẩm",
    physical: "Nội nhũ đặc, thành tế bào còn kín; hạt nhỏ, nặng và dẫn nhiệt không đồng đều từ ngoài vào trong.",
    chemistry: "Đường, acid hữu cơ, amino acid và tiền chất hương vẫn ở trạng thái ban đầu.",
    signal: "Màu xanh ô-liu · mùi thực vật tươi",
  },
  {
    id: "drying",
    number: "01",
    label: "Mất nước",
    english: "Drying",
    imageIndex: 1,
    progress: 16,
    color: "#a7a06f",
    scale: .84,
    agtron: null,
    temperature: "TP → khoảng 140°C*",
    physical: "Hạt hấp thụ nhiệt; nước tự do di chuyển từ tâm ra bề mặt và thoát thành hơi. Khối lượng bắt đầu giảm nhưng thể tích chưa nở mạnh.",
    chemistry: "Phản ứng tạo hương còn chậm; phần lớn năng lượng đang phục vụ truyền nhiệt và chuyển pha của nước.",
    signal: "Xanh nhạt → vàng rơm · mùi cỏ khô",
  },
  {
    id: "yellow",
    number: "02",
    label: "Yellow",
    english: "Color change",
    imageIndex: 2,
    progress: 34,
    color: "#c59a54",
    scale: .88,
    agtron: null,
    temperature: "Khoảng 145–155°C*",
    physical: "Bề mặt khô hơn, lớp vỏ lụa tách dần và hạt chuyển sang vàng đồng đều — mốc thực hành kết thúc pha sấy.",
    chemistry: "Tiền chất đường–amino bắt đầu đi vào vùng phản ứng nâu hóa; Maillard tăng dần chứ không bật/tắt tại một điểm.",
    signal: "Vàng rơm · mùi bánh mì, ngũ cốc",
  },
  {
    id: "cinnamon",
    number: "03",
    label: "Cinnamon",
    english: "Early browning",
    imageIndex: 3,
    progress: 52,
    color: "#aa6b3f",
    scale: .93,
    agtron: 96,
    temperature: "Khoảng 165–180°C*",
    physical: "Hạt ngả nâu quế, áp suất hơi và khí tăng; cấu trúc cellulose yếu dần và thể tích bắt đầu mở.",
    chemistry: "Maillard và Strecker tạo melanoidin cùng nhiều tiền chất hương rang; tốc độ phản ứng tăng mạnh theo nhiệt.",
    signal: "Nâu quế · mùi men, bánh nướng, caramel nhẹ",
  },
  {
    id: "first-crack",
    number: "04",
    label: "Nổ lần một",
    english: "First crack",
    imageIndex: 4,
    progress: 70,
    color: "#884e31",
    scale: .99,
    agtron: 82,
    temperature: "Thường gần 195–202°C BT*",
    physical: "Hơi nước và CO₂ vượt sức chịu của thành tế bào, tạo tiếng nổ; hạt nở nhanh, giảm mật độ và xuất hiện khe nứt.",
    chemistry: "Hệ chuyển mạnh sang tỏa nhiệt; phản ứng nâu hóa lan nhanh từ bề mặt vào lõi hạt.",
    signal: "Tiếng nổ rời → liên tục · khói tăng nhẹ",
  },
  {
    id: "development",
    number: "05",
    label: "Phát triển",
    english: "Development",
    imageIndex: 5,
    progress: 86,
    color: "#6d3a27",
    scale: 1.05,
    agtron: 70,
    temperature: "Từ FC đến trước khi xả",
    physical: "Hạt tiếp tục nở, giòn và xốp hơn. Chênh lệch nhiệt giữa bề mặt–lõi cần được thu hẹp mà không làm RoR rơi hoặc bật mạnh.",
    chemistry: "Maillard, caramel hóa và nhiệt phân chồng lấn; thời gian ở pha này dịch chuyển cân bằng từ quả–ngọt sang rang–hạt–đắng.",
    signal: "Nâu sáng → nâu đậm · hương rang rõ dần",
  },
  {
    id: "drop",
    number: "06",
    label: "Xả & làm nguội",
    english: "Drop / cooling",
    imageIndex: 0,
    progress: 100,
    color: "#542b20",
    scale: 1.11,
    agtron: 62,
    temperature: "Theo mục tiêu hồ sơ",
    physical: "Xả hạt đúng mốc và làm nguội nhanh để dừng quán tính nhiệt. Hạt đã nở, giảm khối lượng và bắt đầu thoát khí sau rang.",
    chemistry: "Phản ứng nhiệt cần được chặn; CO₂ tiếp tục khuếch tán trong quá trình nghỉ trước pha.",
    signal: "Đánh giá bằng màu, hao hụt, đồng đều và cupping",
  },
  {
    id: "second-crack",
    number: "07",
    label: "Nổ lần hai",
    english: "Second crack",
    imageIndex: 0,
    progress: 118,
    color: "#2b1712",
    scale: 1.15,
    agtron: 35,
    temperature: "Khoảng 224–230°C BT*",
    physical: "Cấu trúc tế bào giòn và tiếp tục đứt gãy; lỗ rỗng mở rộng, dầu trong nội nhũ bắt đầu dịch chuyển rõ hơn ra bề mặt.",
    chemistry: "Nhiệt phân tăng mạnh, dấu vết nguồn gốc giảm nhanh và hương rang–khói bắt đầu chi phối.",
    signal: "Tiếng nổ nhỏ, dồn · nâu rất đậm · bắt đầu có đốm dầu",
  },
  {
    id: "overroast",
    number: "08",
    label: "Quá rang · bóng dầu",
    english: "Over-roasted / oily",
    imageIndex: 0,
    progress: 140,
    color: "#070605",
    scale: 1.18,
    agtron: 15,
    temperature: "Khoảng 240–245°C BT hoặc giữ nhiệt quá lâu*",
    physical: "Thành tế bào suy yếu, dầu phủ bề mặt và hạt trở nên rất giòn, xốp; nguy cơ cháy cạnh và carbon hóa tăng cao.",
    chemistry: "Hương dễ bay hơi suy giảm; sản phẩm nhiệt phân, vị khói, đắng cháy và carbon hóa chiếm ưu thế.",
    signal: "Đen gần như than · bóng dầu · khói dày",
  },
];

const MAX_TIME = 15;
const MIN_TEMP = 70;
const MAX_TEMP = 245;
const HEAT_PARTICLES = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  angle: index * 13.85,
  radius: 188 + (index % 7) * 18,
  tilt: -34 + (index % 6) * 13,
  size: 1.7 + (index % 4) * .65,
  delay: index * -.37,
  duration: 7.4 + (index % 8) * .58,
}));

type LinkedPoint = {
  progress: number;
  time: number;
  temp: number;
  color: string;
  agtron: number | null;
};

function targetAgtron(profile: RoastProfile, species: SpeciesId) {
  if (species === "robusta" && profile.id === "phin") return 45;
  if (profile.id === "espresso") return 55;
  return profile.agtronTarget;
}

function targetAgtronLabel(profile: RoastProfile, species: SpeciesId) {
  if (species === "robusta" && profile.id === "phin") return "Agtron 45 · khoảng 40–50";
  return `Mục tiêu Agtron ${targetAgtron(profile, species)}`;
}

function profilePoints(profile: RoastProfile, species: SpeciesId): LinkedPoint[] {
  const event = (id: RoastEvent["id"]) => profile.events.find(item => item.id === id)!;
  const tp = event("tp");
  const yellow = event("yellow");
  const cinnamon = event("cinnamon");
  const firstCrack = event("fc");
  const drop = event("drop");
  const timeFactor = species === "robusta" ? 1.045 : 1;
  const lateTemp = species === "robusta" ? 2 : 0;
  const agtronTarget = targetAgtron(profile, species);
  const finalColor = species === "robusta" ? mixHex(profile.finalColor, "#1f100c", .12) : profile.finalColor;
  const dropTime = Math.min(810, drop.time * 60 * timeFactor);
  const secondCrackTime = Math.min(870, dropTime + 90);
  return [
    { progress: 0, time: 0, temp: 25, color: ROAST_STAGES[0].color, agtron: null },
    { progress: 16, time: tp.time * 60 * timeFactor, temp: tp.temp, color: ROAST_STAGES[1].color, agtron: null },
    { progress: 34, time: yellow.time * 60 * timeFactor, temp: yellow.temp, color: ROAST_STAGES[2].color, agtron: null },
    { progress: 52, time: cinnamon.time * 60 * timeFactor, temp: cinnamon.temp + lateTemp * .5, color: ROAST_STAGES[3].color, agtron: 96 },
    { progress: 70, time: firstCrack.time * 60 * timeFactor, temp: firstCrack.temp + lateTemp, color: ROAST_STAGES[4].color, agtron: 82 },
    {
      progress: 86,
      time: (firstCrack.time + (drop.time - firstCrack.time) * .56) * 60 * timeFactor,
      temp: firstCrack.temp + (drop.temp - firstCrack.temp) * .56 + lateTemp,
      color: ROAST_STAGES[5].color,
      agtron: Math.round(82 + (agtronTarget - 82) * .68),
    },
    { progress: 100, time: dropTime, temp: drop.temp + lateTemp, color: finalColor, agtron: agtronTarget },
    { progress: 118, time: secondCrackTime, temp: 230, color: "#4a2417", agtron: 35 },
    { progress: 140, time: 900, temp: MAX_TEMP, color: "#120705", agtron: 15 },
  ];
}

function segmentForProgress(points: LinkedPoint[], progress: number) {
  const upperIndex = Math.max(1, points.findIndex(point => point.progress >= progress));
  const upper = points[upperIndex] ?? points[points.length - 1];
  const lower = points[upperIndex - 1] ?? points[0];
  const span = Math.max(1, upper.progress - lower.progress);
  return { lower, upper, mix: Math.max(0, Math.min(1, (progress - lower.progress) / span)) };
}

function interpolateNumber(points: LinkedPoint[], progress: number, key: "time" | "temp") {
  const { lower, upper, mix } = segmentForProgress(points, progress);
  return lower[key] + (upper[key] - lower[key]) * mix;
}

function progressFromNumber(points: LinkedPoint[], value: number, key: "time" | "temp") {
  const upperIndex = Math.max(1, points.findIndex(point => point[key] >= value));
  const upper = points[upperIndex] ?? points[points.length - 1];
  const lower = points[upperIndex - 1] ?? points[0];
  const span = Math.max(.001, upper[key] - lower[key]);
  const mix = Math.max(0, Math.min(1, (value - lower[key]) / span));
  return lower.progress + (upper.progress - lower.progress) * mix;
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function mixHex(from: string, to: string, amount: number) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const channel = (start: number, end: number) => Math.round(start + (end - start) * amount).toString(16).padStart(2, "0");
  return `#${channel(a.r, b.r)}${channel(a.g, b.g)}${channel(a.b, b.b)}`;
}

function interpolateColor(points: LinkedPoint[], progress: number) {
  const { lower, upper, mix } = segmentForProgress(points, progress);
  return mixHex(lower.color, upper.color, mix);
}

function interpolateAgtron(points: LinkedPoint[], progress: number) {
  const valid = points.filter(point => point.agtron !== null);
  if (progress < valid[0].progress) return null;
  const upperIndex = Math.max(1, valid.findIndex(point => point.progress >= progress));
  const upper = valid[upperIndex] ?? valid[valid.length - 1];
  const lower = valid[upperIndex - 1] ?? valid[0];
  const mix = Math.max(0, Math.min(1, (progress - lower.progress) / Math.max(1, upper.progress - lower.progress)));
  return Math.round((lower.agtron ?? 0) + ((upper.agtron ?? 0) - (lower.agtron ?? 0)) * mix);
}

function formatTime(seconds: number) {
  const rounded = Math.round(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}

function stageTurnForProgress(progress: number) {
  const foundIndex = ROAST_STAGES.findIndex(stage => stage.progress >= progress);
  const resolvedIndex = foundIndex === -1 ? ROAST_STAGES.length - 1 : foundIndex;
  if (resolvedIndex === 0) return 0;
  const lower = ROAST_STAGES[resolvedIndex - 1];
  const upper = ROAST_STAGES[resolvedIndex];
  const local = Math.max(0, Math.min(1, (progress - lower.progress) / Math.max(1, upper.progress - lower.progress)));
  return (resolvedIndex - 1 + local) * Math.PI * 2;
}

function PhotographicRoastBean({
  color,
  progress,
  species,
  turn,
  reduced,
}: {
  color: string;
  progress: number;
  species: SpeciesId;
  turn: number;
  reduced: boolean;
}) {
  const frame = useRef<HTMLSpanElement>(null);
  const currentTurn = useRef(turn);
  const wash = .14 + Math.min(1, progress / 118) * .86;
  const char = Math.max(0, Math.min(.72, (progress - 120) / 20 * .72));
  const oil = Math.max(0, Math.min(.86, (progress - 108) / 32 * .86));
  const brightness = 1 - Math.min(1, progress / 140) * .22;
  const saturation = .94 + Math.min(1, progress / 140) * .28;

  useEffect(() => {
    if (ROAST_TURNTABLE_PAUSED) {
      currentTurn.current = 0;
      frame.current?.style.setProperty("--sprite-x-a", "0%");
      frame.current?.style.setProperty("--sprite-y-a", "0%");
      frame.current?.style.setProperty("--sprite-x-b", "33.333%");
      frame.current?.style.setProperty("--sprite-y-b", "0%");
      frame.current?.style.setProperty("--photo-blend", "0");
      return;
    }
    let animationFrame = 0;
    let previous = performance.now();
    const renderFrame = (now: number) => {
      const elapsed = Math.min(.05, (now - previous) / 1000);
      previous = now;
      const difference = turn - currentTurn.current;
      const step = reduced ? difference : Math.max(-elapsed * 1.15, Math.min(elapsed * 1.15, difference));
      currentTurn.current += step;
      const phase = ((currentTurn.current / (Math.PI * 2)) % 1 + 1) % 1;
      const exactFrame = phase * 12;
      const frameIndex = Math.floor(exactFrame) % 12;
      const nextFrameIndex = (frameIndex + 1) % 12;
      const localFrame = exactFrame - Math.floor(exactFrame);
      const blendWindow = Math.max(0, Math.min(1, (localFrame - .3) / .4));
      const blend = blendWindow * blendWindow * (3 - 2 * blendWindow);
      const column = frameIndex % 4;
      const row = Math.floor(frameIndex / 4);
      const nextColumn = nextFrameIndex % 4;
      const nextRow = Math.floor(nextFrameIndex / 4);
      frame.current?.style.setProperty("--sprite-x-a", `${column / 3 * 100}%`);
      frame.current?.style.setProperty("--sprite-y-a", `${row / 2 * 100}%`);
      frame.current?.style.setProperty("--sprite-x-b", `${nextColumn / 3 * 100}%`);
      frame.current?.style.setProperty("--sprite-y-b", `${nextRow / 2 * 100}%`);
      frame.current?.style.setProperty("--photo-blend", String(blend));
      animationFrame = window.requestAnimationFrame(renderFrame);
    };
    animationFrame = window.requestAnimationFrame(renderFrame);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [reduced, turn]);

  return <span
    ref={frame}
    className={`roast-photo-frame roast-photo-${species} ${ROAST_TURNTABLE_PAUSED ? "is-paused" : ""}`}
    style={{
      "--bean-color": color,
      "--photo-wash": wash,
      "--photo-char": char,
      "--photo-oil": oil,
      "--photo-brightness": brightness,
      "--photo-saturation": saturation,
    } as CSSProperties}
    aria-hidden="true"
  >
    <span className="roast-photo-angle roast-photo-angle-a">
      <span className="roast-photo-source" />
      <span className="roast-photo-color" />
      <span className="roast-photo-char" />
      <span className="roast-photo-oil" />
    </span>
    <span className="roast-photo-angle roast-photo-angle-b">
      <span className="roast-photo-source" />
      <span className="roast-photo-color" />
      <span className="roast-photo-char" />
      <span className="roast-photo-oil" />
    </span>
  </span>;
}

function smoothLine(
  context: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
  progress: number,
) {
  if (points.length < 2) return;
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  const limit = Math.max(1, Math.ceil((points.length - 1) * progress));
  for (let index = 1; index <= limit; index++) {
    const point = points[Math.min(index, points.length - 1)];
    const previous = points[index - 1];
    const localProgress = index === limit ? Math.min(1, progress * (points.length - 1) - (index - 1)) : 1;
    const x = previous.x + (point.x - previous.x) * localProgress;
    const y = previous.y + (point.y - previous.y) * localProgress;
    context.lineTo(x, y);
  }
  context.stroke();
}

function RoastCurve({ profile, species, progress }: { profile: RoastProfile; species: SpeciesId; progress: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const linked = profilePoints(profile, species);
    const currentTime = interpolateNumber(linked, progress, "time") / 60;
    const currentTemp = interpolateNumber(linked, progress, "temp");
    const timeFactor = species === "robusta" ? 1.045 : 1;
    const lateTemp = species === "robusta" ? 2 : 0;
    const adjustedEvents = profile.events.map(event => ({
      ...event,
      time: event.time * timeFactor,
      temp: event.temp + (["cinnamon", "fc", "drop"].includes(event.id) ? lateTemp : 0),
    }));

    const draw = () => {
      const rect = element.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (element.width !== Math.round(rect.width * dpr) || element.height !== Math.round(rect.height * dpr)) {
        element.width = Math.round(rect.width * dpr);
        element.height = Math.round(rect.height * dpr);
      }
      const context = element.getContext("2d");
      if (!context) return;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const pad = { left: 42, right: 38, top: 24, bottom: 31 };
      const width = rect.width - pad.left - pad.right;
      const height = rect.height - pad.top - pad.bottom;
      const xAt = (time: number) => pad.left + (time / MAX_TIME) * width;
      const yAt = (temp: number) => pad.top + ((MAX_TEMP - temp) / (MAX_TEMP - MIN_TEMP)) * height;
      const rorY = (ror: number) => pad.top + ((26 - ror) / 26) * height;
      const yellow = adjustedEvents.find(event => event.id === "yellow")!;
      const firstCrack = adjustedEvents.find(event => event.id === "fc")!;
      const drop = adjustedEvents.find(event => event.id === "drop")!;

      const phases = [
        { from: 0, to: yellow.time, label: "SẤY", color: "rgba(127,109,72,.055)" },
        { from: yellow.time, to: firstCrack.time, label: "MAILLARD", color: "rgba(164,92,49,.07)" },
        { from: firstCrack.time, to: drop.time, label: "PHÁT TRIỂN", color: "rgba(197,97,48,.1)" },
        { from: drop.time, to: MAX_TIME, label: "QUÁ RANG", color: "rgba(84,24,15,.13)" },
      ];
      phases.forEach(phase => {
        context.fillStyle = phase.color;
        context.fillRect(xAt(phase.from), pad.top, xAt(phase.to) - xAt(phase.from), height);
        context.fillStyle = "rgba(191,184,166,.38)";
        context.font = "7px Inter, Arial";
        context.letterSpacing = "1.2px";
        context.fillText(phase.label, xAt(phase.from) + 8, pad.top + 11);
      });

      context.lineWidth = 1;
      context.strokeStyle = "rgba(221,217,202,.08)";
      context.fillStyle = "rgba(135,137,126,.55)";
      context.font = "7px Inter, Arial";
      for (let temp = 80; temp <= 240; temp += 20) {
        const y = yAt(temp);
        context.beginPath();
        context.moveTo(pad.left, y);
        context.lineTo(rect.width - pad.right, y);
        context.stroke();
        context.fillText(`${temp}°`, 8, y + 3);
      }
      for (let time = 0; time <= 15; time += 3) {
        const x = xAt(time);
        context.beginPath();
        context.moveTo(x, pad.top);
        context.lineTo(x, pad.top + height);
        context.stroke();
        context.fillText(`${time}:00`, x - 9, rect.height - 9);
      }

      const curvePoints = linked.slice(1).map(point => ({ x: xAt(point.time / 60), y: yAt(point.temp) }));
      context.save();
      context.strokeStyle = "rgba(190,181,166,.2)";
      context.lineWidth = 1;
      smoothLine(context, curvePoints, 1);
      context.restore();
      context.save();
      context.strokeStyle = profile.color;
      context.lineWidth = 2;
      context.shadowColor = profile.color;
      context.shadowBlur = 8;
      smoothLine(context, curvePoints, Math.max(.01, Math.min(1, progress / 140)));
      context.restore();

      const rorPoints = adjustedEvents.filter(event => event.ror !== undefined).map(event => ({ x: xAt(event.time), y: rorY(event.ror!) }));
      context.save();
      context.setLineDash([4, 5]);
      context.strokeStyle = "rgba(222,208,183,.42)";
      context.lineWidth = 1;
      smoothLine(context, rorPoints, 1);
      context.restore();

      adjustedEvents.forEach(event => {
        const x = xAt(event.time);
        const y = yAt(event.temp);
        context.strokeStyle = "rgba(222,208,183,.2)";
        context.setLineDash([2, 4]);
        context.beginPath();
        context.moveTo(x, pad.top);
        context.lineTo(x, pad.top + height);
        context.stroke();
        context.setLineDash([]);
        context.fillStyle = event.time <= currentTime ? profile.color : "rgba(118,112,104,.6)";
        context.beginPath();
        context.arc(x, y, 3, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "rgba(233,228,216,.82)";
        context.font = "7px Inter, Arial";
        context.fillText(event.short, Math.min(x + 6, rect.width - 34), Math.max(y - 7, pad.top + 20));
      });

      context.fillStyle = "rgba(197,122,76,.75)";
      context.fillRect(rect.width - 140, 8, 14, 1);
      context.fillStyle = "rgba(173,177,164,.6)";
      context.fillText("BT", rect.width - 120, 11);
      context.setLineDash([3, 3]);
      context.strokeStyle = "rgba(222,208,183,.6)";
      context.beginPath();
      context.moveTo(rect.width - 82, 8);
      context.lineTo(rect.width - 68, 8);
      context.stroke();
      context.setLineDash([]);
      context.fillText("RoR", rect.width - 62, 11);

      const cursorX = xAt(currentTime);
      const cursorY = yAt(currentTemp);
      context.strokeStyle = "rgba(235,220,201,.54)";
      context.setLineDash([2, 3]);
      context.beginPath();
      context.moveTo(cursorX, pad.top);
      context.lineTo(cursorX, pad.top + height);
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = "#efe4d5";
      context.beginPath();
      context.arc(cursorX, cursorY, 4, 0, Math.PI * 2);
      context.fill();
    };

    const frame = window.requestAnimationFrame(draw);
    const observer = new ResizeObserver(draw);
    observer.observe(element);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [profile, species, progress]);

  return <div className="roast-chart">
    <div className="roast-chart-title"><span>BT / ROR</span><b>NHIỆT · THỜI GIAN</b></div>
    <canvas ref={canvas} aria-hidden="true" />
    <table className="roast-chart-accessible">
      <caption>Các mốc của hồ sơ {profile.name} — {species}</caption>
      <tbody>{profile.events.map(event => <tr key={event.id}><th>{event.label}</th><td>{event.timeLabel}</td><td>{event.temp}°C</td></tr>)}</tbody>
    </table>
  </div>;
}

export default function ChapterThree({
  active,
  reduced,
  onExplore,
  onBack,
}: {
  active: boolean;
  reduced: boolean;
  onExplore: () => void;
  onBack: () => void;
}) {
  const [roast, setRoast] = useState<RoastId>("filter");
  const [species, setSpecies] = useState<SpeciesId>("arabica");
  const [progress, setProgress] = useState(0);
  const current = PROFILES.find(item => item.id === roast) ?? PROFILES[0];
  const points = profilePoints(current, species);
  const currentStage = [...ROAST_STAGES].reverse().find(item => progress >= item.progress) ?? ROAST_STAGES[0];
  const stageIndex = ROAST_STAGES.findIndex(item => item.id === currentStage.id);
  const nextStage = ROAST_STAGES[(stageIndex + 1) % ROAST_STAGES.length];
  const temperature = Math.round(interpolateNumber(points, progress, "temp"));
  const elapsedSeconds = interpolateNumber(points, progress, "time");
  const beanColor = interpolateColor(points, progress);
  const agtron = interpolateAgtron(points, progress);
  const finalPoint = points[points.length - 1];
  const expansion = .88 + progress * .0017;
  const heatEnergy = Math.max(.08, Math.min(1, progress / 118));
  const stageTurn = stageTurnForProgress(progress);

  useEffect(() => {
    if (active) {
      setRoast("filter");
      setSpecies("arabica");
      setProgress(0);
    }
  }, [active]);

  return <section className={`lab-chapter roasting-chapter roast-${roast} ${active ? "is-active" : ""}`} aria-hidden={!active} aria-label="Chương 03 - Thiết kế hồ sơ rang cà phê">
    <div className="lab-topbar">
      <span>CREMA LAB</span>
      <p>CHƯƠNG 03 <b>—</b> RANG</p>
      <div>
        <button onClick={onBack} tabIndex={active ? 0 : -1}>← Chương 02</button>
        <button onClick={onExplore} tabIndex={active ? 0 : -1}>Khám phá Crema Lab ↗</button>
      </div>
    </div>

    <div className="lab-copy roast-copy">
      <p className="lab-eyebrow">CHƯƠNG 03 · RANG</p>
      <h2>ĐIỀU KHIỂN<br />NHIỆT VÀ HẠT.</h2>
      <p>Chạm vào hạt hoặc kéo một thanh. Mọi biến số sẽ dịch chuyển cùng nhau.</p>
    </div>

    <div className="roast-bean-editor">
      <div className="roast-heat-field" aria-hidden="true" style={{ "--heat-energy": heatEnergy } as CSSProperties}>
        {HEAT_PARTICLES.map(particle => <i
          key={particle.id}
          className="roast-heat-dot"
          style={{
            "--heat-angle": `${particle.angle}deg`,
            "--heat-radius": `${particle.radius}px`,
            "--heat-tilt": `${particle.tilt}deg`,
            "--heat-size": `${particle.size}px`,
            "--heat-delay": `${particle.delay}s`,
            "--heat-duration": `${particle.duration}s`,
          } as CSSProperties}
        />)}
      </div>
      <button
        className="roast-bean-control"
        onClick={() => setProgress(nextStage.progress)}
        tabIndex={active ? 0 : -1}
        aria-label={`Hạt đang ở giai đoạn ${currentStage.label}. Bấm để chuyển sang ${nextStage.label}.`}
        style={{
          "--bean-scale": expansion,
          "--bean-color": beanColor,
          "--bean-transition": reduced ? "none" : "transform .7s cubic-bezier(.2,.72,.2,1),filter .7s ease",
        } as CSSProperties}
      >
        <span className="roast-bean-media">
          {active && <PhotographicRoastBean color={beanColor} progress={progress} species={species} turn={stageTurn} reduced={reduced} />}
        </span>
        <span className="roast-bean-hint">BẤM VÀO HẠT · {nextStage.label.toUpperCase()} →</span>
      </button>
    </div>

    <section className="roast-console" aria-label="Bàn điều khiển hồ sơ rang">
      <div className="roast-species" role="group" aria-label="Chọn loài cà phê">
        {SPECIES.map(item => <button
          key={item.id}
          className={species === item.id ? "is-current" : ""}
          onClick={() => setSpecies(item.id)}
          aria-pressed={species === item.id}
          tabIndex={active ? 0 : -1}
        ><b>{item.label}</b><span>{item.scientific}</span><small>{item.cue}</small></button>)}
      </div>

      <label className="roast-profile-picker">
        <span>Hồ sơ rang</span>
        <select
          value={roast}
          onChange={event => {
            setRoast(event.target.value as RoastId);
            setProgress(100);
          }}
          tabIndex={active ? 0 : -1}
        >
          {PROFILES.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <small>{targetAgtronLabel(current, species)}</small>
      </label>
      <div className="roast-readouts" aria-live="polite">
        <div><span>BT</span><b>{temperature}°C</b></div>
        <div><span>Thời gian</span><b>{formatTime(elapsedSeconds)}</b></div>
        <div><span>Mã màu</span><b>{beanColor.toUpperCase()}</b></div>
        <div><span>Agtron</span><b>{agtron ?? "—"}</b></div>
      </div>

      <label className="roast-control-row">
        <span>Giai đoạn <b>{currentStage.label}</b></span>
        <input type="range" min="0" max="140" step="1" value={progress} onChange={event => setProgress(Number(event.target.value))} tabIndex={active ? 0 : -1} aria-valuetext={currentStage.label} />
      </label>
      <label className="roast-control-row">
        <span>Nhiệt độ BT <b>{temperature}°C</b></span>
        <input type="range" min="25" max={finalPoint.temp} step="1" value={temperature} onChange={event => setProgress(progressFromNumber(points, Number(event.target.value), "temp"))} tabIndex={active ? 0 : -1} />
      </label>
      <label className="roast-control-row">
        <span>Thời gian <b>{formatTime(elapsedSeconds)}</b></span>
        <input type="range" min="0" max={Math.round(finalPoint.time)} step="1" value={Math.round(elapsedSeconds)} onChange={event => setProgress(progressFromNumber(points, Number(event.target.value), "time"))} tabIndex={active ? 0 : -1} />
      </label>
      <label className="roast-control-row color-control" style={{ "--live-color": beanColor } as CSSProperties}>
        <span>Màu hạt <b>{beanColor.toUpperCase()} {agtron ? `· A${agtron}` : ""}</b></span>
        <input type="range" min="0" max="140" step="1" value={progress} onChange={event => setProgress(Number(event.target.value))} tabIndex={active ? 0 : -1} />
      </label>
      <p className="roast-console-note">Màu được mô phỏng theo cả nhiệt và thời gian. BT thực tế có thể lệch theo đầu dò, máy rang, độ ẩm, mật độ và cỡ hạt.</p>
    </section>

    <RoastCurve profile={current} species={species} progress={progress} />

  </section>;
}
