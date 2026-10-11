"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";

type VisualizerComponent = (props: Record<string, never>) => ReactNode;

function PerfumeCutout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!alive) return;
      const width = image.naturalWidth || 430;
      const height = image.naturalHeight || 430;
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
      setReady(true);
    };
    image.src = "/hero/ameerat-al-arab.webp";
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="flex h-full items-end justify-center pb-16 lg:items-center lg:justify-end lg:pr-[9%] lg:pb-0">
      <div className="h-[52vh] w-[70vw] max-w-md min-w-48 [perspective:1200px] lg:h-[74vh]">
        <canvas
          ref={canvasRef}
          aria-label="Ameerat Al Arab"
          className={`lux-bottle h-full w-full object-contain transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
          style={{ transform: "rotateY(-18deg) rotateX(6deg)" }}
        />
      </div>
    </div>
  );
}

export function HeroStage({ turnLabel }: { turnLabel: string }) {
  const [Visualizer, setVisualizer] = useState<VisualizerComponent | null>(null);
  const started = useRef(false);

  function start() {
    if (started.current) return;
    started.current = true;
    void import("@/components/cosmetics-visualizer")
      .then((mod) => setVisualizer(() => mod.CosmeticsVisualizer))
      .catch(() => {
        started.current = false;
      });
  }

  useEffect(() => {
    start();
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") start();
      }}
      onPointerDown={start}
    >
      {Visualizer ? (
        <VisualizerBoundary>
          <Visualizer />
        </VisualizerBoundary>
      ) : (
        <PerfumeCutout />
      )}
      {Visualizer ? null : (
        <button
          type="button"
          onClick={start}
          className="type-caption pointer-events-auto absolute right-5 bottom-6 z-20 text-gold-bright md:right-10"
        >
          {turnLabel}
        </button>
      )}
    </div>
  );
}

class VisualizerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <PerfumeCutout />;
    return this.props.children;
  }
}
