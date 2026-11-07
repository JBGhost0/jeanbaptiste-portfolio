"use client";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const N = 36;      // paires de bases
const TURNS = 3.2;
const H = 6.4;
const R = 1.2;
const MAX = 360;   // particules max
const PALETTE = ["#7fd3ff", "#dfe7f2", "#ffffff", "#5fb8ea"].map((c) => new THREE.Color(c));
const UP = new THREE.Vector3(0, 1, 0);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function useParticles() {
  return useMemo(() => {
    const pos = new Float32Array(MAX * 3);
    const col = new Float32Array(MAX * 3);
    const base = new Float32Array(MAX * 3);
    const vel = new Float32Array(MAX * 3);
    const life = new Float32Array(MAX);
    let head = 0;
    const burst = (p: THREE.Vector3, n: number) => {
      for (let k = 0; k < n; k++) {
        const i = head++ % MAX;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const sp = 1.2 + Math.random() * 2.8;
        vel[i * 3] = Math.sin(ph) * Math.cos(th) * sp;
        vel[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * sp;
        vel[i * 3 + 2] = Math.cos(ph) * sp;
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
        const c = PALETTE[(Math.random() * PALETTE.length) | 0];
        base[i * 3] = c.r;
        base[i * 3 + 1] = c.g;
        base[i * 3 + 2] = c.b;
        life[i] = 1;
      }
    };
    return { pos, col, base, vel, life, burst };
  }, []);
}

function Helix() {
  const spheres = useRef<THREE.InstancedMesh>(null);
  const cubes = useRef<THREE.InstancedMesh>(null);
  const rungs = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const pos = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const one = new THREE.Vector3(1, 1, 1);
    const ident = new THREE.Quaternion();

    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const a = t * TURNS * Math.PI * 2;
      const y = (t - 0.5) * H;

      pos.set(Math.cos(a) * R, y, Math.sin(a) * R);
      m.compose(pos, ident, one);
      spheres.current?.setMatrixAt(i, m);

      pos.set(-Math.cos(a) * R, y, -Math.sin(a) * R);
      q.setFromEuler(e.set(a, a * 0.7, 0));
      m.compose(pos, q, one);
      cubes.current?.setMatrixAt(i, m);

      dir.set(Math.cos(a), 0, Math.sin(a));
      q.setFromUnitVectors(UP, dir);
      pos.set(0, y, 0);
      m.compose(pos, q, new THREE.Vector3(1, R * 2, 1));
      rungs.current?.setMatrixAt(i, m);
    }
    for (const r of [spheres, cubes, rungs]) {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <group>
      <instancedMesh ref={spheres} args={[undefined, undefined, N]} frustumCulled={false}>
        <sphereGeometry args={[0.17, 14, 14]} />
        <meshStandardMaterial color="#7fd3ff" roughness={0.25} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={cubes} args={[undefined, undefined, N]} frustumCulled={false}>
        <boxGeometry args={[0.24, 0.24, 0.24]} />
        <meshStandardMaterial color="#dfe7f2" roughness={0.3} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={rungs} args={[undefined, undefined, N]} frustumCulled={false}>
        <cylinderGeometry args={[0.018, 0.018, 1, 5]} />
        <meshStandardMaterial color="#8e9bb0" transparent opacity={0.7} />
      </instancedMesh>
    </group>
  );
}

function Orbit({ radius, tilt, speed }: { radius: number; tilt: [number, number, number]; speed: number }) {
  const spin = useRef<THREE.Group>(null);
  useFrame((_, d) => {
    if (spin.current) spin.current.rotation.z += d * speed;
  });
  return (
    <group rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, 0.01, 6, 80]} />
        <meshBasicMaterial color="#7fd3ff" transparent opacity={0.35} />
      </mesh>
      <group ref={spin}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#ffffff" emissive="#7fd3ff" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function Scene() {
  const rig = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const geo = useRef<THREE.BufferGeometry>(null);
  const ps = useParticles();
  const rot = useRef({ x: 0.2, y: 0 });
  const spin = useRef(0);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const pulse = useRef(0);

  useFrame((state, delta) => {
    const r = rot.current;
    if (!drag.current) {
      r.y += (0.25 + spin.current) * delta;
      spin.current *= Math.exp(-2.2 * delta);
      r.x += (0.2 - r.x) * Math.min(1, delta * 1.5);
    }
    pulse.current *= Math.exp(-4 * delta);
    if (rig.current) {
      rig.current.rotation.set(r.x, r.y, 0);
      rig.current.scale.setScalar(1 + pulse.current * 0.08);
    }
    light.current?.position.set(state.pointer.x * 5, state.pointer.y * 3, 4);

    // particules
    const { pos, col, base, vel, life } = ps;
    let touched = false;
    for (let i = 0; i < MAX; i++) {
      const l = life[i];
      if (l <= 0) continue;
      touched = true;
      const k = i * 3;
      const damp = Math.max(0, 1 - 1.6 * delta);
      vel[k] *= damp;
      vel[k + 1] = vel[k + 1] * damp - 0.6 * delta;
      vel[k + 2] *= damp;
      pos[k] += vel[k] * delta;
      pos[k + 1] += vel[k + 1] * delta;
      pos[k + 2] += vel[k + 2] * delta;
      const nl = l - delta * 0.7;
      if (nl <= 0) {
        life[i] = 0;
        col[k] = col[k + 1] = col[k + 2] = 0;
      } else {
        life[i] = nl;
        col[k] = base[k] * nl;
        col[k + 1] = base[k + 1] * nl;
        col[k + 2] = base[k + 2] * nl;
      }
    }
    if (touched && geo.current) {
      geo.current.attributes.position.needsUpdate = true;
      geo.current.attributes.color.needsUpdate = true;
    }
  });

  const down = (e: ThreeEvent<PointerEvent>) => {
    drag.current = { x: e.clientX, y: e.clientY };
    pulse.current = 1;
    ps.burst(e.point, 45);
  };
  const move = (e: ThreeEvent<PointerEvent>) => {
    const d = drag.current;
    if (d) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.x = e.clientX;
      d.y = e.clientY;
      rot.current.y += dx * 0.012;
      rot.current.x = clamp(rot.current.x + dy * 0.008, -0.8, 0.8);
      spin.current = clamp(dx * 0.6, -6, 6);
      if (Math.random() < 0.6) ps.burst(e.point, 3);
    } else if (e.pointerType === "mouse" && Math.random() < 0.12) {
      ps.burst(e.point, 1);
    }
  };
  const end = () => { drag.current = null; };

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 6]} intensity={1.8} />
      <pointLight ref={light} color="#7fd3ff" intensity={30} distance={14} />

      {/* plan invisible qui capte le doigt / la souris */}
      <mesh onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerOut={end} onPointerCancel={end}>
        <planeGeometry args={[30, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <group ref={rig}>
        <Helix />
        <Orbit radius={2.9} tilt={[1.2, 0.3, 0]} speed={1.1} />
        <Orbit radius={2.5} tilt={[-0.5, 0.9, 0.6]} speed={-1.5} />
      </group>

      <points frustumCulled={false}>
        <bufferGeometry ref={geo}>
          <bufferAttribute attach="attributes-position" args={[ps.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[ps.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </>
  );
}

export default function Lab3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 9], fov: 45 }}
      style={{ touchAction: "pan-y" }}
    >
      <Scene />
    </Canvas>
  );
}