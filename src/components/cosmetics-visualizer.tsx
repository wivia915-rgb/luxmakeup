"use client";

import { ContactShadows, Environment, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { DoubleSide, MathUtils, type Group } from "three";

function useCompactViewport() {
  const [compact, setCompact] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return compact;
}

function FragranceBottle() {
  const group = useRef<Group>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    const bottle = group.current;
    if (!bottle) return;

    const targetY = 0.42 + pointer.x * 0.72;
    const targetX = pointer.y * -0.2;
    bottle.rotation.y = MathUtils.damp(bottle.rotation.y, targetY, 3.6, delta);
    bottle.rotation.x = MathUtils.damp(bottle.rotation.x, targetX, 3.6, delta);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[1.16, 1.78, 0.58]} radius={0.1} smoothness={6} castShadow>
        <meshPhysicalMaterial
          color="#f6f1e6"
          roughness={0.06}
          metalness={0}
          transmission={0.9}
          thickness={1.15}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.06}
          attenuationColor="#f3e6c4"
          attenuationDistance={0.85}
          envMapIntensity={1.35}
          transparent
          side={DoubleSide}
        />
      </RoundedBox>

      <RoundedBox args={[0.96, 1.08, 0.4]} radius={0.08} smoothness={4} position={[0, -0.28, 0]}>
        <meshPhysicalMaterial
          color="#E5C158"
          roughness={0.22}
          metalness={0.18}
          clearcoat={0.7}
          transparent
          opacity={0.78}
          envMapIntensity={1.1}
        />
      </RoundedBox>

      <mesh position={[0, -0.02, 0.3]}>
        <boxGeometry args={[0.56, 0.7, 0.02]} />
        <meshStandardMaterial color="#141414" roughness={0.46} metalness={0.22} />
      </mesh>
      <mesh position={[0, -0.02, 0.316]}>
        <ringGeometry args={[0.16, 0.185, 64]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.24} metalness={1} />
      </mesh>

      <mesh position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.34, 48]} />
        <meshPhysicalMaterial
          color="#f6f1e6"
          roughness={0.05}
          metalness={0}
          transmission={0.92}
          thickness={0.4}
          ior={1.45}
          clearcoat={1}
          transparent
        />
      </mesh>

      <mesh position={[0, 1.24, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.07, 48]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={1} />
      </mesh>
      <mesh position={[0, 1.52, 0]}>
        <cylinderGeometry args={[0.25, 0.27, 0.48, 48]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.18} metalness={1} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[0, 1.8, 0]}>
        <sphereGeometry args={[0.065, 24, 24]} />
        <meshStandardMaterial color="#E5C158" roughness={0.16} metalness={1} />
      </mesh>
    </group>
  );
}

function useReducedMotionPref() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduce;
}

function AtelierScene() {
  const compact = useCompactViewport();
  const reduce = useReducedMotionPref();
  const origin: [number, number, number] = compact ? [0, -0.4, 0] : [1.15, -0.02, 0];

  return (
    <>
      <ambientLight intensity={0.42} color="#F8F8F8" />
      <directionalLight position={[3.2, 4.2, 4.5]} intensity={1.45} color="#FFF8EE" />
      <directionalLight position={[-3.5, 1.4, -2.5]} intensity={0.55} color="#E5C158" />
      <pointLight position={[-2.4, 1.1, 2.2]} intensity={10} color="#E5C158" distance={11} decay={2} />
      <pointLight position={[2.2, -0.6, 2.8]} intensity={4} color="#F8F8F8" distance={9} decay={2} />

      <Environment resolution={256} environmentIntensity={0.9}>
        <Lightformer form="rect" intensity={1.5} color="#F8F8F8" position={[0, 2.6, 2]} scale={[8, 1.6, 1]} />
        <Lightformer form="rect" intensity={0.65} color="#E5C158" position={[-3.6, 0.4, -1]} scale={[1.6, 4.5, 1]} />
        <Lightformer form="rect" intensity={0.85} color="#F8F8F8" position={[3.8, 0.8, 1.5]} scale={[1.8, 2.8, 1]} />
      </Environment>

      <group position={origin} scale={compact ? 0.9 : 1}>
        <FragranceBottle />
      </group>

      <Sparkles
        count={42}
        scale={[2.6, 3.4, 1.5]}
        size={2.4}
        speed={reduce ? 0 : 0.35}
        opacity={0.75}
        color="#E5C158"
        noise={0.55}
        position={[origin[0], origin[1] + 0.35, 0]}
      />

      <ContactShadows
        position={[origin[0], origin[1] - 1.08, 0]}
        opacity={0.45}
        scale={6}
        blur={2.5}
        far={2.4}
        color="#000000"
        frames={1}
        resolution={256}
      />
    </>
  );
}

export function CosmeticsVisualizer() {
  return (
    <Canvas
      aria-hidden
      className="h-full w-full"
      camera={{ position: [0, 0.15, 5.15], fov: 32 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <AtelierScene />
    </Canvas>
  );
}
