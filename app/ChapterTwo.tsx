"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type ProcessId = "natural" | "honey" | "washed";

type Process = {
  id: ProcessId;
  number: string;
  name: string;
  english: string;
  statement: string;
  water: string;
  mucilage: string;
  control: string;
  tendency: string;
  color: string;
};

const PROCESSES: Process[] = [
  {
    id: "natural",
    number: "01",
    name: "Sơ chế khô",
    english: "Natural",
    statement: "Quả chín được phơi nguyên vẹn. Hạt tiếp tục tiếp xúc với thịt quả và lớp nhớt trong suốt thời gian làm khô.",
    water: "Thấp",
    mucilage: "Giữ nguyên",
    control: "Độ chín · độ dày lớp phơi · đảo đều",
    tendency: "Trái cây chín · độ ngọt cao · thể chất đầy",
    color: "#a84932",
  },
  {
    id: "honey",
    number: "02",
    name: "Sơ chế mật ong",
    english: "Honey",
    statement: "Vỏ và phần thịt được tách, nhưng một phần lớp nhớt giàu đường vẫn bao quanh hạt trong quá trình phơi.",
    water: "Trung bình",
    mucilage: "Giữ một phần",
    control: "Lượng nhớt · tốc độ khô · thông gió",
    tendency: "Ngọt tròn · cân bằng · cấu trúc mềm",
    color: "#d29a56",
  },
  {
    id: "washed",
    number: "03",
    name: "Sơ chế ướt",
    english: "Washed",
    statement: "Thịt quả và lớp nhớt được loại bỏ có kiểm soát trước khi hạt còn vỏ trấu bước vào giai đoạn làm khô.",
    water: "Cao",
    mucilage: "Loại bỏ",
    control: "Lên men · chất lượng nước · thời gian rửa",
    tendency: "Sạch · sáng · làm rõ đặc tính vùng trồng",
    color: "#9cb9ad",
  },
];

function cherryGeometry() {
  const geometry = new THREE.SphereGeometry(1, 96, 72);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let index = 0; index < position.count; index++) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const topDimple = Math.exp(-Math.pow((y - .83) * 5.2, 2)) * .08;
    const organic = 1 + Math.sin(y * 7.1 + z * 2.3) * .012 + Math.cos(x * 8.2 - y) * .008;
    position.setXYZ(
      index,
      x * 1.48 * organic,
      y * 1.42 - topDimple,
      z * 1.46 * organic,
    );
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function greenBeanGeometry() {
  const geometry = new THREE.SphereGeometry(1, 88, 64);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let index = 0; index < position.count; index++) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const face = 1 - Math.exp(-Math.pow(z * 3.4, 2)) * .2;
    const waist = 1 - Math.exp(-Math.pow(y * 2.8, 2)) * .045;
    position.setXYZ(index, x * .68 * waist, y * 1.04, z * .43 * face);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function ProcessingDust({ process, reduced }: { process: ProcessId; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = reduced ? 70 : 190;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399 + (i % 7) * .12;
      const radius = 2.1 + ((i * 37) % 100) / 100 * 3.9;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (((i * 61) % 100) / 100 - .5) * 6;
      positions[i * 3 + 2] = Math.sin(angle) * radius - 1.4;
    }
    const value = new THREE.BufferGeometry();
    value.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return value;
  }, [reduced]);

  useFrame((state, delta) => {
    if (!ref.current || reduced) return;
    ref.current.rotation.y += delta * (process === "washed" ? .035 : .018);
    ref.current.position.y = Math.sin(state.clock.elapsedTime * .24) * .05;
  });

  return <points ref={ref} geometry={geometry}>
    <pointsMaterial
      color={process === "washed" ? "#b7d0c6" : process === "honey" ? "#d8a363" : "#9e563c"}
      size={process === "washed" ? .026 : .022}
      opacity={.28}
      transparent
      depthWrite={false}
      sizeAttenuation
    />
  </points>;
}

