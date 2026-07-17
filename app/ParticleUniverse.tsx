"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Phase = "idle" | "enter" | "explore" | "chapter";
type Tier = "high" | "mid" | "low";
type Vec3 = [number, number, number];

type MatterBuffers = {
  positions: Float32Array;
  velocity: Float32Array;
  scatter: Float32Array;
  bean: Float32Array;
  sizes: Float32Array;
  baseSizes: Float32Array;
  alphas: Float32Array;
  baseAlphas: Float32Array;
  colors: Float32Array;
  seeds: Float32Array;
  staysAmbient: Uint8Array;
  flowsToSeed: Uint8Array;
};

const BEAN_CENTER: Vec3 = [0, 0.28, -1.15];
const FOCUS_PARTICLE = 37;
const FOCUS_POINT: Vec3 = [0.08, 0.24, -0.62];

const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  varying float vAlpha;
  varying vec3 vColor;
  uniform float uPixelRatio;
  uniform float uPointScale;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float depth = max(0.8, -mvPosition.z);
    float farFade = 1.0 - smoothstep(13.0, 25.0, depth);
    float nearFade = smoothstep(0.8, 2.4, depth);
    vAlpha = aAlpha * farFade * nearFade;
    vColor = aColor;
    gl_PointSize = clamp(aSize * uPointScale * uPixelRatio * (42.0 / depth), 0.5, 8.5);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  uniform float uOpacity;
  uniform float uSoftness;

  void main() {
    vec2 point = gl_PointCoord - vec2(0.5);
    float distanceToCenter = length(point) * 2.0;
    float softParticle = 1.0 - smoothstep(uSoftness, 1.0, distanceToCenter);
    if (softParticle < 0.015) discard;
    gl_FragColor = vec4(vColor, vAlpha * uOpacity * softParticle);
  }
