"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Atom = { p: THREE.Vector3; r: number; c: string };
type BondData = { pos: THREE.Vector3; quat: THREE.Quaternion; len: number };

function buildMolecule() {
  const atoms: Atom[] = [];
  const bonds: BondData[] = [];
  const ring: THREE.Vector3[] = [];

  const addBond = (a: THREE.Vector3, b: THREE.Vector3) => {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    const pos = a.clone().add(b).multiplyScalar(0.5);
    bonds.push({ pos, quat, len });
  };

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const p = new THREE.Vector3(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0);
    ring.push(p);
    atoms.push({ p, r: 0.28, c: "#b6ff3c" });
  }

  for (let i = 0; i < 6; i++) {
    addBond(ring[i], ring[(i + 1) % 6]);
    const a = (i * Math.PI) / 3;
    const p = new THREE.Vector3(
      Math.cos(a) * 2.3,
      Math.sin(a) * 2.3,
      i % 2 ? 0.6 : -0.6
    );
    const big = i % 3 === 0;
    atoms.push({ p, r: big ? 0.34 : 0.18, c: big ? "#ffb547" : "#e8efe9" });
    addBond(ring[i], p);
  }

  return { atoms, bonds };
}

function Molecule() {
  const group = useRef<THREE.Group>(null);
  const { atoms, bonds } = useMemo(buildMolecule, []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.45;
    g.rotation.x = THREE.MathUtils.damp(
      g.rotation.x,
      -state.pointer.y * 0.7,
      3,
      delta
    );
  });

  return (
    <group ref={group}>
      {atoms.map((a, i) => (
        <mesh key={`a${i}`} position={a.p}>
          <sphereGeometry args={[a.r, 16, 16]} />
          <meshStandardMaterial color={a.c} roughness={0.35} metalness={0.2} />
        </mesh>
      ))}
      {bonds.map((b, i) => (
        <mesh key={`b${i}`} position={b.pos} quaternion={b.quat}>
          <cylinderGeometry args={[0.05, 0.05, b.len, 6]} />
          <meshStandardMaterial color="#8a9a8f" />
        </mesh>
      ))}
    </group>
  );
}

export default function Molecule3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 7], fov: 45 }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 4, 5]} intensity={2.2} />
      <Molecule />
    </Canvas>
  );
}