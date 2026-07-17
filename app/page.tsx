"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ParticleUniverse from "./ParticleUniverse";
import ChapterOne from "./ChapterOne";
import ChapterTwo from "./ChapterTwo";
import ChapterThree from "./ChapterThree";
import PublicSite from "./PublicSite";
import "./page01.css";
import "./chapter-one.css";
import "./experience-chapters.css";

type Phase = "idle" | "enter" | "explore" | "chapter";

export default function Home() {
  const [reduced, setReduced] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [interfaceReady, setInterfaceReady] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [experienceChapter, setExperienceChapter] = useState<1 | 2 | 3>(1);
  const transitionTimer = useRef<number | null>(null);
  const scrollGate = useRef(false);
  const touchOrigin = useRef<number | null>(null);

  useEffect(() => {
    setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches || localStorage.getItem("crema-reduced-motion") === "true");
    return () => { if (transitionTimer.current) window.clearTimeout(transitionTimer.current); };
  }, []);

  const enter = useCallback(() => {
    if (!interfaceReady || phase === "enter" || phase === "chapter") return;
    setEngaged(true);
    setExperienceChapter(1);
    setPhase("enter");
    transitionTimer.current = window.setTimeout(() => setPhase("chapter"), reduced ? 1300 : 6400);
  }, [interfaceReady, phase, reduced]);
  const explore = useCallback(() => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setEngaged(false);
    setPhase("explore");
    window.requestAnimationFrame(() => document.getElementById("website")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }));
  }, [reduced]);
  const restart = useCallback(() => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    setEngaged(false);
    setInterfaceReady(false);
    setExperienceChapter(1);
    setPhase("idle");
    window.requestAnimationFrame(() => document.getElementById("hero")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }));
  }, [reduced]);
  const toggleMotion = () => setReduced(current => {
    localStorage.setItem("crema-reduced-motion", String(!current));
    return !current;
  });

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest("input, select, textarea, [role='slider']"));
    const move = (direction: 1 | -1) => {
      if (scrollGate.current) return;
      if (phase === "idle") {
        if (direction === 1 && interfaceReady) enter();
        return;
      }
      if (phase !== "chapter") return;
      scrollGate.current = true;
      window.setTimeout(() => { scrollGate.current = false; }, reduced ? 280 : 900);
      if (direction === 1) {
        if (experienceChapter < 3) setExperienceChapter((experienceChapter + 1) as 1 | 2 | 3);
        else explore();
      } else if (experienceChapter > 1) {
        setExperienceChapter((experienceChapter - 1) as 1 | 2 | 3);
      } else {
        restart();
      }
    };
    const onWheel = (event: WheelEvent) => {
      if ((phase !== "idle" && phase !== "chapter") || isEditableTarget(event.target) || Math.abs(event.deltaY) < 16) return;
      event.preventDefault();
      move(event.deltaY > 0 ? 1 : -1);
    };
    const onTouchStart = (event: TouchEvent) => {
      if (isEditableTarget(event.target)) return;
      touchOrigin.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (touchOrigin.current === null) return;
      const distance = touchOrigin.current - (event.changedTouches[0]?.clientY ?? touchOrigin.current);
      touchOrigin.current = null;
      if (Math.abs(distance) > 42) move(distance > 0 ? 1 : -1);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (["ArrowDown", "PageDown"].includes(event.key)) {
        event.preventDefault();
        move(1);
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        move(-1);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enter, experienceChapter, explore, interfaceReady, phase, reduced, restart]);

  return <main className="crema-site">
    <div className={`living-hero phase-${phase} ${interfaceReady ? "interface-ready" : "interface-pending"} ${reduced ? "motion-reduced" : ""}`}>
      <a className="experience-skip" href="#website" onClick={explore}>Đi thẳng đến website Crema Lab</a>
      <header className="living-header">
        <a className="living-wordmark" href="#hero" aria-label="Crema Lab home" onClick={restart} tabIndex={interfaceReady ? 0 : -1}>CREMA <b>LAB</b></a>
      </header>

      <section className="living-scene" id="hero">
        <ParticleUniverse phase={phase} reduced={reduced} engaged={engaged} onInterfaceReady={setInterfaceReady} onEnter={enter} />
        <div className="formation-focus-dot" aria-hidden="true" />
        <div className="formation-flash" aria-hidden="true" />
        <div className="living-copy">
          <h1>BƯỚC VÀO THẾ GIỚI VÔ HÌNH</h1>
          <p className="living-principle">Nơi hương vị bắt đầu thành hình.</p>
          <div className="living-actions">
            <button
              className="living-primary"
              onPointerEnter={() => setEngaged(true)}
              onPointerLeave={() => setEngaged(false)}
              onFocus={() => setEngaged(true)}
              onBlur={() => setEngaged(false)}
              disabled={phase === "enter" || phase === "chapter"}
              aria-busy={phase === "enter"}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  enter();
                }
              }}
              onClick={enter}
              tabIndex={interfaceReady ? 0 : -1}
            >Bắt đầu trải nghiệm <span>↗</span></button>
            <a className="living-secondary" href="#website" onClick={explore} tabIndex={interfaceReady ? 0 : -1}>Khám phá Crema Lab <span>→</span></a>
          </div>
        </div>

        <button className="motion-control" onClick={toggleMotion} aria-pressed={reduced} tabIndex={interfaceReady ? 0 : -1}>Chuyển động <span>{reduced ? "Giảm" : "Bật"}</span></button>

        <div className={`chapter-scroll-guide ${phase === "chapter" ? "is-visible" : ""}`} aria-live="polite">
          <span className="scroll-guide-count">0{experienceChapter} / 03</span>
          <span className="scroll-guide-line" aria-hidden="true"><i style={{ width: `${experienceChapter / 3 * 100}%` }} /></span>
          <span className="scroll-guide-label">CUỘN ĐỂ {experienceChapter === 3 ? "KHÁM PHÁ CREMA LAB" : "TIẾP TỤC"}</span>
        </div>

        <ChapterOne
          active={phase === "chapter" && experienceChapter === 1}
          reduced={reduced}
          onExplore={explore}
          onNext={() => setExperienceChapter(2)}
        />
        <ChapterTwo
          active={phase === "chapter" && experienceChapter === 2}
          reduced={reduced}
          onExplore={explore}
          onBack={() => setExperienceChapter(1)}
          onNext={() => setExperienceChapter(3)}
        />
        <ChapterThree
          active={phase === "chapter" && experienceChapter === 3}
          reduced={reduced}
          onExplore={explore}
          onBack={() => setExperienceChapter(2)}
        />
      </section>
    </div>

    <PublicSite onExperience={restart} />
  </main>;
}
