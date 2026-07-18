import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import test, { after, before } from "node:test";

const templateRoot = new URL("../", import.meta.url);
const PORT = 4173;
let server;

before(async () => {
  server = spawn("npx", ["next", "start", "--port", String(PORT)], {
    cwd: new URL("../", import.meta.url),
    stdio: "pipe",
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("next start timed out")), 30_000);
    server.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("Ready")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.on("error", reject);
  });
});

after(() => {
  server?.kill();
});

async function render() {
  return fetch(`http://localhost:${PORT}/`, { headers: { accept: "text/html" } });
}

test("server-renders the Crema Lab brand and commercial website", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Crema Lab — The Unseen World of Coffee<\/title>/i);
  assert.match(html, /id="website"/);
  assert.match(html, /Flavor is not a formula/);
  assert.match(html, /It is a system/);
  assert.match(html, /Origin/);
  assert.match(html, /Extraction/);
  assert.match(html, />Kiến thức</);
  assert.match(html, />Khóa học</);
  assert.match(html, />Tư vấn</);
  assert.match(html, /Bánh xe hương vị cà phê/i);
  assert.match(html, /Bản đồ vùng trồng Việt Nam/i);
  assert.match(html, /href="\/tools\/flavor-wheel\.html"/);
  assert.match(html, /href="\/tools\/vietnam-coffee-map\.html"/);
  assert.match(html, /Barista Foundation/);
  assert.match(html, /Khai giảng/);
  assert.match(html, /20\.07/);
  assert.match(html, /id="dang-ky"/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="instructor"/);
  assert.match(html, /người làm nghề/);
  assert.match(html, /Họ và tên/);
});

test("ships both standalone knowledge tools", async () => {
  const [wheel, map, wheelFile, mapFile] = await Promise.all([
    readFile(new URL("../public/tools/flavor-wheel.html", import.meta.url), "utf8"),
    readFile(new URL("../public/tools/vietnam-coffee-map.html", import.meta.url), "utf8"),
    stat(new URL("../public/tools/flavor-wheel.html", import.meta.url)),
    stat(new URL("../public/tools/vietnam-coffee-map.html", import.meta.url)),
  ]);

  assert.match(wheel, /Bánh Xe Hương Vị Cà Phê/i);
  assert.match(map, /Bản Đồ Vùng Trồng Cà Phê Việt Nam/i);
  assert.match(wheel, /class="home-shortcut" href="\/"/);
  assert.match(map, /class="home-shortcut" href="\/"/);
  assert.match(wheel, /class="brand-mark" href="\/"/);
  assert.match(map, /class="brand-mark" href="\/"/);
  assert.ok(wheelFile.size > 1_000_000);
  assert.ok(mapFile.size > 100_000);
});

