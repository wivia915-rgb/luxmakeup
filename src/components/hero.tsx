import { HeroStage } from "@/components/hero-stage";
import { getLocale } from "@/lib/get-locale";
import { messages } from "@/lib/messages";
import { ArrowUpRight } from "lucide-react";

const sparkles = [
  { left: "62%", top: "16%", size: 14, delay: 0.1, duration: 5.4 },
  { left: "78%", top: "28%", size: 10, delay: 0.8, duration: 4.6 },
  { left: "88%", top: "14%", size: 8, delay: 0.3, duration: 6.1 },
  { left: "70%", top: "46%", size: 12, delay: 1.2, duration: 5.2 },
  { left: "84%", top: "58%", size: 9, delay: 0.5, duration: 4.8 },
  { left: "58%", top: "64%", size: 7, delay: 1.6, duration: 5.8 },
  { left: "92%", top: "40%", size: 11, delay: 0.9, duration: 6.4 },
  { left: "74%", top: "76%", size: 8, delay: 1.4, duration: 4.4 },
  { left: "48%", top: "22%", size: 6, delay: 0.6, duration: 5.6 },
  { left: "54%", top: "82%", size: 10, delay: 1.1, duration: 6.2 },
  { left: "18%", top: "78%", size: 7, delay: 0.4, duration: 5.1 },
  { left: "30%", top: "18%", size: 6, delay: 1.8, duration: 4.9 },
];

export async function Hero() {
  const locale = await getLocale();
  const hero = messages[locale].hero;

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <HeroStage />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,#0D0D0D_0%,rgba(13,13,13,0.88)_34%,rgba(13,13,13,0.15)_68%,transparent_100%)] lg:bg-[linear-gradient(90deg,#0D0D0D_0%,rgba(13,13,13,0.92)_28%,rgba(13,13,13,0.35)_52%,transparent_72%)]"
      />

      <div aria-hidden className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
        {sparkles.map((sparkle) => (
          <span
            key={`${sparkle.left}-${sparkle.top}`}
            className="absolute opacity-70"
            style={{
              left: sparkle.left,
              top: sparkle.top,
              width: sparkle.size,
              height: sparkle.size,
              animationDelay: `${sparkle.delay}s`,
              animationDuration: `${sparkle.duration}s`,
            }}
          >
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#E5C158] shadow-[0_0_10px_#E5C158]" />
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#E5C158] shadow-[0_0_10px_#E5C158]" />
          </span>
        ))}
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-start px-5 pt-28 pb-16 md:px-10 lg:max-w-3xl lg:justify-center lg:pt-24">
        <p className="lux-rise type-eyebrow">{hero.eyebrow}</p>
        <h1
          aria-label={`${hero.line1} ${hero.line2} ${hero.line3}`}
          className="mt-6 font-serif text-[clamp(3rem,7vw,6.25rem)] leading-[0.9] font-normal tracking-[-0.045em] text-foreground"
        >
          <span className="block">{hero.line1}</span>
          <span className="block">{hero.line2}</span>
          <span
            className={`${locale === "ar" ? "font-serif" : "type-italic"} mt-4 block text-[0.42em] leading-none tracking-[-0.03em] text-gold-bright`}
          >
            {hero.line3}
          </span>
        </h1>
        <a
          href="#edit"
          className="type-nav pointer-events-auto lux-rise mt-10 inline-flex w-fit items-center gap-3 border border-[#E5C158]/45 bg-[#F8F8F8]/10 px-8 py-4 text-foreground shadow-[inset_0_1px_0_rgba(248,248,248,0.32),0_16px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:-translate-y-0.5 hover:border-[#E5C158] hover:bg-[#F8F8F8]/20"
          style={{ animationDelay: "0.32s" }}
        >
          {hero.cta}
          <ArrowUpRight strokeWidth={1.25} size={16} aria-hidden />
        </a>
      </div>
    </section>
  );
}