function ProcessingObject({ process, reduced }: { process: ProcessId; reduced: boolean }) {
  const root = useRef<THREE.Group>(null);
  const skin = useRef<THREE.MeshStandardMaterial>(null);
  const pulp = useRef<THREE.MeshPhysicalMaterial>(null);
  const mucilage = useRef<THREE.MeshPhysicalMaterial>(null);
  const parchment = useRef<THREE.MeshStandardMaterial>(null);
  const seedMaterials = useRef<THREE.MeshStandardMaterial[]>([]);
  const skinGroup = useRef<THREE.Group>(null);
  const mucilageGroup = useRef<THREE.Group>(null);
  const drag = useRef({ active: false, x: 0, y: 0 });
  const targetRotation = useRef(new THREE.Vector2(-.08, -.32));
  const cherry = useMemo(cherryGeometry, []);
  const seed = useMemo(greenBeanGeometry, []);

  useEffect(() => () => {
    cherry.dispose();
    seed.dispose();
  }, [cherry, seed]);

  useFrame((state, delta) => {
    if (!root.current) return;
    const speed = 1 - Math.pow(.001, delta);
    if (!reduced && !drag.current.active) targetRotation.current.y += delta * .055;
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, targetRotation.current.x, speed * .42);
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, targetRotation.current.y, speed * .42);
    root.current.position.y = reduced ? 0 : Math.sin(state.clock.elapsedTime * .55) * .045;

    const targets = process === "natural"
      ? { skin: .98, pulp: .7, mucilage: .13, parchment: .08, seed: .06, shell: 1, gel: 1 }
      : process === "honey"
        ? { skin: .1, pulp: .09, mucilage: .72, parchment: .38, seed: .84, shell: 1.1, gel: 1.015 }
        : { skin: .025, pulp: .025, mucilage: .05, parchment: .76, seed: .98, shell: 1.16, gel: 1.08 };

    if (skin.current) skin.current.opacity = THREE.MathUtils.lerp(skin.current.opacity, targets.skin, speed * .7);
    if (pulp.current) pulp.current.opacity = THREE.MathUtils.lerp(pulp.current.opacity, targets.pulp, speed * .7);
    if (mucilage.current) mucilage.current.opacity = THREE.MathUtils.lerp(mucilage.current.opacity, targets.mucilage, speed * .7);
    if (parchment.current) parchment.current.opacity = THREE.MathUtils.lerp(parchment.current.opacity, targets.parchment, speed * .7);
    seedMaterials.current.forEach(material => {
      if (material) material.opacity = THREE.MathUtils.lerp(material.opacity, targets.seed, speed * .7);
    });
    if (skinGroup.current) {
      const current = skinGroup.current.scale.x;
      const next = THREE.MathUtils.lerp(current, targets.shell, speed * .5);
      skinGroup.current.scale.setScalar(next);
    }
    if (mucilageGroup.current) {
      const current = mucilageGroup.current.scale.x;
      const next = THREE.MathUtils.lerp(current, targets.gel, speed * .5);
      mucilageGroup.current.scale.setScalar(next);
    }
  });

  const startDrag = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    drag.current = { active: true, x: event.clientX, y: event.clientY };
    const target = event.target as unknown as { setPointerCapture?: (pointerId: number) => void };
    target.setPointerCapture?.(event.pointerId);
  };
  const moveDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    targetRotation.current.y += dx * .007;
    targetRotation.current.x = THREE.MathUtils.clamp(targetRotation.current.x + dy * .005, -.72, .72);
    drag.current = { active: true, x: event.clientX, y: event.clientY };
  };
  const endDrag = (event: ThreeEvent<PointerEvent>) => {
    drag.current.active = false;
    const target = event.target as unknown as { releasePointerCapture?: (pointerId: number) => void };
    target.releasePointerCapture?.(event.pointerId);
  };

  return <group
    ref={root}
    position={[.42, .08, 0]}
    rotation={[-.08, -.32, -.04]}
    onPointerDown={startDrag}
    onPointerMove={moveDrag}
    onPointerUp={endDrag}
    onPointerCancel={endDrag}
  >
    <group ref={skinGroup}>
      <mesh geometry={cherry} castShadow receiveShadow>
        <meshStandardMaterial ref={skin} color="#8e2023" roughness={.36} metalness={.02} transparent opacity={.98} depthWrite={false} />
      </mesh>
      <mesh geometry={cherry} scale={.934}>
        <meshPhysicalMaterial ref={pulp} color="#d75d43" roughness={.48} transmission={.05} thickness={.5} transparent opacity={.7} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.47, 0]} rotation={[0, 0, -.08]} castShadow>
        <cylinderGeometry args={[.075, .12, .38, 16]} />
        <meshStandardMaterial color="#445934" roughness={.72} />
      </mesh>
    </group>

    <group ref={mucilageGroup}>
      <mesh scale={[.75, 1.05, .58]}>
        <sphereGeometry args={[1, 72, 54]} />
        <meshPhysicalMaterial ref={mucilage} color="#dca75d" roughness={.16} transmission={.64} thickness={.8} transparent opacity={.13} depthWrite={false} />
      </mesh>
    </group>

    <mesh scale={[.71, 1, .54]}>
      <sphereGeometry args={[1, 72, 54]} />
      <meshStandardMaterial ref={parchment} color="#c2aa7b" roughness={.72} transparent opacity={.08} depthWrite={false} />
    </mesh>

    {[-1, 1].map((side, index) => <group key={side} position={[side * .37, -.01, side * .04]} rotation={[.05, side * .15, side * -.035]}>
      <mesh geometry={seed} castShadow>
        <meshStandardMaterial
          ref={material => { if (material) seedMaterials.current[index] = material; }}
          color="#87945e"
          roughness={.64}
          transparent
          opacity={.06}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[side * -.015, 0, .43]} rotation={[0, 0, side * .05]}>
        <tubeGeometry args={[new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, -.72, 0),
          new THREE.Vector3(side * .06, -.26, .035),
          new THREE.Vector3(side * -.04, .18, .02),
          new THREE.Vector3(side * .03, .7, 0),
        ]), 28, .018, 7, false]} />
        <meshStandardMaterial color="#5f6744" roughness={.82} transparent opacity={.72} />
      </mesh>
    </group>)}
  </group>;
}

