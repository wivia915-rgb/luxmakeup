"use client";

import { ContactShadows, Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import type { Group } from "three";
import type { Motif } from "@/lib/products";

type ProductViewerProps = {
  motif: Motif;
  swatch: string;
  name: string;
};

export function ProductViewer({ motif, swatch, name }: ProductViewerProps) {
  const angleRef = useRef(0.5);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const reduced = useRef(false);
  const labelRef = useRef<HTMLSpanElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reduced.current = media.matches;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!dragging.current && !reduced.current) {
        angleRef.current += delta * 0.45;
      }
      const degrees = normalizeDegrees(angleRef.current);
      if (labelRef.current) labelRef.current.textContent = `${degrees}°`;
      if (sliderRef.current && document.activeElement !== sliderRef.current) {
        sliderRef.current.value = String(degrees);
      }
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="border border-gold/25 bg-card">
      <div
        ref={stageRef}
        className="relative h-[420px] cursor-grab touch-none active:cursor-grabbing md:h-[520px]"
        onPointerDown={(event) => {
          dragging.current = true;
          lastX.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          const delta = event.clientX - lastX.current;
          lastX.current = event.clientX;
          angleRef.current += delta * 0.015;
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        role="img"
        aria-label={`${name} 360 degree model. Drag horizontally to rotate.`}
      >
        <Canvas
          aria-hidden
          camera={{ position: [0, 0.15, 4.4], fov: 34 }}
          dpr={[1, 1.6]}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <ViewerScene motif={motif} swatch={swatch} angleRef={angleRef} />
        </Canvas>
        <p className="pointer-events-none absolute bottom-4 left-4 type-caption text-gold-bright">Drag to turn</p>
      </div>
      <div className="border-t border-gold/20 px-4 py-4">
        <label className="type-caption flex items-center justify-between gap-3 text-foreground/80">
          <span>
            Rotation <span ref={labelRef}>29°</span>
          </span>
          <span>360°</span>
        </label>
        <input
          ref={sliderRef}
          type="range"
          min={0}
          max={360}
          defaultValue={29}
          aria-label={`${name} rotation in degrees`}
          className="mt-3 w-full accent-[#D4AF37]"
          onChange={(event) => {
            angleRef.current = (Number(event.target.value) * Math.PI) / 180;
          }}
        />
      </div>
    </div>
  );
}

function ViewerScene({
  motif,
  swatch,
  angleRef,
}: {
  motif: Motif;
  swatch: string;
  angleRef: RefObject<number>;
}) {
  const group = useRef<Group>(null);

  useFrame(() => {
    if (group.current) group.current.rotation.y = angleRef.current;
  });

  return (
    <>
      <ambientLight intensity={0.45} color="#F8F8F8" />
      <directionalLight position={[3, 4, 4]} intensity={1.5} color="#FFF8EE" />
      <pointLight position={[-2.2, 1.2, 2]} intensity={8} color="#E5C158" distance={10} decay={2} />
      <Environment resolution={256} environmentIntensity={0.85}>
        <Lightformer form="rect" intensity={1.4} color="#F8F8F8" position={[0, 2.4, 2]} scale={[7, 1.4, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#E5C158" position={[-3, 0.4, -1]} scale={[1.4, 4, 1]} />
      </Environment>
      <group ref={group}>
        <MotifMesh motif={motif} swatch={swatch} />
      </group>
      <ContactShadows position={[0, -1.35, 0]} opacity={0.4} scale={5} blur={2.4} far={2.2} color="#000000" frames={1} />
    </>
  );
}

function MotifMesh({ motif, swatch }: { motif: Motif; swatch: string }) {
  const gold = { color: "#D4AF37", metalness: 1, roughness: 0.2 } as const;

  if (motif === "tube") {
    return (
      <group>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.32, 0.36, 1.7, 40]} />
          <meshStandardMaterial color={swatch} metalness={0.35} roughness={0.32} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <cylinderGeometry args={[0.2, 0.24, 0.32, 32]} />
          <meshStandardMaterial {...gold} />
        </mesh>
      </group>
    );
  }

  if (motif === "compact") {
    return (
      <group>
        <mesh rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 0.28, 64]} />
          <meshStandardMaterial color="#1A1A1A" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.16, 0.12]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.06, 64]} />
          <meshStandardMaterial color={swatch} metalness={0.25} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, -0.55]}>
          <boxGeometry args={[0.28, 0.08, 0.16]} />
          <meshStandardMaterial {...gold} />
        </mesh>
      </group>
    );
  }

  if (motif === "jar") {
    return (
      <group>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.22, 48]} />
          <meshStandardMaterial {...gold} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.85, 0.9, 1.35, 48]} />
          <meshPhysicalMaterial color="#f4efe6" roughness={0.08} metalness={0} transmission={0.75} thickness={0.6} transparent />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.7, 0.74, 0.7, 48]} />
          <meshStandardMaterial color={swatch} metalness={0.15} roughness={0.35} />
        </mesh>
      </group>
    );
  }

  if (motif === "palette") {
    return (
      <group>
        <RoundedBox args={[1.9, 0.18, 1.4]} radius={0.04} smoothness={4}>
          <meshStandardMaterial color="#1A1A1A" metalness={0.45} roughness={0.4} />
        </RoundedBox>
        <mesh position={[-0.45, 0.12, -0.28]}>
          <boxGeometry args={[0.42, 0.06, 0.42]} />
          <meshStandardMaterial color={swatch} metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0.1, 0.12, -0.28]}>
          <boxGeometry args={[0.42, 0.06, 0.42]} />
          <meshStandardMaterial color="#E5C158" metalness={0.55} roughness={0.3} />
        </mesh>
        <mesh position={[0.45, 0.12, 0.28]}>
          <boxGeometry args={[0.42, 0.06, 0.42]} />
          <meshStandardMaterial color="#D4AF37" metalness={1} roughness={0.22} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.42, 32]} />
        <meshStandardMaterial {...gold} />
      </mesh>
      <RoundedBox args={[1.05, 1.55, 0.55]} radius={0.08} smoothness={5}>
        <meshPhysicalMaterial
          color="#f6f1e6"
          roughness={0.08}
          transmission={0.82}
          thickness={0.8}
          clearcoat={1}
          transparent
        />
      </RoundedBox>
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.78, 0.7, 0.36]} />
        <meshStandardMaterial color={swatch} metalness={0.2} roughness={0.3} transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function normalizeDegrees(radians: number) {
  const degrees = (radians * 180) / Math.PI;
  return Math.round(((degrees % 360) + 360) % 360);
}
