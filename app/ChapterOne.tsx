"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type LayerId = "bean" | "silverskin" | "parchment" | "mucilage" | "pulp" | "skin";
type ShapeKind = "fruit" | "bean";

type AnatomyLayer = {
  id: LayerId;
  number: string;
  label: string;
  english: string;
  body: string;
  color: string;
  cutColor: string;
  outerShape: ShapeKind;
  innerShape?: ShapeKind;
  outer: number;
  inner: number;
  depth: number;
  explodedY: number;
  roughness: number;
  transmission?: number;
};

const LAYERS: AnatomyLayer[] = [
  {
    id: "skin", number: "06", label: "Vỏ quả", english: "Skin",
    body: "Lớp vỏ mỏng (exocarp) chuyển từ xanh sang đỏ sẫm khi chín, bảo vệ toàn bộ quả khỏi tác động bên ngoài.",
    color: "#76151a", cutColor: "#a92c2c", outerShape: "fruit", innerShape: "fruit", outer: 1, inner: .93, depth: .3, explodedY: -3.72, roughness: .42,
  },
  {
    id: "pulp", number: "05", label: "Thịt quả", english: "Pulp",
    body: "Phần thịt mọng (mesocarp) giàu nước và đường, tạo độ đầy cho quả chín và bao quanh các lớp bảo vệ hạt.",
    color: "#a63c30", cutColor: "#d45d48", outerShape: "fruit", innerShape: "bean", outer: .93, inner: 1.2, depth: .38, explodedY: -2.06, roughness: .52, transmission: .04,
  },
  {
    id: "mucilage", number: "04", label: "Lớp nhớt", english: "Mucilage",
    body: "Màng nhớt trong, giàu pectin và đường, bám sát vỏ trấu. Đây là lớp được lên men hoặc tách bỏ trong sơ chế ướt.",
    color: "#d7998d", cutColor: "#f0c7ba", outerShape: "bean", innerShape: "bean", outer: 1.2, inner: 1.1, depth: .27, explodedY: -.52, roughness: .22, transmission: .34,
  },
  {
    id: "parchment", number: "03", label: "Vỏ trấu", english: "Parchment",
    body: "Vỏ trấu (endocarp) mỏng nhưng cứng và có thớ xơ, tạo thành lớp áo cơ học ôm quanh từng hạt.",
    color: "#9b8064", cutColor: "#c6ad8c", outerShape: "bean", innerShape: "bean", outer: 1.1, inner: 1.02, depth: .24, explodedY: .9, roughness: .74,
  },
  {
    id: "silverskin", number: "02", label: "Vỏ lụa", english: "Silverskin",
    body: "Màng hạt rất mỏng (seed coat) ôm sát bề mặt hạt xanh; phần còn lại của nó trở thành chaff khi rang.",
    color: "#aebba0", cutColor: "#dce4d2", outerShape: "bean", innerShape: "bean", outer: 1.02, inner: .95, depth: .2, explodedY: 2.21, roughness: .62, transmission: .12,
  },
  {
    id: "bean", number: "01", label: "Hạt cà phê", english: "Bean",
    body: "Mỗi quả thường chứa hai hạt, mặt phẳng úp vào nhau và mặt ngoài lồi. Trên mặt phẳng là rãnh dọc uốn cong vào trong theo nếp gấp của nội nhũ.",
    color: "#87905a", cutColor: "#a9b070", outerShape: "bean", outer: .95, inner: 0, depth: .34, explodedY: 3.35, roughness: .62,
  },
];

const LAYER_FORMS: Record<Exclude<LayerId, "bean">, [number, number, number]> = {
  skin: [1.54, 1.39, 1.42],
  pulp: [1.43, 1.29, 1.32],
  mucilage: [1.32, 1.18, 1.22],
  parchment: [1.2, 1.08, 1.12],
  silverskin: [1.08, .97, 1.01],
};

const layerById = (id: LayerId) => LAYERS.find(layer => layer.id === id) ?? LAYERS[0];
const smooth = (value: number, start: number, end: number) => THREE.MathUtils.smoothstep(value, start, end);

function makeSurfaceTexture() {
  const size = 96;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) * 4;
      const hash = ((x * 73856093) ^ (y * 19349663)) & 31;
      const cell = Math.sin(x * .27 + Math.sin(y * .19) * 2.2) * Math.cos(y * .31 + Math.cos(x * .13)) * 21;
      const pore = Math.sin((x * .83 + y * .57) + Math.sin(y * .11) * 3) * 9;
      const value = Math.max(42, Math.min(224, 126 + cell + pore + hash));
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.5, 3.5);
  texture.needsUpdate = true;
  return texture;
}

