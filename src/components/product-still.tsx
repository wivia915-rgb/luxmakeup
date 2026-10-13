import type { Motif } from "@/lib/products";

type ProductStillProps = {
  motif: Motif;
  name: string;
};

export function ProductStill({ motif, name }: ProductStillProps) {
  return (
    <div className="relative h-full w-full bg-background" role="img" aria-label={`${name} product image`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(229,193,88,0.28),transparent_58%)]" />
      <div className="absolute inset-x-[22%] top-[10%] bottom-[12%]">
        {motif === "flacon" ? <Flacon /> : null}
        {motif === "compact" ? <Compact /> : null}
        {motif === "tube" ? <Tube /> : null}
        {motif === "jar" ? <Jar /> : null}
        {motif === "palette" ? <Palette /> : null}
      </div>
    </div>
  );
}

function Flacon() {
  return (
    <svg viewBox="0 0 120 220" className="h-full w-full" aria-hidden>
      <rect x="46" y="18" width="28" height="16" fill="#D4AF37" />
      <rect x="50" y="34" width="20" height="18" fill="#E5C158" />
      <rect x="28" y="54" width="64" height="140" rx="4" fill="#1A1A1A" stroke="#E5C158" strokeWidth="1.4" />
      <rect x="36" y="118" width="48" height="58" fill="#E5C158" opacity="0.45" />
      <rect x="42" y="78" width="36" height="28" fill="none" stroke="#D4AF37" strokeWidth="1" />
    </svg>
  );
}

function Compact() {
  return (
    <svg viewBox="0 0 160 200" className="h-full w-full" aria-hidden>
      <rect x="24" y="48" width="112" height="112" rx="56" fill="#1A1A1A" stroke="#E5C158" strokeWidth="1.4" />
      <rect x="46" y="70" width="68" height="68" rx="34" fill="#E5C158" opacity="0.35" />
      <rect x="70" y="36" width="20" height="14" fill="#D4AF37" />
      <path d="M40 160h80" stroke="#D4AF37" strokeWidth="1.2" />
    </svg>
  );
}

function Tube() {
  return (
    <svg viewBox="0 0 120 220" className="h-full w-full" aria-hidden>
      <rect x="44" y="16" width="32" height="22" fill="#D4AF37" />
      <rect x="48" y="38" width="24" height="14" fill="#E5C158" />
      <rect x="40" y="52" width="40" height="130" fill="#1A1A1A" stroke="#E5C158" strokeWidth="1.4" />
      <path d="M40 182 L60 206 L80 182" fill="#E5C158" opacity="0.8" />
      <rect x="48" y="78" width="24" height="46" fill="#D4AF37" opacity="0.55" />
    </svg>
  );
}

function Jar() {
  return (
    <svg viewBox="0 0 160 200" className="h-full w-full" aria-hidden>
      <rect x="48" y="28" width="64" height="18" rx="2" fill="#D4AF37" />
      <rect x="36" y="48" width="88" height="112" rx="6" fill="#1A1A1A" stroke="#E5C158" strokeWidth="1.4" />
      <rect x="48" y="92" width="64" height="48" fill="#E5C158" opacity="0.4" />
      <path d="M52 72h56" stroke="#D4AF37" strokeWidth="1" />
    </svg>
  );
}

function Palette() {
  return (
    <svg viewBox="0 0 180 200" className="h-full w-full" aria-hidden>
      <rect x="22" y="36" width="136" height="128" rx="4" fill="#1A1A1A" stroke="#E5C158" strokeWidth="1.4" />
      <rect x="40" y="58" width="28" height="28" fill="#D4AF37" />
      <rect x="76" y="58" width="28" height="28" fill="#E5C158" opacity="0.85" />
      <rect x="112" y="58" width="28" height="28" fill="#F8F8F8" opacity="0.7" />
      <rect x="58" y="100" width="28" height="28" fill="#E5C158" opacity="0.45" />
      <rect x="94" y="100" width="28" height="28" fill="#D4AF37" opacity="0.65" />
    </svg>
  );
}
