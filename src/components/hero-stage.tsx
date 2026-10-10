"use client";

import { ProductStill } from "@/components/product-still";
import { Component, useRef, useState, type ReactNode } from "react";

type VisualizerComponent = (props: Record<string, never>) => ReactNode;

export function HeroStage() {
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
        <div className="flex h-full items-end justify-center pb-16 lg:items-center lg:justify-end lg:pr-[10%] lg:pb-0">
          <div className="h-[46vh] w-[58vw] max-w-sm min-w-44 lg:h-[68vh]">
            <ProductStill motif="flacon" name="Lux Makeup fragrance bottle" />
          </div>
        </div>
      )}
      {Visualizer ? null : (
        <button
          type="button"
          onClick={start}
          className="type-caption pointer-events-auto absolute right-5 bottom-6 z-20 text-gold-bright md:right-10"
        >
          Turn the bottle
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
    if (this.state.failed) return null;
    return this.props.children;
  }
}