function makeCherryGeometry() {
  const geometry = new THREE.SphereGeometry(1, 128, 96);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const latitude = THREE.MathUtils.clamp(y, -1, 1);
    const waist = 1 + (1 - latitude * latitude) * .042;
    const topDimple = latitude > .62 ? 1 - (latitude - .62) * .24 : 1;
    const blossomTaper = latitude < -.72 ? 1 - (-.72 - latitude) * .1 : 1;
    const asymmetry = 1 + x * .011 - z * .007;
    const skinVariation = 1 + Math.sin(x * 13 + y * 9) * Math.cos(z * 11 - y * 7) * .0022;
    const radial = waist * topDimple * blossomTaper * asymmetry * skinVariation;
    position.setXYZ(
      i,
      x * 2.06 * radial,
      y * 2.2 + (1 - Math.abs(y)) * .025,
      z * 1.96 * radial,
    );
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

function contour(kind: ShapeKind, scale: number) {
  const points: THREE.Vector2[] = [];
  const segments = 96;
  for (let i = 0; i < segments; i++) {
    const angle = i / segments * Math.PI * 2;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    if (kind === "fruit") {
      const shoulder = 1 + Math.sin(angle * 2 - .3) * .025 + Math.cos(angle * 3) * .018;
      points.push(new THREE.Vector2(cosine * 2.26 * shoulder * scale, sine * 2.34 * scale));
    } else {
      const asymmetric = 1 + sine * .045 - Math.cos(angle * 2) * .035;
      const x = cosine * 1.03 * asymmetric * scale + Math.sin(angle * 2) * .045 * scale;
      const y = sine * 1.42 * scale;
      points.push(new THREE.Vector2(x, y));
    }
  }
  return points;
}

function shapeForLayer(layer: AnatomyLayer) {
  const outer = contour(layer.outerShape, layer.outer);
  if (!THREE.ShapeUtils.isClockWise(outer)) outer.reverse();
  const shape = new THREE.Shape(outer);
  if (layer.innerShape && layer.inner > 0) {
    const inner = contour(layer.innerShape, layer.inner);
    if (THREE.ShapeUtils.isClockWise(inner)) inner.reverse();
    shape.holes.push(new THREE.Path(inner));
  }
  return shape;
}

function layerGeometry(layer: AnatomyLayer) {
  const shape = shapeForLayer(layer);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: layer.depth,
    steps: 1,
    curveSegments: 48,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: layer.id === "pulp" ? .055 : .03,
    bevelThickness: layer.id === "pulp" ? .055 : .028,
  });
  geometry.center();
  return geometry;
}

function layerFaceGeometry(layer: AnatomyLayer) {
  const geometry = new THREE.ShapeGeometry(shapeForLayer(layer), 48);
  geometry.computeVertexNormals();
  return geometry;
}

