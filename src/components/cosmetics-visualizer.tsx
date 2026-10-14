"use client";

import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasTexture, MathUtils, SRGBColorSpace, type Group } from "three";

const BOTTLE_SRC = "/hero/ameerat-al-arab.webp";

function useCutoutTexture() {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  const textureRef = useRef<CanvasTexture | null>(null);

  useEffect(() => {
    let alive = true;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!alive) return;
      const width = image.naturalWidth || 430;
      const height = image.naturalHeight || 430;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0);
      const frame = context.getImageData(0, 0, width, height);
      const pixels = frame.data;
      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const min = Math.min(red, green, blue);
        const max = Math.max(red, green, blue);
        if (max - min < 24 && min > 188) {
          const fade = Math.min(1, (min - 188) / 52);
          pixels[index + 3] = Math.round(pixels[index + 3] * (1 - fade));
        }
      }
      context.putImageData(frame, 0, 0);
      const next = new CanvasTexture(canvas);
      next.colorSpace = SRGBColorSpace;
      next.anisotropy = 8;
      next.premultiplyAlpha = false;
      next.needsUpdate = true;
      textureRef.current = next;
      setTexture(next);
    };
    image.src = BOTTLE_SRC;
    return () => {
      alive = false;
      textureRef.current?.dispose();
      textureRef.current = null;
    };
  }, []);

  return texture;
}

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

function FragranceBottle({ reduce }: { reduce: boolean }) {
  const group = useRef<Group>(null);
  const { pointer } = useThree();
  const texture = useCutoutTexture();

  useFrame((state, delta) => {
    const bottle = group.current;
    if (!bottle) return;

    const sway = reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.55) * 0.16;
    const targetY = 0.42 + pointer.x * 0.7 + sway;
    const targetX = pointer.y * -0.16 + (reduce ? 0 : 0.06);
    bottle.rotation.y = MathUtils.damp(bottle.rotation.y, targetY, 3.2, delta);
    bottle.rotation.x = MathUtils.damp(bottle.rotation.x, targetX, 3.2, delta);
  });

  if (!texture) return null;

  return (
    <group ref={group} rotation={[0.08, 0.42, 0]}>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2.45, 2.45]} />
        <meshBasicMaterial
          map={texture}
          color="#6e2430"
          transparent
          alphaTest={0.05}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[2.45, 2.45]} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.05} toneMapped={false} />
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

function SoftShadow({ position }: { position: [number, number, number] }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const gradient = context.createRadialGradient(64, 64, 10, 64, 64, 64);
    gradient.addColorStop(0, "rgba(0,0,0,0.7)");
    gradient.addColorStop(0.45, "rgba(0,0,0,0.28)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const next = new CanvasTexture(canvas);
    next.needsUpdate = true;
    return next;
  }, []);

  useEffect(() => () => texture?.dispose(), [texture]);

  if (!texture) return null;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={[1.7, 0.7]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function AtelierScene() {
  const compact = useCompactViewport();
  const reduce = useReducedMotionPref();
  const origin: [number, number, number] = compact ? [0, -0.46, 0] : [1.05, 0.18, 0];

  return (
    <>
      <ambientLight intensity={0.42} color="#F8F8F8" />
      <directionalLight position={[3.2, 4.2, 4.5]} intensity={1.45} color="#FFF8EE" />
      <directionalLight position={[-3.5, 1.4, -2.5]} intensity={0.55} color="#FF4D9A" />
      <pointLight position={[-2.4, 1.1, 2.2]} intensity={10} color="#FF4D9A" distance={11} decay={2} />
      <pointLight position={[2.2, -0.6, 2.8]} intensity={4} color="#F8F8F8" distance={9} decay={2} />

      <Environment resolution={256} environmentIntensity={0.9}>
        <Lightformer form="rect" intensity={1.5} color="#F8F8F8" position={[0, 2.6, 2]} scale={[8, 1.6, 1]} />
        <Lightformer form="rect" intensity={0.65} color="#FF4D9A" position={[-3.6, 0.4, -1]} scale={[1.6, 4.5, 1]} />
        <Lightformer form="rect" intensity={0.85} color="#F8F8F8" position={[3.8, 0.8, 1.5]} scale={[1.8, 2.8, 1]} />
      </Environment>

      <group position={origin} scale={compact ? 0.56 : 1}>
        <FragranceBottle reduce={reduce} />
      </group>

      <Sparkles
        count={42}
        scale={[2.6, 3.4, 1.5]}
        size={2.4}
        speed={reduce ? 0 : 0.35}
        opacity={0.75}
        color="#FF4D9A"
        noise={0.55}
        position={[origin[0], origin[1] + 0.35, 0]}
      />

      <SoftShadow position={[origin[0], origin[1] - 1.02, 0.15]} />
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
