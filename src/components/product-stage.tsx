"use client";

import { ProductStill } from "@/components/product-still";
import type { Motif } from "@/lib/products";
import { useRef, useState, type ComponentType } from "react";

type ViewerComponent = ComponentType<{ motif: Motif; swatch: string; name: string }>;

export function ProductStage({ motif, swatch, name }: { motif: Motif; swatch: string; name: string }) {
  const [Viewer, setViewer] = useState<ViewerComponent | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);
  const started = useRef(false);

  function activate() {
    if (started.current) return;
    started.current = true;
    setPending(true);
    void import("@/components/product-viewer")
      .then((mod) => setViewer(() => mod.ProductViewer))
      .catch(() => {
        started.current = false;
        setPending(false);
        setFailed(true);
      });
  }

  if (failed) {
    return <p className="type-body border border-gold/25 bg-card p-8">The model viewer is unavailable in this browser.</p>;
  }

  if (Viewer) {
    return <StageBoundary Viewer={Viewer} motif={motif} swatch={swatch} name={name} />;
  }

  return (
    <div className="border border-gold/25 bg-card">
      <div className="relative h-[420px] cursor-grab md:h-[520px]" onPointerDown={activate}>
        <ProductStill motif={motif} name={name} />
        <p className="type-caption pointer-events-none absolute bottom-4 left-4 text-gold-bright">
          {pending ? "Preparing the turn" : "Drag to turn"}
        </p>
      </div>
      <div className="border-t border-gold/20 px-4 py-4">
        <label className="type-caption flex items-center justify-between gap-3 text-foreground/80">
          <span>Rotation 29°</span>
          <span>360°</span>
        </label>
        <input
          type="range"
          min={0}
          max={360}
          defaultValue={29}
          aria-label={`${name} rotation in degrees`}
          className="mt-3 w-full accent-[#E2187A]"
          onPointerDown={activate}
          onFocus={activate}
        />
      </div>
    </div>
  );
}

function StageBoundary({
  Viewer,
  motif,
  swatch,
  name,
}: {
  Viewer: ComponentType<{ motif: Motif; swatch: string; name: string }>;
  motif: Motif;
  swatch: string;
  name: string;
}) {
  return <Viewer motif={motif} swatch={swatch} name={name} />;
}