function greenSeedGeometry(seed: number, innerSide: -1 | 1) {
  const geometry = new THREE.SphereGeometry(1, 112, 84);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const texture = Math.sin(x * 11.7 + seed) * Math.cos(y * 9.3 - seed) + Math.sin(z * 15.1 + y * 4.2);
    const pore = Math.sin((x + y - z) * 21.4 + seed * 3.1);
    const deformation = 1 + texture * .0045 + pore * .0024;
    const innerHemisphere = Math.max(0, x * innerSide);
    const flattenedX = x - innerSide * innerHemisphere * (.68 + (1 - Math.abs(y)) * .08);
    position.setXYZ(i, flattenedX * deformation, y * deformation, z * deformation);
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

const FORMATION_VERTEX_SHADER = /* glsl */ `
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

const FORMATION_FRAGMENT_SHADER = /* glsl */ `
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

function FormationMatter({ active, reduced }: { active: boolean; reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const pointMaterial = useRef<THREE.ShaderMaterial>(null);
  const lineMaterial = useRef<THREE.LineBasicMaterial>(null);
  const startedAt = useRef<number | null>(null);
  const previousActive = useRef(active);
  const count = reduced ? 220 : 1450;
  const pointUniforms = useMemo(() => ({
    uPixelRatio: { value: 1 },
    uPointScale: { value: 1.08 },
    uOpacity: { value: 0 },
    uSoftness: { value: .58 },
  }), []);
  const buffers = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scatter = new Float32Array(count * 3);
    const target = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const linkCount = reduced ? 0 : Math.floor(count / 4);
    const links = new Uint16Array(linkCount * 2);
    const linePositions = new Float32Array(linkCount * 6);
    const copper = new THREE.Color("#b47650");
    const coffee = new THREE.Color("#704735");
    const leftLobe = new THREE.Color("#8b573e");
    const rightLobe = new THREE.Color("#ae6d49");
    const warmHighlight = new THREE.Color("#cf8b59");
    const seamCopper = new THREE.Color("#e0ad82");
    for (let i = 0; i < count; i++) {
      const n = i * 3;
      const a = (i * 2.399963) % (Math.PI * 2);
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const waist = 1 + (1 - y * y) * .038;
      const topDimple = y > .62 ? 1 - (y - .62) * .21 : 1;
      const texture = 1 + Math.sin(i * 4.17) * .006;
      const radial = waist * topDimple * texture;
      target.set([
        Math.cos(a) * ring * 2.06 * radial,
        y * 2.2,
        Math.sin(a) * ring * 1.96 * radial,
      ], n);
      const sx = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 7.8;
      const sy = (Math.sin(i * 7.233 + 1.7) * 24634.6345 % 1) * 5.3;
      const sz = (Math.sin(i * 4.713 + 3.1) * 19421.731 % 1) * 9.4 - 1.6;
      positions.set([sx, sy, sz], n);
      scatter.set([sx, sy, sz], n);
      const particleSeed = Math.abs(Math.sin(i * 11.73 + 2.17) * 43758.5453 % 1);
      const seamMatter = i % 100 < 5;
      const highlight = i % 29 === 0;
      const color = seamMatter
        ? seamCopper
        : highlight
          ? warmHighlight
          : (i % 2 === 0 ? leftLobe : rightLobe).clone().lerp(coffee, particleSeed * .32).lerp(copper, .14);
      colors.set([color.r, color.g, color.b], n);
      sizes[i] = seamMatter
        ? .72 + particleSeed * .6
        : .76 + particleSeed * (highlight ? 1.18 : .74);
      alphas[i] = seamMatter ? .52 : i % 7 === 0 ? .29 : highlight ? .94 : .54 + particleSeed * .31;
    }
    for (let edge = 0; edge < linkCount; edge++) {
      const source = (edge * 4) % count;
      const sourceOffset = source * 3;
      let nearest = (source + 1) % count;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (let candidate = 0; candidate < count; candidate++) {
        if (candidate === source) continue;
        const candidateOffset = candidate * 3;
        const dx = target[sourceOffset] - target[candidateOffset];
        const dy = target[sourceOffset + 1] - target[candidateOffset + 1];
        const dz = target[sourceOffset + 2] - target[candidateOffset + 2];
        const distance = dx * dx + dy * dy + dz * dz;
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = candidate;
        }
      }
      links.set([source, nearest], edge * 2);
    }
    return { positions, scatter, target, colors, sizes, alphas, links, linePositions, linkCount };
  }, [count]);

  useFrame(({ clock, gl }, rawDt) => {
    if (!points.current || !pointMaterial.current) return;
    if (previousActive.current !== active) {
      if (active) startedAt.current = clock.elapsedTime;
      previousActive.current = active;
    }
    if (active && startedAt.current === null) startedAt.current = clock.elapsedTime;
    const elapsed = active ? clock.elapsedTime - (startedAt.current ?? clock.elapsedTime) : 0;
    const reveal = reduced ? 0 : smooth(elapsed, .05, .35);
    const formation = reduced ? 1 : smooth(elapsed, .78, 4.25);
    const swellUp = reduced ? 0 : smooth(elapsed, 4.18, 4.65);
    const settle = reduced ? 1 : smooth(elapsed, 4.65, 5.15);
    const fruitScale = 1 + .075 * swellUp * (1 - settle);
    const connections = reduced ? 0 : smooth(elapsed, 4.65, 5.45) * (1 - smooth(elapsed, 5.78, 6.72));
    const fade = reduced ? 0 : 1 - smooth(elapsed, 5.72, 6.78);
    const dt = Math.min(rawDt, .033);
    for (let i = 0; i < count; i++) {
      const n = i * 3;
      const wobble = (1 - formation) * .075;
      const tx = THREE.MathUtils.lerp(buffers.scatter[n], buffers.target[n] * fruitScale, formation)
        + Math.sin(clock.elapsedTime * .31 + i) * wobble;
      const ty = THREE.MathUtils.lerp(buffers.scatter[n + 1], buffers.target[n + 1] * fruitScale, formation)
        + Math.cos(clock.elapsedTime * .27 + i * .7) * wobble;
      const tz = THREE.MathUtils.lerp(buffers.scatter[n + 2], buffers.target[n + 2] * fruitScale, formation)
        + Math.sin(clock.elapsedTime * .19 + i * .43) * wobble * .7;
      const factor = 1 - Math.exp(-(1.42 + formation * 4.9) * dt);
      buffers.positions[n] = THREE.MathUtils.lerp(buffers.positions[n], tx, factor);
      buffers.positions[n + 1] = THREE.MathUtils.lerp(buffers.positions[n + 1], ty, factor);
      buffers.positions[n + 2] = THREE.MathUtils.lerp(buffers.positions[n + 2], tz, factor);
    }
    if (lines.current && lineMaterial.current) {
      for (let edge = 0; edge < buffers.linkCount; edge++) {
        const source = buffers.links[edge * 2] * 3;
        const destination = buffers.links[edge * 2 + 1] * 3;
        const offset = edge * 6;
        buffers.linePositions.set([
          buffers.positions[source], buffers.positions[source + 1], buffers.positions[source + 2],
          buffers.positions[destination], buffers.positions[destination + 1], buffers.positions[destination + 2],
        ], offset);
      }
      lineMaterial.current.opacity = active ? connections * .28 : 0;
      (lines.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
    pointMaterial.current.uniforms.uPixelRatio.value = Math.min(1.35, gl.getPixelRatio());
    pointMaterial.current.uniforms.uOpacity.value = active ? reveal * fade : 0;
    pointMaterial.current.uniforms.uPointScale.value = 1.08 + swellUp * (1 - settle) * .04;
    (points.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });

  return <group>
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buffers.positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[buffers.sizes, 1]} />
        <bufferAttribute attach="attributes-aAlpha" args={[buffers.alphas, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[buffers.colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={pointMaterial}
        vertexShader={FORMATION_VERTEX_SHADER}
        fragmentShader={FORMATION_FRAGMENT_SHADER}
        uniforms={pointUniforms}
        transparent
        depthWrite={false}
        depthTest
        blending={THREE.NormalBlending}
      />
    </points>
    {!reduced && <lineSegments ref={lines} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buffers.linePositions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial ref={lineMaterial} color="#aa7650" transparent opacity={0} depthWrite={false} />
    </lineSegments>}
  </group>;
}

function CutawayCherryBody({ formed, exploded, reduced, texture, canActivate, onExplode }: {
  formed: boolean;
  exploded: boolean;
  reduced: boolean;
  texture: THREE.Texture;
  canActivate: () => boolean;
  onExplode: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const wholeMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const stemMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const appearedAt = useRef<number | null>(null);
  const cherryGeometry = useMemo(makeCherryGeometry, []);
  const stemCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(.02, 2.08, -.02),
    new THREE.Vector3(.04, 2.36, -.02),
    new THREE.Vector3(.18, 2.61, -.06),
    new THREE.Vector3(.29, 2.84, -.1),
  ]), []);

  useEffect(() => () => cherryGeometry.dispose(), [cherryGeometry]);

  useFrame(({ clock }, dt) => {
    if (!group.current || !wholeMaterial.current || !stemMaterial.current) return;
    if (appearedAt.current === null) appearedAt.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - (appearedAt.current ?? clock.elapsedTime);
    const previewFormation = reduced ? 0 : smooth(elapsed, 4.55, 6.18);
    const factor = 1 - Math.exp(-3.15 * Math.min(dt, .033));
    const shellScale = formed ? 1 : .9 + previewFormation * .065;
    group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, shellScale, factor);
    group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, shellScale, factor);
    group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, shellScale, factor);
    const wholeOpacity = !exploded ? (formed ? .98 : previewFormation * .21) : 0;
    wholeMaterial.current.opacity = THREE.MathUtils.lerp(wholeMaterial.current.opacity, wholeOpacity, factor);
    wholeMaterial.current.emissiveIntensity = THREE.MathUtils.lerp(wholeMaterial.current.emissiveIntensity, formed ? .018 : previewFormation * .035, factor);
    stemMaterial.current.opacity = THREE.MathUtils.lerp(stemMaterial.current.opacity, formed ? .9 : 0, factor);
  });

  return <group ref={group} rotation={[0, 0, -.045]}>
    <mesh
      visible={!exploded}
      castShadow
      receiveShadow
      geometry={cherryGeometry}
      onClick={event => {
        event.stopPropagation();
        if (!exploded && canActivate()) onExplode();
      }}
    >
      <meshPhysicalMaterial
        ref={wholeMaterial}
        color="#86151b"
        emissive="#5d0d12"
        emissiveIntensity={.018}
        roughness={.4}
        metalness={.015}
        clearcoat={.28}
        clearcoatRoughness={.5}
        bumpMap={texture}
        bumpScale={.013}
        transparent
        opacity={0}
        depthWrite={formed}
      />
    </mesh>
    <mesh visible={!exploded} castShadow>
      <tubeGeometry args={[stemCurve, 42, .095, 18, false]} />
      <meshStandardMaterial ref={stemMaterial} color="#364329" roughness={.86} transparent opacity={0} />
    </mesh>
    <mesh visible={formed && !exploded} position={[.02, 2.08, .03]} rotation={[Math.PI / 2, 0, 0]} scale={[.34, .34, .15]}>
      <torusGeometry args={[.45, .12, 10, 28]} />
      <meshStandardMaterial color="#541316" roughness={.72} transparent opacity={.68} />
    </mesh>
    <mesh visible={formed && !exploded} position={[-.74, .32, 1.78]} rotation={[0, .1, 0]} scale={[.47, .63, .07]}>
      <sphereGeometry args={[1, 32, 20]} />
      <meshPhysicalMaterial color="#d34d3b" roughness={.35} transparent opacity={.2} depthWrite={false} />
    </mesh>
    <mesh visible={formed && !exploded} position={[0, -2.12, .08]} scale={[.13, .055, .025]}>
      <sphereGeometry args={[1, 24, 12]} />
      <meshStandardMaterial color="#4c1416" roughness={.9} transparent opacity={.7} />
    </mesh>
  </group>;
}

