"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type Branch = { side: 1 | -1; count: number; id: string } | null;

type Atom = { p: THREE.Vector3; r: number; c: string };
type BondData = { pos: THREE.Vector3; quat: THREE.Quaternion; len: number };

const UP = new THREE.Vector3(0, 1, 0);
const tmpDir = new THREE.Vector3();
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

// Place un cylindre de longueur 1 entre deux points
function setBond(m: THREE.Mesh | null, a: THREE.Vector3, b: THREE.Vector3) {
  if (!m) return;
  tmpDir.subVectors(b, a);
  const len = tmpDir.length();
  if (len < 0.001) { m.visible = false; return; }
  m.visible = true;
  m.position.addVectors(a, b).multiplyScalar(0.5);
  m.scale.set(1, len, 1);
  m.quaternion.setFromUnitVectors(UP, tmpDir.divideScalar(len));
}

function buildMolecule() {
  const atoms: Atom[] = [];
  const bonds: BondData[] = [];
  const ring: THREE.Vector3[] = [];

  const addBond = (a: THREE.Vector3, b: THREE.Vector3) => {
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize());
    bonds.push({ pos: a.clone().add(b).multiplyScalar(0.5), quat, len });
  };

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const p = new THREE.Vector3(Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0);
    ring.push(p);
    atoms.push({ p, r: 0.28, c: "#7fd3ff" });
  }
  for (let i = 0; i < 6; i++) {
    addBond(ring[i], ring[(i + 1) % 6]);
    const a = (i * Math.PI) / 3;
    const p = new THREE.Vector3(Math.cos(a) * 2.3, Math.sin(a) * 2.3, i % 2 ? 0.6 : -0.6);
    const big = i % 3 === 0;
    atoms.push({ p, r: big ? 0.34 : 0.18, c: big ? "#dfe7f2" : "#eef3f9" });
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
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.6, 3, delta);
  });

  return (
    <group ref={group} scale={0.72}>
      {atoms.map((a, i) => (
        <mesh key={`a${i}`} position={a.p}>
          <sphereGeometry args={[a.r, 16, 16]} />
          <meshStandardMaterial color={a.c} roughness={0.3} metalness={0.35} />
        </mesh>
      ))}
      {bonds.map((b, i) => (
        <mesh key={`b${i}`} position={b.pos} quaternion={b.quat}>
          <cylinderGeometry args={[0.05, 0.05, b.len, 6]} />
          <meshStandardMaterial color="#8e9bb0" />
        </mesh>
      ))}
    </group>
  );
}

// Branche : liaison molécule -> atome central -> sous-compétences
function BranchView({ side, count }: { side: number; count: number }) {
  const color = side < 0 ? "#7fd3ff" : "#dfe7f2";
  const progress = useRef(0);
  const hub = useRef<THREE.Mesh>(null);
  const subs = useRef<(THREE.Mesh | null)[]>([]);
  const bonds = useRef<(THREE.Mesh | null)[]>([]);

  const { dock, hubT, subsT } = useMemo(
    () => ({
      dock: new THREE.Vector3(side * 1.85, 0, 0),
      hubT: new THREE.Vector3(side * 2.55, 0, 0),
      subsT: Array.from(
        { length: count },
        (_, k) =>
          new THREE.Vector3(side * (3.3 + (k % 2) * 0.25), (k - (count - 1) / 2) * 1.15, k % 2 ? 0.5 : -0.5)
      ),
    }),
    [side, count]
  );
  const cur = useMemo(
    () => ({ hub: new THREE.Vector3(), subs: Array.from({ length: count }, () => new THREE.Vector3()) }),
    [count]
  );

  useFrame((_, delta) => {
    progress.current = Math.min(1, progress.current + delta * 0.7);
    const p = progress.current;

    const e1 = ease(clamp(p * 2.2));
    cur.hub.lerpVectors(dock, hubT, e1);
    if (hub.current) {
      hub.current.position.copy(cur.hub);
      hub.current.scale.setScalar(Math.max(e1, 0.001));
    }
    setBond(bonds.current[0], dock, cur.hub);

    subsT.forEach((t, k) => {
      const e = ease(clamp((p - 0.35 - k * 0.1) / 0.5));
      cur.subs[k].lerpVectors(cur.hub, t, e);
      const m = subs.current[k];
      if (m) {
        m.position.copy(cur.subs[k]);
        m.scale.setScalar(Math.max(e, 0.001));
      }
      setBond(bonds.current[k + 1], cur.hub, cur.subs[k]);
    });
  });

  return (
    <group>
      <mesh position={dock}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={hub} scale={0.001}>
        <sphereGeometry args={[0.34, 18, 18]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.4} />
      </mesh>
      {Array.from({ length: count + 1 }, (_, k) => (
        <mesh key={`bd${k}`} ref={(m) => { bonds.current[k] = m; }} visible={false}>
          <cylinderGeometry args={[0.045, 0.045, 1, 6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      {subsT.map((_, k) => (
        <mesh key={`s${k}`} ref={(m) => { subs.current[k] = m; }} scale={0.001}>
          <sphereGeometry args={[0.3, 18, 18]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.3} />
          <Html center style={{ pointerEvents: "none" }}>
            <div style={{ color: "#050810", fontWeight: 700, fontSize: 11 }}>{k + 1}</div>
          </Html>
        </mesh>
      ))}
    </group>
  );
}

export default function Molecule3D({ branch = null }: { branch?: Branch }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 11], fov: 45 }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 4, 6]} intensity={2.2} />
      <Molecule />
      {branch && <BranchView key={branch.id} side={branch.side} count={branch.count} />}
    </Canvas>
  );
}