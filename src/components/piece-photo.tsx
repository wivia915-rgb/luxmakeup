"use client";

import { ProductStill } from "@/components/product-still";
import type { Motif } from "@/lib/products";
import { useState } from "react";

export function PiecePhoto({ src, name, motif }: { src: string; name: string; motif: Motif }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return <ProductStill motif={motif} name={name} />;
  }

  return (
    <img
      src={src}
      alt=""
      className="size-full object-cover"
      onError={() => setBroken(true)}
    />
  );
}