function ShellLayer({ layer, formed, exploded, selected, texture, canActivate, onSelect }: {
  layer: AnatomyLayer;
  formed: boolean;
  exploded: boolean;
  selected: LayerId | null;
  texture: THREE.Texture;
  canActivate: () => boolean;
  onSelect: (layer: LayerId) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const shellMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const faceMaterial = useRef<THREE.MeshPhysicalMaterial>(null);
  const isSelected = selected === layer.id;
  const form = LAYER_FORMS[layer.id as Exclude<LayerId, "bean">];

  useFrame(({ clock }, dt) => {
    if (!group.current || !shellMaterial.current || !faceMaterial.current) return;
    const factor = 1 - Math.exp(-5.2 * Math.min(dt, .033));
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 0, factor);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, exploded ? layer.explodedY : 0, factor);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, .08 + LAYERS.indexOf(layer) * .035, factor);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, exploded ? -.16 : 0, factor);
    const pulse = isSelected ? 1.025 + Math.sin(clock.elapsedTime * 1.8) * .004 : 1;
    group.current.scale.x = THREE.MathUtils.lerp(group.current.scale.x, form[0] * pulse, factor);
    group.current.scale.y = THREE.MathUtils.lerp(group.current.scale.y, form[1] * pulse, factor);
    group.current.scale.z = THREE.MathUtils.lerp(group.current.scale.z, form[2] * pulse, factor);
    const opacity = formed && exploded ? (selected && !isSelected ? .5 : .97) : 0;
    shellMaterial.current.opacity = THREE.MathUtils.lerp(shellMaterial.current.opacity, opacity, factor);
    faceMaterial.current.opacity = THREE.MathUtils.lerp(faceMaterial.current.opacity, opacity * .82, factor);
    shellMaterial.current.emissiveIntensity = THREE.MathUtils.lerp(shellMaterial.current.emissiveIntensity, isSelected ? .14 : .018, factor);
    faceMaterial.current.emissiveIntensity = THREE.MathUtils.lerp(faceMaterial.current.emissiveIntensity, isSelected ? .12 : .018, factor);
  });

  return <group
    ref={group}
    visible={formed && exploded}
    rotation={[0, 0, layer.id === "skin" ? .035 : layer.id === "mucilage" ? -.025 : .012]}
    onPointerDown={() => {
      if (exploded) onSelect(layer.id);
    }}
    onClick={event => {
      event.stopPropagation();
      if (exploded && canActivate()) onSelect(layer.id);
    }}
    onPointerEnter={() => { document.body.style.cursor = "pointer"; }}
    onPointerLeave={() => { document.body.style.cursor = "grab"; }}
  >
    <mesh castShadow receiveShadow>
      <sphereGeometry args={[1, 112, 88, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshPhysicalMaterial
        ref={shellMaterial}
        color={layer.color}
        emissive={layer.color}
        emissiveIntensity={.02}
        roughness={layer.roughness}
        clearcoat={layer.id === "skin" || layer.id === "pulp" ? .3 : .08}
        clearcoatRoughness={.46}
        transmission={layer.transmission ?? 0}
        thickness={layer.transmission ? .28 : 0}
        bumpMap={texture}
        bumpScale={layer.id === "skin" ? .04 : .022}
        side={THREE.DoubleSide}
        transparent
        opacity={0}
        depthWrite={!layer.transmission}
      />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow>
      <torusGeometry args={[.93, layer.id === "skin" ? .075 : layer.id === "pulp" ? .06 : .045, 18, 96]} />
      <meshPhysicalMaterial
        ref={faceMaterial}
        color={layer.cutColor}
        emissive={layer.cutColor}
        emissiveIntensity={.018}
        roughness={layer.id === "pulp" ? .58 : layer.roughness}
        clearcoat={layer.id === "pulp" ? .16 : .04}
        transmission={layer.id === "mucilage" ? .22 : layer.id === "silverskin" ? .08 : 0}
        bumpMap={texture}
        bumpScale={layer.id === "pulp" ? .03 : .014}
        side={THREE.DoubleSide}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  </group>;
}

function CoffeeBean({ formed, exploded, selected, texture, canActivate, onSelect }: {
  formed: boolean;
  exploded: boolean;
  selected: LayerId | null;
  texture: THREE.Texture;
  canActivate: () => boolean;
  onSelect: (layer: LayerId) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const seedGroups = useRef<Array<THREE.Group | null>>([]);
  const materials = useRef<Array<THREE.MeshPhysicalMaterial | null>>([]);
  const grooveMaterials = useRef<Array<THREE.MeshPhysicalMaterial | null>>([]);
  const seedGeometries = useMemo(() => [greenSeedGeometry(1.7, 1), greenSeedGeometry(4.9, -1)], []);
  const seedGrooves = useMemo(() => ([-1, 1] as const).map(side => {
    const innerSide = side === -1 ? 1 : -1;
    const longitudinalCurve: Array<[number, number]> = [
      [-.84, -.055],
      [-.61, .005],
      [-.34, .072],
      [-.06, .042],
      [.22, -.052],
      [.52, -.068],
      [.82, .035],
    ];
    return new THREE.CatmullRomCurve3(longitudinalCurve.map(([y, z]) =>
      new THREE.Vector3(innerSide * (.247 + Math.abs(y) * .068), y, z),
    ));
  }), []);

  useEffect(() => () => seedGeometries.forEach(geometry => geometry.dispose()), [seedGeometries]);

  useFrame(({ clock }, dt) => {
    if (!group.current) return;
    const factor = 1 - Math.exp(-5.2 * Math.min(dt, .033));
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 0, factor);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, exploded ? layerById("bean").explodedY : 0, factor);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, .28, factor);
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, exploded ? -.04 : 0, factor);
    const selectedBean = selected === "bean";
    const scale = selectedBean ? 1.16 + Math.sin(clock.elapsedTime * 1.35) * .006 : 1;
    group.current.scale.setScalar(THREE.MathUtils.lerp(group.current.scale.x, .64 * scale, factor));
    seedGroups.current.forEach((seedGroup, index) => {
      if (!seedGroup) return;
      const side = index === 0 ? -1 : 1;
      const inspectY = selectedBean ? side * Math.PI * .5 : side * .18;
      const inspectX = selectedBean ? side * .5 : side * .34;
      const inspectZ = selectedBean ? .14 : side < 0 ? -.015 : .025;
      seedGroup.position.x = THREE.MathUtils.lerp(seedGroup.position.x, inspectX, factor);
      seedGroup.position.z = THREE.MathUtils.lerp(seedGroup.position.z, inspectZ, factor);
      seedGroup.rotation.y = THREE.MathUtils.lerp(seedGroup.rotation.y, inspectY, factor);
      seedGroup.rotation.z = THREE.MathUtils.lerp(seedGroup.rotation.z, selectedBean ? 0 : side < 0 ? -.045 : .035, factor);
    });
    materials.current.forEach(material => {
      if (!material) return;
      material.opacity = THREE.MathUtils.lerp(material.opacity, formed && exploded ? (selected && !selectedBean ? .5 : .98) : 0, factor);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, selectedBean ? .12 : .012, factor);
    });
    grooveMaterials.current.forEach(material => {
      if (!material) return;
      material.opacity = THREE.MathUtils.lerp(material.opacity, formed && exploded ? (selected && !selectedBean ? .12 : selectedBean ? .88 : .34) : 0, factor);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, selectedBean ? .075 : .008, factor);
    });
  });

  return <group
    ref={group}
    visible={formed && exploded}
    rotation={[-.05, 0, -.035]}
    onPointerDown={() => {
      if (exploded) onSelect("bean");
    }}
    onClick={event => {
      event.stopPropagation();
      if (exploded && canActivate()) onSelect("bean");
    }}
    onPointerEnter={() => { document.body.style.cursor = "pointer"; }}
    onPointerLeave={() => { document.body.style.cursor = "grab"; }}
  >
    {([-1, 1] as const).map((side, index) => <group
      ref={seedGroup => { seedGroups.current[index] = seedGroup; }}
      key={side}
      position={[side * .34, side < 0 ? -.035 : .03, side < 0 ? -.015 : .025]}
      rotation={[side * .018, side * .18, side < 0 ? -.045 : .035]}
      scale={side < 0 ? [.69, 1.14, .49] : [.72, 1.18, .51]}
    >
      <mesh geometry={seedGeometries[index]} castShadow receiveShadow>
        <meshPhysicalMaterial
          ref={material => { materials.current[index] = material; }}
          color={side < 0 ? "#818b5b" : "#939d68"}
          emissive="#657044"
          emissiveIntensity={.012}
          roughness={.68}
          clearcoat={.025}
          clearcoatRoughness={.86}
          bumpMap={texture}
          bumpScale={.055}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh>
        <tubeGeometry args={[seedGrooves[index], 72, .034, 14, false]} />
        <meshPhysicalMaterial
          ref={material => { grooveMaterials.current[index] = material; }}
          color="#59613e"
          emissive="#343a25"
          emissiveIntensity={.008}
          roughness={.9}
          transparent
          opacity={0}
        />
      </mesh>
    </group>)}
  </group>;
}