test("opening carries one focus particle into the slower fruit-formation sequence", async () => {
  const [universe, effects, chapter, chapterEffects, page] = await Promise.all([
    readFile(new URL("../app/ParticleUniverse.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/page01.css", import.meta.url), "utf8"),
    readFile(new URL("../app/ChapterOne.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/chapter-one.css", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(universe, /coffeeSeedTarget/);
  assert.match(universe, /FOCUS_PARTICLE/);
  assert.match(universe, /FOCUS_POINT/);
  assert.match(universe, /const release = ease\(entryTime, 0\.08, 0\.92\)/);
  assert.match(universe, /const convergence = ease\(entryTime, 0\.7, 2\.15\)/);
  assert.match(universe, /const burst = ease\(entryTime, 3\.68, 4\.58\)/);
  assert.match(universe, /const focusLock = phase === "enter" && !reduced/);
  assert.match(universe, /const focusSeal = phase === "enter" && !reduced/);
  assert.match(universe, /const hardFocus = phase === "enter" && !reduced && entryTime >= 2\.72 && entryTime < 3\.68/);
  assert.match(universe, /const focusHandoff = phase === "enter" && !reduced/);
  assert.match(universe, /\* \(1 - focusHandoff\)/);
  assert.match(universe, /if \(hardFocus\) \{/);
  assert.match(universe, /positions\[n\] = FOCUS_POINT\[0\]/);
  assert.match(universe, /velocity\[n\] = 0/);
  assert.match(universe, /const passage = ease\(entry, 3\.92, 6\.18\)/);
  assert.match(universe, /FOCUS_POINT\[2\] \+ 2\.65/);
  assert.match(universe, /focusLock \* 18/);
  assert.match(universe, /focusLock \* 15/);
  assert.match(universe, /const burstRadius = burst \* \(4\.5 \+ seed \* 9\.5\)/);
  assert.match(universe, /uPointScale\.value = 1\.08 \+ \(engaged \? 0\.06 : 0\)/);
  assert.doesNotMatch(universe, /uPointScale\.value = 1\.08 \+ energyPulse/);
  assert.match(universe, /data\.sizes\[i\] = data\.baseSizes\[i\] \* 1\.05/);
  assert.match(universe, /function SeedEntryTarget/);
  assert.match(universe, /seedEntryEnabled=\{phase === "idle" && story === "seed"\}/);
  assert.match(universe, /const radius = 2\.2 \+ seeded\(i \+ 197\) \* 5\.8/);
  assert.match(universe, /setStory\("hint"\)/);
  assert.match(universe, /flowsToSeed/);
  assert.match(universe, /uSoftness: \{ value: 0\.58 \}/);
  assert.doesNotMatch(universe, /<OrganicFragments phase=/);
  assert.match(universe, /seamCopper = new THREE\.Color\("#e0ad82"\)/);
  assert.doesNotMatch(universe, /<CoffeeContour phase=/);
  assert.doesNotMatch(universe, /<CoffeeCrease phase=/);
  assert.match(universe, /\[2200, 1450, 560\]/);
  assert.doesNotMatch(universe, /COLLAPSE_POINT/);
  assert.match(effects, /formationFocusLight/);
  assert.match(effects, /57%\{opacity:\.96;transform:scale\(1\)\}/);
  assert.match(effects, /formationFocusDot/);
  assert.match(page, /formation-focus-dot/);
  assert.match(effects, /\.phase-chapter\{background:#050504/);
  assert.doesNotMatch(effects, /formationCoreFlash/);
  assert.match(chapter, /<lineSegments ref=\{lines\}/);
  assert.match(chapter, /FORMATION_VERTEX_SHADER/);
  assert.match(chapter, /FORMATION_FRAGMENT_SHADER/);
  assert.match(chapter, /const count = reduced \? 220 : 1450/);
  assert.match(chapter, /const copper = new THREE\.Color\("#b47650"\)/);
  assert.match(chapter, /const seamCopper = new THREE\.Color\("#e0ad82"\)/);
  assert.match(chapter, /attach="attributes-aSize"/);
  assert.match(chapter, /attach="attributes-aAlpha"/);
  assert.match(chapter, /attach="attributes-aColor"/);
  assert.doesNotMatch(chapter, /<pointsMaterial ref=\{pointMaterial\}/);
  assert.doesNotMatch(chapter, /const green = new THREE\.Color/);
  assert.match(chapter, /PHÂN TÁN/);
  assert.match(chapter, /HỘI TỤ/);
  assert.match(chapter, /LIÊN KẾT/);
  assert.match(chapter, /positions\.set\(\[sx, sy, sz\], n\)/);
  assert.doesNotMatch(chapter, /const multiply = reduced \? 1/);
  assert.match(chapter, /const fruitScale = 1 \+ \.075/);
  assert.match(chapter, /const previewFormation = reduced \? 0/);
  assert.match(chapter, /previewFormation \* \.21/);
  assert.doesNotMatch(chapter, /ref=\{origin\}/);
  assert.match(chapter, /reduced \? 120 : 6300/);
  assert.match(chapter, /new THREE\.SphereGeometry\(1, 128, 96\)/);
  assert.match(chapter, /x \* 2\.06 \* radial/);
  assert.match(chapter, /y \* 2\.2/);
  assert.match(chapter, /skin: \[1\.54, 1\.39, 1\.42\]/);
  assert.match(chapter, /mucilage: \[1\.32, 1\.18, 1\.22\]/);
  assert.match(chapter, /explodedY: -3\.72/);
  assert.match(chapter, /explodedY: 3\.35/);
  assert.match(chapter, /const targetScale = exploded \? \.75 : 1/);
  assert.match(chapter, /greenSeedGeometry/);
  assert.match(chapter, /const flattenedX/);
  assert.match(chapter, /seedGrooves/);
  assert.match(chapter, /longitudinalCurve/);
  assert.match(chapter, /side \* Math\.PI \* \.5/);
  assert.match(chapter, /selectedBean \? \.88 : \.34/);
  assert.match(chapter, /targetQuaternion/);
  assert.match(chapter, /root\.current\.quaternion\.slerp/);
  assert.match(chapter, /premultiply\(dragQuaternion\)\.normalize\(\)/);
  assert.match(chapter, /if \(!drag\.current\.active\) return/);
  assert.match(chapter, /<planeGeometry args=\{\[20, 14\]\}/);
  assert.match(chapter, /KÉO TỰ DO THEO MỌI HƯỚNG/);
  assert.match(chapter, /HAI HẠT ĐANG MỞ MẶT RÃNH/);
  assert.doesNotMatch(chapter, /beanLobeGeometry/);
  assert.doesNotMatch(chapter, /const isCup/);
  assert.match(chapter, /onPointerCancel=\{endDrag\}/);
  assert.match(chapter, /<fog attach="fog" args=\{\["#050504", 9, 19\]\}/);
  assert.doesNotMatch(chapterEffects, /repeating-linear-gradient/);
  assert.match(chapterEffects, /\.anatomy-canvas\{position:absolute;z-index:2;inset:0\}/);
  assert.match(chapterEffects, /linear-gradient\(180deg,#050504 0%,#070604 52%,#040403 100%\)/);
  assert.match(page, /reduced \? 1300 : 6400/);
  assert.match(page, /onEnter=\{enter\}/);
  assert.match(page, /window\.addEventListener\("wheel", onWheel/);
  assert.match(page, /window\.addEventListener\("touchend", onTouchEnd/);
  assert.match(page, /\["ArrowDown", "PageDown"\]/);
  assert.match(page, /chapter-scroll-guide/);
  assert.match(page, /CUỘN ĐỂ/);
  assert.match(effects, /\.chapter-scroll-guide/);
});

test("uses a contemporary editorial system for the public Crema Lab site", async () => {
  const [site, styles] = await Promise.all([
    readFile(new URL("../app/PublicSite.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/public-site.css", import.meta.url), "utf8"),
  ]);
  assert.match(site, /intro-statement/);
  assert.match(site, /system-strip/);
  assert.match(site, /footer-statement/);
  assert.match(styles, /\.intro-statement\{/);
  assert.match(styles, /\.course-stack-card\{position:sticky/);
  assert.match(styles, /course-stack-visual/);
  assert.match(styles, /\.system-strip/);
  assert.match(styles, /\.instructor-panel\{/);
});

test("keeps the finished site free of starter preview artifacts", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /PublicSite/);
  assert.match(layout, /Crema Lab — The Unseen World of Coffee/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.deepEqual(await readdir(new URL("app\/_sites-preview", templateRoot)), []);
});

test("connects the origin experience to processing and advanced roasting chapters", async () => {
  const [page, chapterOne, chapterTwo, chapterThree, chapterStyles, roastTurntable] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ChapterOne.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ChapterTwo.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ChapterThree.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/experience-chapters.css", import.meta.url), "utf8"),
    stat(new URL("../public/images/roast-bean-turntable-v2.png", import.meta.url)),
  ]);

  assert.match(page, /experienceChapter/);
  assert.match(page, /setExperienceChapter\(2\)/);
  assert.match(page, /setExperienceChapter\(3\)/);
  assert.match(page, /<ChapterTwo/);
  assert.match(page, /<ChapterThree/);
  assert.match(chapterOne, /Chương 02 · Sơ chế/);

  assert.match(chapterTwo, /CHƯƠNG 02/);
  assert.match(chapterTwo, /MỘT QUẢ/);
  assert.match(chapterTwo, /Sơ chế khô/);
  assert.match(chapterTwo, /Sơ chế mật ong/);
  assert.match(chapterTwo, /Sơ chế ướt/);
  assert.match(chapterTwo, /KÉO MÔ HÌNH ĐỂ XOAY/);
  assert.match(chapterTwo, /CHƯƠNG 03 · RANG/);
  assert.match(chapterTwo, /threeGeometry|cherryGeometry/);

  assert.match(chapterThree, /CHƯƠNG 03/);
  assert.match(chapterThree, /ĐIỀU KHIỂN/);
  assert.match(chapterThree, /Làm rõ nguồn gốc/);
  assert.match(chapterThree, /Pha phin/);
  assert.match(chapterThree, /Tối ưu espresso/);
  assert.match(chapterThree, /Nhân xanh/);
  assert.match(chapterThree, /Mất nước/);
  assert.match(chapterThree, /Yellow/);
  assert.match(chapterThree, /Cinnamon/);
  assert.match(chapterThree, /Nạp hạt/);
  assert.match(chapterThree, /Nổ lần một/);
  assert.match(chapterThree, /Nổ lần hai/);
  assert.match(chapterThree, /Quá rang · bóng dầu/);
  assert.match(chapterThree, /Phát triển/);
  assert.match(chapterThree, /Xả & làm nguội/);
  assert.match(chapterThree, /Maillard/);
  assert.match(chapterThree, /RoR/);
  assert.match(chapterThree, /RoastCurve/);
  assert.match(chapterThree, /Arabica/);
  assert.match(chapterThree, /Robusta/);
  assert.match(chapterThree, /Coffea canephora/);
  assert.match(chapterThree, /profilePoints\(current, species\)/);
  assert.match(chapterThree, /species === "robusta" && profile\.id === "phin"\) return 45/);
  assert.match(chapterThree, /profile\.id === "espresso"\) return 55/);
  assert.match(chapterThree, /Agtron 45 · khoảng 40–50/);
  assert.match(chapterThree, /const MAX_TIME = 15/);
  assert.match(chapterThree, /const MAX_TEMP = 245/);
  assert.match(chapterThree, /progress: 140, time: 900, temp: MAX_TEMP, color: "#120705", agtron: 15/);
  assert.match(chapterThree, /roast-bean-control/);
  assert.match(chapterThree, /PhotographicRoastBean/);
  assert.match(chapterThree, /const ROAST_TURNTABLE_PAUSED = true/);
  assert.match(chapterThree, /if \(ROAST_TURNTABLE_PAUSED\)/);
  assert.match(chapterThree, /stageTurnForProgress/);
  assert.match(chapterThree, /Math\.PI \* 2/);
  assert.match(chapterThree, /Math\.max\(-elapsed \* 1\.15, Math\.min\(elapsed \* 1\.15, difference\)\)/);
  assert.match(chapterThree, /const exactFrame = phase \* 12/);
  assert.match(chapterThree, /const blendWindow = Math\.max/);
  assert.match(chapterThree, /--sprite-x-a/);
  assert.match(chapterThree, /--sprite-x-b/);
  assert.match(chapterThree, /--photo-blend/);
  assert.match(chapterThree, /roast-photo-source/);
  assert.match(chapterThree, /HEAT_PARTICLES/);
  assert.match(chapterThree, /roast-heat-field/);
  assert.match(chapterThree, /roast-profile-picker/);
  assert.match(chapterThree, /<select/);
  assert.match(chapterThree, /type="range"/);
  assert.match(chapterThree, /Nhiệt độ BT/);
  assert.match(chapterThree, /Mã màu/);
  assert.doesNotMatch(chapterThree, /roast-profile-beans-v1\.png/);
  assert.doesNotMatch(chapterThree, /roast-bean-crack/);
  assert.doesNotMatch(chapterThree, /roast-bean-caption/);
  assert.doesNotMatch(chapterThree, /lab-selector roast-selector/);
  assert.doesNotMatch(chapterThree, /roast-stage-selector/);
  assert.doesNotMatch(chapterThree, /roast-bean-hires-v2\.png/);
  assert.doesNotMatch(chapterThree, /roast-stages-green-to-development-v1\.png/);
  assert.doesNotMatch(chapterThree, /@react-three\/fiber|new THREE\./);
  assert.ok(roastTurntable.size > 1_000_000);

  assert.match(chapterStyles, /\.processing-chapter/);
  assert.match(chapterStyles, /\.roasting-chapter/);
  assert.doesNotMatch(chapterStyles, /\.roast-stage-selector/);
  assert.match(chapterStyles, /\.roast-console/);
  assert.match(chapterStyles, /\.roast-profile-picker/);
  assert.match(chapterStyles, /\.roast-control-row input/);
  assert.match(chapterStyles, /\.roast-chart/);
  assert.match(chapterStyles, /width:430px;height:530px/);
  assert.match(chapterStyles, /left:auto;\s*right:5\.55vw/);
  assert.match(chapterStyles, /\.roast-photo-frame/);
  assert.match(chapterStyles, /\.roast-photo-angle-a/);
  assert.match(chapterStyles, /\.roast-photo-angle-b/);
  assert.match(chapterStyles, /roast-bean-turntable-v2\.png/);
  assert.match(chapterStyles, /\.roast-photo-frame\.is-paused/);
  assert.match(chapterStyles, /roast-bean-hires-v2\.png/);
  assert.match(chapterStyles, /background-size:400% 300%/);
  assert.match(chapterStyles, /@keyframes roastHeatOrbit/);
  assert.doesNotMatch(chapterStyles, /\.roast-bean-spin/);
  assert.doesNotMatch(chapterStyles, /\.roast-bean-oil/);
  assert.doesNotMatch(chapterStyles, /mask:url/);
  assert.doesNotMatch(chapterStyles, /\.roast-bean-crack/);
  assert.match(chapterStyles, /\.motion-reduced \.lab-chapter/);
});