`;

const seeded = (n: number) => {
  const x = Math.sin(n * 127.117 + 41.73) * 43758.5453123;
  return x - Math.floor(x);
};

const countFor = (tier: Tier, counts: [number, number, number]) =>
  tier === "high" ? counts[0] : tier === "mid" ? counts[1] : counts[2];

const damp = (lambda: number, dt: number) => 1 - Math.exp(-lambda * dt);
const ease = (value: number, start: number, end: number) =>
  THREE.MathUtils.smoothstep(value, start, end);
const seedTaper = (yUnit: number) =>
  Math.sqrt(Math.max(0.012, 1 - Math.pow(Math.abs(yUnit), 2.35)));

function rotateSeed(x: number, y: number, z: number): Vec3 {
  const tilt = -0.045;
  const cosine = Math.cos(tilt);
  const sine = Math.sin(tilt);
  return [
    BEAN_CENTER[0] + x * cosine - y * sine,
    BEAN_CENTER[1] + x * sine + y * cosine,
    BEAN_CENTER[2] + z,
  ];
}

/**
 * A tactile coffee-seed volume: a thick asymmetric shell, a recessed curved
 * crease and a small amount of cellular matter inside. It is intentionally
 * neither spherical nor radially symmetric.
 */
function coffeeSeedTarget(index: number, salt = 0): Vec3 {
  const role = (index + salt) % 100;
  const yUnit = seeded(index + salt + 13) * 2 - 1;
  const y = yUnit * 1.94;
  const taper = seedTaper(yUnit);

  if (role < 5) {
    const seamY = y;
    const seamX = Math.sin(seamY * 1.85) * 0.055 + Math.sin(seamY * 0.63) * 0.026;
    const side = seeded(index + salt + 29) > 0.5 ? -1 : 1;
    const seamDepth = 0.72 * taper - 0.025 - seeded(index + salt + 31) * 0.12;
    return rotateSeed(
      seamX + side * (0.055 + seeded(index + salt + 47) * 0.12) + (seeded(index + salt + 53) - 0.5) * 0.035,
      seamY + (seeded(index + salt + 57) - 0.5) * 0.11,
      seamDepth,
    );
  }

  const angle = seeded(index + salt + 61) * Math.PI * 2;
  const isInterior = role >= 86;
  const radial = isInterior
    ? Math.pow(seeded(index + salt + 73), 0.44) * 0.9
    : 0.88 + seeded(index + salt + 89) * 0.115;
  const side = (index + salt) % 2 === 0 ? -1 : 1;
  const lobeCenter = side * (0.56 * taper + Math.sin(y * 1.1 + side) * 0.032 * taper) + (side > 0 ? 0.025 * taper : 0);
  const lobeWidth = (side < 0 ? 0.69 : 0.73) * taper * (1 + yUnit * side * 0.035);
  const depth = (side < 0 ? 0.69 : 0.75) * taper;
  let x = lobeCenter + Math.cos(angle) * lobeWidth * radial;
  let z = Math.sin(angle) * depth * radial;

  // The two unequal lobes follow the photographed bean. The central channel
  // remains narrow and textured instead of becoming a heavy black cutout.
  const seam = Math.sin(y * 1.85) * 0.055 + Math.sin(y * 0.63) * 0.026;
  const innerEdge = seam + side * (0.035 + taper * 0.145);
  x = side < 0 ? Math.min(x, innerEdge) : Math.max(x, innerEdge);
  const creaseInfluence = Math.exp(-Math.pow((x - seam) / Math.max(0.16, taper * 0.23), 2));
  if (z > 0) z -= creaseInfluence * 0.13 * taper;
  x += Math.sin(y * 0.78) * 0.025 + (z / Math.max(depth, 0.1)) * 0.025;
  z += (seeded(index + salt + 101) - 0.5) * 0.055;
  return rotateSeed(x, y, z);
}

function makeMatter(count: number): MatterBuffers {
  const positions = new Float32Array(count * 3);
  const velocity = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const bean = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const baseSizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const baseAlphas = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const staysAmbient = new Uint8Array(count);
  const flowsToSeed = new Uint8Array(count);
  const copper = new THREE.Color("#b47650");
  const coffee = new THREE.Color("#704735");
  const leftLobe = new THREE.Color("#8b573e");
  const rightLobe = new THREE.Color("#ae6d49");
  const warmHighlight = new THREE.Color("#cf8b59");
  const seamCopper = new THREE.Color("#e0ad82");

  for (let i = 0; i < count; i++) {
    const n = i * 3;
    const seed = seeded(i + 317);
    const foreground = i % 41 === 0;
    const z = foreground ? 2.4 + seeded(i + 23) * 2.1 : -14 + seeded(i + 23) * 16.4;
    const depthSpread = 1 + Math.max(0, -z) * 0.045;
    const x = (-7.2 + seeded(i + 41) * 14.7) * depthSpread;
    const y = (seeded(i + 59) - 0.5) * 8.8 * depthSpread;
    const target = i === FOCUS_PARTICLE ? FOCUS_POINT : coffeeSeedTarget(i);
    bean.set(target, n);
    seeds[i] = seed;
    const ambient = foreground || i % 9 === 0;
    staysAmbient[i] = ambient ? 1 : 0;
    flowsToSeed[i] = ambient && !foreground ? 1 : 0;

    const seamMatter = i % 100 < 5;
    if (ambient) {
      positions.set([x, y, z], n);
      scatter.set([x, y, z], n);
    } else {
      // Begin as a wide, breathable volume. The seed becomes recognizable only
      // after this matter field has had time to occupy the surrounding space.
      const angle = seeded(i + 181) * Math.PI * 2;
      const radius = 2.2 + seeded(i + 197) * 5.8;
      const fieldX = Math.cos(angle) * radius * (0.86 + seeded(i + 211) * .36);
      const fieldY = Math.sin(angle) * radius * .58 + (seeded(i + 223) - .5) * 2.4;
      const fieldZ = -10.5 + seeded(i + 239) * 12.8;
      positions.set([fieldX, fieldY, fieldZ], n);
      scatter.set([fieldX, fieldY, fieldZ], n);
    }
    const highlight = i % 29 === 0;
    const transparentDust = i % 7 === 0;
    const lobeColor = (i % 2 === 0 ? leftLobe : rightLobe).clone().lerp(coffee, seeded(i + 97) * 0.32).lerp(copper, 0.14);
    const color = i === FOCUS_PARTICLE ? seamCopper : seamMatter ? seamCopper : highlight ? warmHighlight : lobeColor;
    colors.set([color.r, color.g, color.b], n);
    sizes[i] = foreground
      ? 1.8 + seeded(i + 131) * 2.5
      : seamMatter
        ? 0.72 + seeded(i + 131) * 0.6
        : 0.76 + seeded(i + 131) * (highlight ? 1.18 : 0.74);
    alphas[i] = foreground
      ? 0.08 + seeded(i + 149) * 0.1
      : seamMatter ? 0.52 : transparentDust ? 0.29 : highlight ? 0.94 : 0.54 + seeded(i + 149) * 0.31;
    if (i === FOCUS_PARTICLE) {
      sizes[i] = 1.42;
      alphas[i] = 1;
    }
    baseSizes[i] = sizes[i];
    baseAlphas[i] = alphas[i];
  }
  return { positions, velocity, scatter, bean, sizes, baseSizes, alphas, baseAlphas, colors, seeds, staysAmbient, flowsToSeed };
}

function MatterField({ phase, tier, reduced, engaged }: {
  phase: Phase;
  tier: Tier;
  reduced: boolean;
  engaged: boolean;
}) {
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const startedAt = useRef<number | null>(null);
  const enteredAt = useRef<number | null>(null);
  const previousPhase = useRef(phase);
  const previousPointer = useRef({ x: 0, y: 0 });
  const cursorVelocity = useRef({ x: 0, y: 0 });
  const { pointer } = useThree();
  const count = countFor(tier, [2200, 1450, 560]);
  const data = useMemo(() => makeMatter(count), [count]);
  const uniforms = useMemo(() => ({
    uPixelRatio: { value: 1 },
    uPointScale: { value: 1.08 },
    uOpacity: { value: 0 },
    uSoftness: { value: 0.58 },
  }), []);

  useFrame(({ clock, gl }, rawDt) => {
    if (!points.current || !material.current) return;
    const dt = Math.min(rawDt, 0.033);
    const now = clock.elapsedTime;
    if (startedAt.current === null) startedAt.current = now;
    if (previousPhase.current !== phase) {
      if (phase === "enter") enteredAt.current = now;
      if (phase === "idle") startedAt.current = now;
      previousPhase.current = phase;
    }
    const sceneTime = now - (startedAt.current ?? now);
    const entryTime = enteredAt.current === null ? 0 : now - enteredAt.current;
    const positions = data.positions;
    const velocity = data.velocity;

    cursorVelocity.current.x = THREE.MathUtils.lerp(
      cursorVelocity.current.x,
      (pointer.x - previousPointer.current.x) / Math.max(dt, 0.016),
      damp(7, dt),
    );
    cursorVelocity.current.y = THREE.MathUtils.lerp(
      cursorVelocity.current.y,
      (pointer.y - previousPointer.current.y) / Math.max(dt, 0.016),
      damp(7, dt),
    );
    previousPointer.current = { x: pointer.x, y: pointer.y };
    const cursorX = pointer.x * 7.05;
    const cursorY = pointer.y * 4.05;
    const cursorSpeed = Math.min(3.2, Math.hypot(cursorVelocity.current.x, cursorVelocity.current.y));

    const fadeIn = reduced ? 1 : ease(sceneTime, 0.3, 1.65);
    const globalFormation = reduced ? 1 : ease(sceneTime, 1.45, 6.15);
    const beanBreath = phase === "idle" && globalFormation > 0.98
      ? Math.sin(now * 0.62) * (engaged ? 0.025 : 0.012)
      : 0;
    const entryStabilize = phase === "enter"
      ? reduced ? ease(entryTime, 0.08, 0.55) : ease(entryTime, 0.18, 1.48)
      : phase === "chapter" ? 1 : 0;
    const passage = phase === "enter" && !reduced ? ease(entryTime, 4, 6.1) : 0;
    const focusLock = phase === "enter" && !reduced
      ? ease(entryTime, 1.9, 2.4) * (1 - ease(entryTime, 3.56, 3.68))
      : 0;
    const focusSeal = phase === "enter" && !reduced ? ease(entryTime, 2.02, 2.72) : 0;
    const hardFocus = phase === "enter" && !reduced && entryTime >= 2.72 && entryTime < 3.68;
    const focusHandoff = phase === "enter" && !reduced
      ? ease(entryTime, 2.66, 2.84) * (1 - ease(entryTime, 3.68, 3.86))
      : 0;

    material.current.uniforms.uPixelRatio.value = Math.min(1.45, gl.getPixelRatio());
    material.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      material.current.uniforms.uOpacity.value,
      phase === "explore" || phase === "chapter"
        ? 0
        : fadeIn * (phase === "enter" && entryTime > 5.42 ? Math.max(0, 1 - (entryTime - 5.42) * 1.18) : 1),
      damp(3.4, dt),
    );
    const energyPulse = phase === "enter" ? Math.exp(-Math.pow((entryTime - 3.64) / 0.24, 2)) : 0;
    material.current.uniforms.uPointScale.value = 1.08 + (engaged ? 0.06 : 0);

    for (let i = 0; i < count; i++) {
      const n = i * 3;
      const seed = data.seeds[i];
      const timedFormation = ease(globalFormation, seed * 0.19, 0.64 + seed * 0.22);
      const localFormation = Math.max(timedFormation, entryStabilize);
      const ambient = data.staysAmbient[i] === 1;
      const remainsAmbient = ambient && phase === "idle";
      const driftAmount = remainsAmbient ? 0.2 : (1 - localFormation) * 0.23;
      const driftX = Math.sin(now * (0.12 + seed * 0.1) + seed * 19) * driftAmount;
      const driftY = Math.cos(now * (0.11 + seed * 0.08) + seed * 13) * driftAmount;
      const driftZ = Math.sin(now * 0.09 + seed * 23) * driftAmount * 0.6;

      let targetX = remainsAmbient
        ? data.scatter[n] + driftX
        : THREE.MathUtils.lerp(data.scatter[n] + driftX, data.bean[n] + (data.bean[n] - BEAN_CENTER[0]) * beanBreath, localFormation);
      let targetY = remainsAmbient
        ? data.scatter[n + 1] + driftY
        : THREE.MathUtils.lerp(data.scatter[n + 1] + driftY, data.bean[n + 1] + (data.bean[n + 1] - BEAN_CENTER[1]) * beanBreath, localFormation);
      let targetZ = remainsAmbient
        ? data.scatter[n + 2] + driftZ
        : THREE.MathUtils.lerp(data.scatter[n + 2] + driftZ, data.bean[n + 2] + (data.bean[n + 2] - BEAN_CENTER[2]) * beanBreath, localFormation);

      const streaming = data.flowsToSeed[i] === 1 && phase === "idle";
      if (streaming) {
        const rate = (engaged ? 0.135 : 0.082) + seed * 0.034;
        const cycle = (sceneTime * rate + seed * 1.73) % 1;
        const inward = ease(cycle, 0.04, 0.92);
        const arc = Math.sin(inward * Math.PI);
        const coreX = BEAN_CENTER[0] + (data.bean[n] - BEAN_CENTER[0]) * 0.16;
        const coreY = BEAN_CENTER[1] + (data.bean[n + 1] - BEAN_CENTER[1]) * 0.16;
        const coreZ = BEAN_CENTER[2] + (data.bean[n + 2] - BEAN_CENTER[2]) * 0.16;
        targetX = THREE.MathUtils.lerp(data.scatter[n], coreX, inward) + Math.sin(seed * 31) * arc * 0.19;
        targetY = THREE.MathUtils.lerp(data.scatter[n + 1], coreY, inward) + Math.cos(seed * 23) * arc * 0.13;
        targetZ = THREE.MathUtils.lerp(data.scatter[n + 2], coreZ, inward) + Math.sin(seed * 17) * arc * 0.16;
        data.alphas[i] = data.baseAlphas[i] * Math.pow(Math.sin(cycle * Math.PI), 0.72) * (0.56 + globalFormation * 0.44);
      } else {
        data.alphas[i] = data.baseAlphas[i];
      }

      if (phase === "enter") {
        const release = ease(entryTime, 0.08, 0.92);
        const convergence = ease(entryTime, 0.7, 2.15);
        const burst = ease(entryTime, 3.68, 4.58);
        const afterglowFade = 1 - ease(entryTime, 4.88, 5.96);
        const releasedX = data.bean[n]
          + Math.sin(seed * 37 + now * (0.48 + seed * 0.16)) * release * (0.24 + seed * 0.5)
          + Math.cos(seed * 17 - now * 0.21) * release * 0.16;
        const releasedY = data.bean[n + 1]
          + Math.cos(seed * 29 - now * (0.42 + seed * 0.12)) * release * (0.2 + seed * 0.38);
        const releasedZ = data.bean[n + 2]
          + Math.sin(seed * 23 + now * 0.34) * release * (0.18 + seed * 0.34);
        if (i === FOCUS_PARTICLE) {
          targetX = THREE.MathUtils.lerp(releasedX, FOCUS_POINT[0], convergence);
          targetY = THREE.MathUtils.lerp(releasedY, FOCUS_POINT[1], convergence);
          targetZ = THREE.MathUtils.lerp(releasedZ, FOCUS_POINT[2] - passage * 0.28, convergence);
          data.alphas[i] = THREE.MathUtils.lerp(data.baseAlphas[i], 1, convergence)
            * (1 - ease(entryTime, 2.66, 2.84));
          data.sizes[i] = data.baseSizes[i] * 1.05;
        } else {
          const fromFocusX = data.scatter[n] - FOCUS_POINT[0];
          const fromFocusY = data.scatter[n + 1] - FOCUS_POINT[1];
          const fromFocusZ = data.scatter[n + 2] - FOCUS_POINT[2];
          const directionLength = Math.hypot(fromFocusX, fromFocusY, fromFocusZ) || 1;
          const burstRadius = burst * (4.5 + seed * 9.5);
          const convergedX = THREE.MathUtils.lerp(releasedX, FOCUS_POINT[0], convergence);
          const convergedY = THREE.MathUtils.lerp(releasedY, FOCUS_POINT[1], convergence);
          const convergedZ = THREE.MathUtils.lerp(releasedZ, FOCUS_POINT[2], convergence);
          targetX = THREE.MathUtils.lerp(convergedX, FOCUS_POINT[0] + fromFocusX / directionLength * burstRadius, burst);
          targetY = THREE.MathUtils.lerp(convergedY, FOCUS_POINT[1] + fromFocusY / directionLength * burstRadius, burst);
          targetZ = THREE.MathUtils.lerp(convergedZ, FOCUS_POINT[2] + fromFocusZ / directionLength * burstRadius - passage * .5, burst);
          data.alphas[i] = Math.min(1, data.baseAlphas[i] * (.74 + convergence * .26) + energyPulse * .28)
            * afterglowFade
            * (1 - focusHandoff);
          data.sizes[i] = data.baseSizes[i];
        }
      } else {
        data.sizes[i] = data.baseSizes[i];
      }

      let ax = 0;
      let ay = 0;
      let az = 0;
      if (!reduced && phase === "idle" && sceneTime > 0.65) {
        const dx = positions[n] - cursorX;
        const dy = positions[n + 1] - cursorY;
        const distance = Math.hypot(dx, dy) + 0.001;
        const depthBand = Math.exp(-Math.pow((positions[n + 2] + 0.7) / 4.7, 2));
        if (distance < 1.72 && depthBand > 0.035) {
          const influence = Math.pow(1 - distance / 1.72, 2) * depthBand;
          const wave = Math.sin(distance * 5.4 - now * 2.15) * 0.34;
          const movement = 0.24 + cursorSpeed * 0.17;
          ax += (dx / distance * (movement + wave) - cursorVelocity.current.x * 0.018) * influence;
          ay += (dy / distance * (movement + wave) - cursorVelocity.current.y * 0.018) * influence;
          az += Math.sin(seed * 21 + now * 1.3) * influence * 0.24;
        }
      }

      const spring = phase === "enter"
        ? 7.5 + entryStabilize * 9.5 + focusLock * 18
        : ambient ? 0.62 : 0.9 + localFormation * (engaged ? 8.1 : 6.25);
      ax += (targetX - positions[n]) * spring;
      ay += (targetY - positions[n + 1]) * spring;
      az += (targetZ - positions[n + 2]) * spring;
      const drag = phase === "enter" ? 7.8 + focusLock * 15 : ambient ? 2.6 : 4.8 + localFormation * 1.7;
      const dragFactor = Math.exp(-drag * dt);
      velocity[n] = (velocity[n] + ax * dt) * dragFactor;
      velocity[n + 1] = (velocity[n + 1] + ay * dt) * dragFactor;
      velocity[n + 2] = (velocity[n + 2] + az * dt) * dragFactor;
      positions[n] += velocity[n] * dt;
      positions[n + 1] += velocity[n + 1] * dt;
      positions[n + 2] += velocity[n + 2] * dt;
      if (phase === "enter" && !reduced && entryTime < 3.68 && focusSeal > 0) {
        const sealFactor = focusSeal * damp(26, dt);
        positions[n] = THREE.MathUtils.lerp(positions[n], FOCUS_POINT[0], sealFactor);
        positions[n + 1] = THREE.MathUtils.lerp(positions[n + 1], FOCUS_POINT[1], sealFactor);
        positions[n + 2] = THREE.MathUtils.lerp(positions[n + 2], FOCUS_POINT[2], sealFactor);
        const velocitySeal = 1 - focusSeal * damp(38, dt);
        velocity[n] *= velocitySeal;
        velocity[n + 1] *= velocitySeal;
        velocity[n + 2] *= velocitySeal;
      }
      if (hardFocus) {
        positions[n] = FOCUS_POINT[0];
        positions[n + 1] = FOCUS_POINT[1];
        positions[n + 2] = FOCUS_POINT[2];
        velocity[n] = 0;
        velocity[n + 1] = 0;
        velocity[n + 2] = 0;
      }
    }
    (points.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (points.current.geometry.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;
    (points.current.geometry.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
  });

  return <points ref={points} frustumCulled={false}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
      <bufferAttribute attach="attributes-aAlpha" args={[data.alphas, 1]} />
      <bufferAttribute attach="attributes-aColor" args={[data.colors, 3]} />
    </bufferGeometry>
    <shaderMaterial
      ref={material}
      vertexShader={VERTEX_SHADER}
      fragmentShader={FRAGMENT_SHADER}
      uniforms={uniforms}
      transparent
      depthWrite={false}
      depthTest
      blending={THREE.NormalBlending}
    />
  </points>;
}

function OrganicFragments({ phase, tier, reduced }: { phase: Phase; tier: Tier; reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const start = useRef<number | null>(null);
  const entryStart = useRef<number | null>(null);
  const previousPhase = useRef(phase);
  const count = countFor(tier, [92, 58, 20]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const fragments = useMemo(() => Array.from({ length: count }, (_, i) => {
    const z = -10 + seeded(i + 803) * 12.5;
    return {
      scatter: [0.2 + seeded(i + 821) * 7.3, (seeded(i + 839) - 0.5) * 7.4, z] as Vec3,
      target: coffeeSeedTarget(i + 9000, 41),
      position: new THREE.Vector3(0.2 + seeded(i + 821) * 7.3, (seeded(i + 839) - 0.5) * 7.4, z),
      seed: seeded(i + 857),
      scale: 0.035 + seeded(i + 877) * 0.045,
    };
  }), [count]);

  useFrame(({ clock }, rawDt) => {
    if (!mesh.current || !material.current) return;
    const now = clock.elapsedTime;
    const dt = Math.min(rawDt, 0.033);
    if (start.current === null) start.current = now;
    if (previousPhase.current !== phase) {
      if (phase === "enter") entryStart.current = now;
      if (phase === "idle") start.current = now;
      previousPhase.current = phase;
    }
    const t = now - (start.current ?? now);
    const entry = entryStart.current === null ? 0 : now - entryStart.current;
    const formation = reduced ? 1 : ease(t, 1.45, 5.2);
    const entryStabilize = phase === "enter" ? reduced ? ease(entry, 0.08, 0.5) : ease(entry, 0.18, 1.45) : phase === "chapter" ? 1 : 0;
    const passage = phase === "enter" && !reduced ? ease(entry, 1.58, 5.15) : 0;
    const visible = phase === "explore" || phase === "chapter" ? 0 : (reduced ? 0.11 : ease(t, 0.9, 2.0) * 0.13);
    material.current.opacity = THREE.MathUtils.lerp(material.current.opacity, visible, damp(3, dt));

    fragments.forEach((fragment, i) => {
      const localFormation = Math.max(ease(formation, fragment.seed * 0.16, 0.68 + fragment.seed * 0.16), entryStabilize);
      const target = new THREE.Vector3(
        THREE.MathUtils.lerp(fragment.scatter[0], fragment.target[0], localFormation),
        THREE.MathUtils.lerp(fragment.scatter[1], fragment.target[1], localFormation),
        THREE.MathUtils.lerp(fragment.scatter[2], fragment.target[2], localFormation),
      );
      if (passage > 0) {
        const side = fragment.target[0] < BEAN_CENTER[0] ? -1 : 1;
        target.x += side * passage * 0.12;
        target.z -= passage * (0.38 + fragment.seed * 0.56);
      }
      fragment.position.lerp(target, damp(phase === "enter" ? 8.5 : 2.5 + localFormation * 3, dt));
      const depthScale = THREE.MathUtils.clamp((fragment.position.z + 11) / 12, 0.35, 1.35);
      dummy.position.copy(fragment.position);
      dummy.rotation.set(fragment.seed * 5 + now * 0.035, fragment.seed * 8 - now * 0.025, fragment.seed * 3);
      const scale = fragment.scale * depthScale * (1 - passage * 0.72);
      dummy.scale.set(scale * 1.8, scale, scale * 0.7);
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
    <dodecahedronGeometry args={[1, 0]} />
    <meshBasicMaterial ref={material} color="#8f5a3d" transparent opacity={0} depthWrite={false} fog />
  </instancedMesh>;
}

function CoffeeCrease({ phase, reduced, engaged }: { phase: Phase; reduced: boolean; engaged: boolean }) {
  const lines = useRef<THREE.LineSegments>(null);
  const startedAt = useRef<number | null>(null);
  const entryStart = useRef<number | null>(null);
  const previousPhase = useRef(phase);
  const positions = useMemo(() => {
    const segments = 20;
    const array = new Float32Array(segments * 6);
    for (let i = 0; i < segments; i++) {
      const makePoint = (step: number) => {
        const y = -1.7 + step / segments * 3.4;
        const x = Math.sin(y * 1.85) * 0.055 + Math.sin(y * 0.63) * 0.026;
        const yUnit = y / 1.94;
        const taper = seedTaper(yUnit);
        return rotateSeed(x, y, 0.74 * taper);
      };
      const a = makePoint(i);
      const b = makePoint(i + 1);
      array.set([...a, ...b], i * 6);
    }
    return array;
  }, []);

  useFrame(({ clock }, rawDt) => {
    if (!lines.current) return;
    const material = lines.current.material as THREE.LineBasicMaterial;
    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    if (previousPhase.current !== phase) {
      if (phase === "enter") entryStart.current = clock.elapsedTime;
      if (phase === "idle") startedAt.current = clock.elapsedTime;
      previousPhase.current = phase;
    }
    const sceneTime = clock.elapsedTime - (startedAt.current ?? clock.elapsedTime);
    const entry = entryStart.current === null ? 0 : clock.elapsedTime - entryStart.current;
    const entryFade = phase === "enter" ? 1 - ease(entry, 3.05, 4.95) : phase === "chapter" || phase === "explore" ? 0 : 1;
    const formation = reduced ? 1 : ease(sceneTime, 0.55, 4.9);
    const quietGroove = THREE.MathUtils.lerp(0.018, reduced ? 0.065 : 0.078 + Math.sin(clock.elapsedTime * 0.72) * 0.01, formation);
    const entryLight = phase === "enter" && !reduced ? Math.exp(-Math.pow((entry - 1.7) / 0.76, 2)) * 0.2 : 0;
    const target = (quietGroove + entryLight) * (engaged ? 1.18 : 1) * entryFade;
    material.opacity = THREE.MathUtils.lerp(material.opacity, target, damp(2.6, Math.min(rawDt, 0.033)));
  });

  return <lineSegments ref={lines} frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <lineBasicMaterial color="#e2ad81" transparent opacity={0} depthWrite={false} />
  </lineSegments>;
}

function CoffeeContour({ phase, reduced, engaged }: { phase: Phase; reduced: boolean; engaged: boolean }) {
  const lines = useRef<THREE.LineSegments>(null);
  const startedAt = useRef<number | null>(null);
  const entryStart = useRef<number | null>(null);
  const previousPhase = useRef(phase);
  const positions = useMemo(() => {
    const segments = 68;
    const array = new Float32Array(segments * 6);
    const pointAt = (step: number) => {
      const theta = step / segments * Math.PI * 2;
      const cosine = Math.cos(theta);
      const sine = Math.sin(theta);
      const y = sine * 1.94;
      const width = cosine < 0 ? 1.22 : 1.28;
      const x = cosine * width + Math.sin(y * 0.8) * 0.018;
      return rotateSeed(x, y, 0.18 + Math.cos(theta * 2) * 0.025);
    };
    for (let i = 0; i < segments; i++) {
      const a = pointAt(i);
      const b = pointAt(i + 1);
      array.set([...a, ...b], i * 6);
    }
    return array;
  }, []);

  useFrame(({ clock }, rawDt) => {
    if (!lines.current) return;
    const material = lines.current.material as THREE.LineBasicMaterial;
    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    if (previousPhase.current !== phase) {
      if (phase === "enter") entryStart.current = clock.elapsedTime;
      if (phase === "idle") startedAt.current = clock.elapsedTime;
      previousPhase.current = phase;
    }
    const sceneTime = clock.elapsedTime - (startedAt.current ?? clock.elapsedTime);
    const entry = entryStart.current === null ? 0 : clock.elapsedTime - entryStart.current;
    const formation = reduced ? 1 : ease(sceneTime, 0.9, 5.1);
    const entryFade = phase === "enter" ? 1 - ease(entry, 1.65, 3.55) : phase === "chapter" || phase === "explore" ? 0 : 1;
    const contourOpacity = THREE.MathUtils.lerp(0.022, reduced ? 0.18 : 0.21 + Math.sin(clock.elapsedTime * 0.55) * 0.012, formation);
    const target = contourOpacity * entryFade * (engaged ? 1.1 : 1);
    material.opacity = THREE.MathUtils.lerp(material.opacity, target, damp(2.8, Math.min(rawDt, 0.033)));
  });

  return <lineSegments ref={lines} frustumCulled={false}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <lineBasicMaterial color="#c07a53" transparent opacity={0} depthWrite={false} />
  </lineSegments>;
}

function CameraRig({ phase, reduced }: { phase: Phase; reduced: boolean }) {
  const { camera, pointer } = useThree();
  const entryStart = useRef<number | null>(null);
  const previousPhase = useRef(phase);
  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.033);
    if (previousPhase.current !== phase) {
      if (phase === "enter") entryStart.current = clock.elapsedTime;
      previousPhase.current = phase;
    }
    const entry = entryStart.current === null ? 0 : clock.elapsedTime - entryStart.current;
    const perspective = camera as THREE.PerspectiveCamera;

    if (phase === "enter" && !reduced) {
      const approach = ease(entry, 0.28, 3.34);
      const passage = ease(entry, 3.92, 6.18);
      const approachZ = THREE.MathUtils.lerp(8.5, FOCUS_POINT[2] + 2.65, approach);
      camera.position.x = THREE.MathUtils.lerp(0, FOCUS_POINT[0], approach);
      camera.position.y = THREE.MathUtils.lerp(0, FOCUS_POINT[1], approach) + Math.sin(passage * Math.PI) * 0.026;
      camera.position.z = THREE.MathUtils.lerp(approachZ, -6.4, passage);
      const passageFov = Math.sin(passage * Math.PI);
      perspective.fov = THREE.MathUtils.lerp(THREE.MathUtils.lerp(52, 42, approach), 72, passageFov);
      perspective.updateProjectionMatrix();
      camera.lookAt(FOCUS_POINT[0], FOCUS_POINT[1], FOCUS_POINT[2] - passage * 7.2);
      return;
    }

    const targetX = phase === "idle" && !reduced ? pointer.x * 0.085 : 0;
    const targetY = phase === "idle" && !reduced ? pointer.y * 0.055 : 0;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, damp(1.1, dt));
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, damp(1.1, dt));
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 8.5, damp(1.5, dt));
    perspective.fov = THREE.MathUtils.lerp(perspective.fov, 52, damp(1.5, dt));
    perspective.updateProjectionMatrix();
    camera.lookAt(0, 0.18, -2.2);
  });
  return null;
}

function SeedEntryTarget({ enabled, onEnter, onHover }: {
  enabled: boolean;
  onEnter: () => void;
  onHover: (hovered: boolean) => void;
}) {
  useEffect(() => () => { document.body.style.cursor = ""; }, []);
  if (!enabled) return null;
  return <group position={BEAN_CENTER}>
    {([-1, 1] as const).map(side => <mesh
      key={side}
      position={[side * .58, 0, .08]}
      scale={[.78, 2.08, .9]}
      onPointerEnter={event => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
        onHover(true);
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "";
        onHover(false);
      }}
      onPointerDown={event => event.stopPropagation()}
      onClick={event => {
        event.stopPropagation();
        onEnter();
      }}
    >
      <sphereGeometry args={[1, 18, 14]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>)}
  </group>;
}

function World({ phase, tier, reduced, engaged, seedEntryEnabled, onEnter, onSeedHover }: {
  phase: Phase;
  tier: Tier;
  reduced: boolean;
  engaged: boolean;
  seedEntryEnabled: boolean;
  onEnter: () => void;
  onSeedHover: (hovered: boolean) => void;
}) {
  return <>
    <fog attach="fog" args={["#050504", 5.5, 23]} />
    <MatterField phase={phase} tier={tier} reduced={reduced} engaged={engaged} />
    <SeedEntryTarget enabled={seedEntryEnabled} onEnter={onEnter} onHover={onSeedHover} />
    <CameraRig phase={phase} reduced={reduced} />
  </>;
}

export default function ParticleUniverse({
  phase,
  reduced,
  engaged,
  onInterfaceReady,
  onEnter,
}: {
  phase: Phase;
  reduced: boolean;
  engaged: boolean;
  onInterfaceReady: (ready: boolean) => void;
  onEnter: () => void;
}) {
  const [tier, setTier] = useState<Tier>("mid");
  const [cycle, setCycle] = useState(0);
  const [story, setStory] = useState("dark");
  const [seedHovered, setSeedHovered] = useState(false);
  const previousPhase = useRef(phase);

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 4;
    const low = innerWidth < 720 || cores <= 4 || memory <= 2;
    setTier(low ? "low" : cores >= 8 && memory >= 6 ? "high" : "mid");
  }, []);

  useEffect(() => {
    if (previousPhase.current !== phase && phase === "idle") setCycle(value => value + 1);
    previousPhase.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase !== "idle") {
      setSeedHovered(false);
      setStory(phase);
      return;
    }
    onInterfaceReady(false);
    setStory(reduced ? "seed" : "dark");
    if (reduced) {
      const reveal = window.setTimeout(() => onInterfaceReady(true), 180);
      return () => window.clearTimeout(reveal);
    }
    const timers = [
      window.setTimeout(() => setStory("matter"), 420),
      window.setTimeout(() => setStory("hint"), 1320),
      window.setTimeout(() => setStory("gathering"), 2680),
      window.setTimeout(() => setStory("seed"), 6100),
      window.setTimeout(() => onInterfaceReady(true), 6350),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [phase, reduced, cycle, onInterfaceReady]);

  return <div className="three-field" data-tier={tier} data-phase={phase} data-story-state={story} aria-hidden="true">
    <Canvas
      camera={{ position: [0, 0, 8.5], fov: 52, near: 0.12, far: 34 }}
      dpr={tier === "high" ? [1, 1.35] : [1, 1.12]}
      gl={{ antialias: tier !== "low", alpha: true, powerPreference: tier === "high" ? "high-performance" : "default" }}
    >
      <World
        key={cycle}
        phase={phase}
        tier={tier}
        reduced={reduced}
        engaged={engaged || seedHovered}
        seedEntryEnabled={phase === "idle" && story === "seed"}
        onEnter={onEnter}
        onSeedHover={setSeedHovered}
      />
    </Canvas>
  </div>;
}