function AnatomyWorld({ active, formed, exploded, selected, reduced, onExplode, onSelect }: {
  active: boolean;
  formed: boolean;
  exploded: boolean;
  selected: LayerId | null;
  reduced: boolean;
  onExplode: () => void;
  onSelect: (layer: LayerId) => void;
}) {
  const root = useRef<THREE.Group>(null);
  const texture = useMemo(makeSurfaceTexture, []);
  const targetQuaternion = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(-.07, -.18, -.08)));
  const dragAxis = useMemo(() => new THREE.Vector3(), []);
  const dragQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const drag = useRef({ active: false, moved: false, x: 0, y: 0 });

  useEffect(() => () => {
    texture.dispose();
    document.body.style.cursor = "";
  }, [texture]);

  useEffect(() => {
    if (selected !== "bean") return;
    targetQuaternion.current.setFromEuler(new THREE.Euler(.05, .04, -.08));
  }, [selected]);

  useFrame((_, dt) => {
    if (!root.current) return;
    const factor = reduced ? 1 : 1 - Math.exp(-4.8 * Math.min(dt, .033));
    root.current.quaternion.slerp(targetQuaternion.current, factor);
    const targetScale = exploded ? .75 : 1;
    root.current.scale.x = THREE.MathUtils.lerp(root.current.scale.x, targetScale, factor);
    root.current.scale.y = THREE.MathUtils.lerp(root.current.scale.y, targetScale, factor);
    root.current.scale.z = THREE.MathUtils.lerp(root.current.scale.z, targetScale, factor);
  });

  const beginDrag = (event: ThreeEvent<PointerEvent>) => {
    drag.current = { active: true, moved: false, x: event.clientX, y: event.clientY };
    const target = event.target as unknown as { setPointerCapture?: (pointerId: number) => void };
    target.setPointerCapture?.(event.pointerId);
    document.body.style.cursor = "grabbing";
  };
  const rotateDrag = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active) return;
    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 2) drag.current.moved = true;
    if (distance > 0) {
      dragAxis.set(dy, dx, 0).normalize();
      dragQuaternion.setFromAxisAngle(dragAxis, distance * .0095);
      targetQuaternion.current.premultiply(dragQuaternion).normalize();
    }
    drag.current.x = event.clientX;
    drag.current.y = event.clientY;
  };
  const endDrag = () => {
    drag.current.active = false;
    document.body.style.cursor = "grab";
  };
  const canActivate = () => !drag.current.moved;

  return <>
    <fog attach="fog" args={["#050504", 9, 19]} />
    <ambientLight intensity={.92} color="#c5c8aa" />
    <directionalLight position={[4.5, 6, 7]} intensity={3.35} color="#ffe2bd" castShadow />
    <directionalLight position={[-5, 1, 3]} intensity={1.2} color="#7f9a69" />
    <pointLight position={[0, -3, 4]} intensity={12} distance={11} color="#b84f2a" />
    <mesh
      position={[0, 0, -5]}
      onPointerDown={beginDrag}
      onPointerMove={rotateDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <planeGeometry args={[20, 14]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
    </mesh>
    <group
      ref={root}
      position={[0, exploded ? .02 : 0, 0]}
      rotation={[-.07, -.18, -.08]}
      scale={[1, 1, 1]}
    >
      <FormationMatter active={active} reduced={reduced} />
      <CutawayCherryBody
        formed={formed}
        exploded={exploded}
        reduced={reduced}
        texture={texture}
        canActivate={canActivate}
        onExplode={onExplode}
      />
      {LAYERS.filter(layer => layer.id !== "bean").map(layer => <ShellLayer
        key={layer.id}
        layer={layer}
        formed={formed}
        exploded={exploded}
        selected={selected}
        texture={texture}
        canActivate={canActivate}
        onSelect={onSelect}
      />)}
      <CoffeeBean
        formed={formed}
        exploded={exploded}
        selected={selected}
        texture={texture}
        canActivate={canActivate}
        onSelect={onSelect}
      />
    </group>
  </>;
}

export default function ChapterOne({
  active,
  reduced,
  onExplore,
  onNext,
}: {
  active: boolean;
  reduced: boolean;
  onExplore: () => void;
  onNext: () => void;
}) {
  const [formed, setFormed] = useState(false);
  const [exploded, setExploded] = useState(false);
  const [selected, setSelected] = useState<LayerId | null>(null);
  const selectedLayer = selected ? layerById(selected) : null;

  useEffect(() => {
    if (!active) return;
    setFormed(reduced);
    setExploded(false);
    setSelected(null);
    const timer = window.setTimeout(() => {
      setFormed(true);
    }, reduced ? 120 : 6300);
    return () => window.clearTimeout(timer);
  }, [active, reduced]);

  const toggleExploded = () => {
    setExploded(current => {
      const next = !current;
      setSelected(null);
      return next;
    });
  };

  const moveSelection = (direction: number) => {
    if (!formed) return;
    const current = Math.max(0, LAYERS.findIndex(layer => layer.id === selected));
    const next = (current + direction + LAYERS.length) % LAYERS.length;
    setSelected(LAYERS[next].id);
  };

  return <section
    className={`anatomy-chapter ${active ? "is-active" : ""} ${formed ? "is-formed" : "is-forming"} ${exploded ? "is-exploded" : "is-whole"}`}
    aria-hidden={!active}
    aria-label="Chương 01 - Giải phẫu quả cà phê"
    tabIndex={active ? 0 : -1}
    onKeyDown={event => {
      if (event.key === "ArrowRight") moveSelection(1);
      if (event.key === "ArrowLeft") moveSelection(-1);
    }}
  >
    <div className="anatomy-topbar">
      <span>CREMA LAB</span>
      <p>CHƯƠNG 01 <b>—</b> NGUỒN GỐC</p>
      <div className="anatomy-top-actions">
        <button onClick={onExplore} tabIndex={active ? 0 : -1}>Khám phá Crema Lab ↗</button>
        <button className="anatomy-next" onClick={onNext} disabled={!formed} tabIndex={active && formed ? 0 : -1}>Chương 02 · Sơ chế →</button>
      </div>
    </div>

    <div className="anatomy-canvas" aria-hidden="true">
      {active && <Canvas
        shadows
        camera={{ position: [0, 0, 10.5], fov: 39, near: .1, far: 28 }}
        dpr={[1, 1.35]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <AnatomyWorld
          active={active}
          formed={formed}
          exploded={exploded}
          selected={selected}
          reduced={reduced}
          onExplode={() => {
            setExploded(true);
            setSelected(null);
          }}
          onSelect={setSelected}
        />
      </Canvas>}
    </div>

    <div className="anatomy-formation" aria-hidden="true">
      <span>PHÂN TÁN</span><span>HỘI TỤ</span><span>LIÊN KẾT</span><b>QUẢ CÀ PHÊ</b>
    </div>

    <div className="anatomy-copy">
      <p className="anatomy-eyebrow">MỘT QUẢ · SÁU LỚP SỐNG</p>
      <h2>BÊN TRONG<br />MỘT QUẢ CÀ PHÊ</h2>
      <p>Tiềm năng hương vị bắt đầu bên trong một cấu trúc sống.</p>
      <button className="anatomy-toggle" onClick={toggleExploded} disabled={!formed} tabIndex={active ? 0 : -1} aria-pressed={exploded}>
        {exploded ? "GHÉP LẠI QUẢ CÀ PHÊ" : "MỞ CẤU TRÚC"}<span>{exploded ? "↙" : "↗"}</span>
      </button>
      <small>{selected === "bean"
        ? "HAI HẠT ĐANG MỞ MẶT RÃNH · KÉO TỰ DO THEO MỌI HƯỚNG"
        : exploded ? "KÉO TỰ DO THEO MỌI HƯỚNG · BẤM TRỰC TIẾP VÀO TỪNG LỚP" : "KÉO TỰ DO THEO MỌI HƯỚNG · BẤM VÀO QUẢ ĐỂ MỞ"}</small>
    </div>

    <div className="anatomy-annotation" data-layer={selected ?? "whole"} aria-hidden="true"><i /><span /></div>

    <div className="anatomy-detail" aria-live="polite">
      {selectedLayer ? <>
        <span>{selectedLayer.number}</span>
        <p>GIẢI PHẪU QUẢ CÀ PHÊ</p>
        <h3>{selectedLayer.label}</h3>
        <div>{selectedLayer.body}</div>
      </> : <>
        <span>06</span>
        <p>CẤU TRÚC ĐÃ MỞ</p>
        <h3>Chọn một lớp</h3>
        <div>Bấm trực tiếp vào từng lớp trên mô hình để xem tên, cấu tạo và chức năng.</div>
      </>}
    </div>

    <nav className="anatomy-sr-controls" aria-label="Sáu lớp giải phẫu của quả cà phê">
      {LAYERS.map(layer => <button
        key={layer.id}
        onClick={() => setSelected(layer.id)}
        disabled={!exploded}
        tabIndex={active && exploded ? 0 : -1}
        aria-current={selected === layer.id ? "step" : undefined}
      >{layer.number} · {layer.label}</button>)}
    </nav>
  </section>;
}