function ProcessingWorld({ process, reduced }: { process: ProcessId; reduced: boolean }) {
  return <>
    <color attach="background" args={["#050504"]} />
    <fog attach="fog" args={["#050504", 8, 18]} />
    <ambientLight intensity={.35} color="#7b8770" />
    <directionalLight position={[-4, 6, 6]} intensity={2.15} color="#ffd3aa" castShadow />
    <pointLight position={[3.2, -.4, 3]} intensity={process === "washed" ? 1.4 : 1.05} color={process === "washed" ? "#c9e8dc" : "#d8864e"} distance={9} />
    <ProcessingDust process={process} reduced={reduced} />
    <ProcessingObject process={process} reduced={reduced} />
    <mesh position={[.4, -2.1, -1.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[2.6, 64]} />
      <shadowMaterial opacity={.3} transparent />
    </mesh>
  </>;
}

export default function ChapterTwo({
  active,
  reduced,
  onExplore,
  onBack,
  onNext,
}: {
  active: boolean;
  reduced: boolean;
  onExplore: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [process, setProcess] = useState<ProcessId>("natural");
  const current = PROCESSES.find(item => item.id === process) ?? PROCESSES[0];

  useEffect(() => {
    if (active) setProcess("natural");
  }, [active]);

  return <section className={`lab-chapter processing-chapter ${active ? "is-active" : ""}`} aria-hidden={!active} aria-label="Chương 02 - Sơ chế cà phê">
    <div className="lab-topbar">
      <span>CREMA LAB</span>
      <p>CHƯƠNG 02 <b>—</b> SƠ CHẾ</p>
      <div>
        <button onClick={onBack} tabIndex={active ? 0 : -1}>← Chương 01</button>
        <button onClick={onExplore} tabIndex={active ? 0 : -1}>Khám phá Crema Lab ↗</button>
      </div>
    </div>

    <div className="lab-canvas" aria-hidden="true">
      {active && <Canvas shadows camera={{ position: [0, 0, 8.7], fov: 38, near: .1, far: 24 }} dpr={[1, 1.35]} gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}>
        <ProcessingWorld process={process} reduced={reduced} />
      </Canvas>}
    </div>

    <div className="lab-copy">
      <p className="lab-eyebrow">SAU CẤU TRÚC LÀ CAN THIỆP</p>
      <h2>MỘT QUẢ.<br />BA CON ĐƯỜNG.</h2>
      <p>{current.statement}</p>
      <small>KÉO MÔ HÌNH ĐỂ XOAY · CHỌN MỘT PHƯƠNG PHÁP</small>
    </div>

    <aside className="lab-data" aria-live="polite">
      <span>{current.number}</span>
      <p>{current.english}</p>
      <h3>{current.name}</h3>
      <dl>
        <div><dt>Nước sử dụng</dt><dd>{current.water}</dd></div>
        <div><dt>Lớp nhớt</dt><dd>{current.mucilage}</dd></div>
        <div><dt>Biến số kiểm soát</dt><dd>{current.control}</dd></div>
        <div><dt>Xu hướng cảm quan</dt><dd>{current.tendency}</dd></div>
      </dl>
      <em>Hương vị còn phụ thuộc giống, vùng trồng, độ chín, lên men và kỹ thuật làm khô.</em>
    </aside>

    <nav className="lab-selector" aria-label="Ba phương pháp sơ chế cà phê">
      {PROCESSES.map(item => <button
        key={item.id}
        className={process === item.id ? "is-current" : ""}
        style={{ "--method-color": item.color } as React.CSSProperties}
        onClick={() => setProcess(item.id)}
        aria-pressed={process === item.id}
        tabIndex={active ? 0 : -1}
      >
        <span>{item.number}</span>
        <b>{item.name}</b>
        <small>{item.english}</small>
      </button>)}
      <button className="lab-next" onClick={onNext} tabIndex={active ? 0 : -1}>
        <span>TIẾP THEO</span><b>CHƯƠNG 03 · RANG</b><small>Hạt gặp nhiệt →</small>
      </button>
    </nav>
  </section>;
}
