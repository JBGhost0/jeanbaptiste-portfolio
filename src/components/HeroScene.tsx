"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Générateur pseudo-aléatoire (résultat identique à chaque rendu)
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Helix({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);

  const { positions, colors } = useMemo(() => {
    const rand = rng(42);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const lime = new THREE.Color("#b6ff3c");
    const amber = new THREE.Color("#ffb547");
    const turns = 3, height = 7, radius = 1.3;

    for (let i = 0; i < count; i++) {
      const t = rand();
      const a = t * turns * Math.PI * 2;
      const y = (t - 0.5) * height;
      const kind = i % 3; // 0 et 1 = brins, 2 = barreaux
      let x: number, z: number;
      if (kind === 2) {
        const k = rand() * 2 - 1;
        x = Math.cos(a) * radius * k;
        z = Math.sin(a) * radius * k;
      } else {
        const ang = a + (kind === 1 ? Math.PI : 0);
        x = Math.cos(ang) * radius;
        z = Math.sin(ang) * radius;
      }
      const n = 0.06;
      positions[i * 3] = x + (rand() - 0.5) * n;
      positions[i * 3 + 1] = y + (rand() - 0.5) * n;
      positions[i * 3 + 2] = z + (rand() - 0.5) * n;

      const c = kind === 0 ? lime : kind === 1 ? amber : lime.clone().lerp(amber, rand());
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const scroll = window.scrollY;
    const wide = state.viewport.width > 7;
    g.rotation.y += delta * 0.3;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -state.pointer.y * 0.5, 3, delta);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, 0.3 + state.pointer.x * 0.3, 3, delta);
    g.position.x = THREE.MathUtils.damp(g.position.x, (wide ? 2.4 : 0) + state.pointer.x * 0.4, 3, delta);
    g.position.y = scroll * 0.004;
    g.scale.setScalar(Math.max(0.4, 1 - scroll * 0.0006));
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

export default function HeroScene() {
  // Moins de particules sur petit écran ou PC modeste
  const count = useMemo(() => {
    const weak = navigator.hardwareConcurrency <= 4 || window.innerWidth < 768;
    return weak ? 900 : 2200;
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 7], fov: 50 }}
    >
      <Helix count={count} />
    </Canvas>
  );
}