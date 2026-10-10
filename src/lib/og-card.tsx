import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

type LuxCardInput = {
  eyebrow: string;
  title: string;
  detail: string;
  price?: string;
  badge?: string;
  detailGold?: boolean;
};

const fonts = Promise.all([
  readFile(join(process.cwd(), "src/assets/fonts/CormorantGaramond-Medium.ttf")),
  readFile(join(process.cwd(), "src/assets/fonts/Outfit-Regular.ttf")),
]);

export async function luxCard({ eyebrow, title, detail, price, badge, detailGold = false }: LuxCardInput) {
  const [serif, sans] = await fonts;
  const titleSize = title.length > 18 ? 68 : 88;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0D0D0D",
        color: "#F8F8F8",
        padding: "48px",
        fontFamily: "Outfit",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          border: "1px solid rgba(212,175,55,0.55)",
          padding: "48px 52px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", color: "#E5C158", fontSize: 20, letterSpacing: 6 }}>LUX MAKEUP</div>
            {badge ? (
              <div
                style={{
                  display: "flex",
                  border: "1px solid #E5C158",
                  color: "#E5C158",
                  fontSize: 18,
                  letterSpacing: 3,
                  padding: "8px 14px",
                }}
              >
                {badge.toUpperCase()}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: "#E5C158", fontSize: 18, letterSpacing: 5 }}>{eyebrow.toUpperCase()}</div>
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontFamily: "Cormorant Garamond",
                fontWeight: 400,
                fontSize: titleSize,
                lineHeight: 0.95,
                letterSpacing: -2,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 22,
                maxWidth: 680,
                fontFamily: detailGold ? "Cormorant Garamond" : "Outfit",
                fontSize: detailGold ? 42 : 26,
                lineHeight: 1.35,
                color: detailGold ? "#E5C158" : "rgba(248,248,248,0.78)",
              }}
            >
              {clip(detail, 150)}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", width: 180, height: 1, background: "#D4AF37" }} />
            <div style={{ display: "flex", color: "#D4AF37", fontSize: 28, letterSpacing: 3 }}>{price ?? "ATELIER"}</div>
          </div>
        </div>

        <Bottle />
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Cormorant Garamond", data: serif, weight: 400, style: "normal" },
        { name: "Outfit", data: sans, weight: 400, style: "normal" },
      ],
    },
  );
}

function Bottle() {
  return (
    <div style={{ display: "flex", width: 230, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 52, height: 26, background: "#D4AF37" }} />
        <div style={{ width: 34, height: 20, background: "#E5C158" }} />
        <div
          style={{
            display: "flex",
            width: 128,
            height: 248,
            background: "#1A1A1A",
            border: "2px solid #E5C158",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 96, height: 108, background: "rgba(229,193,88,0.5)" }} />
        </div>
      </div>
    </div>
  );
}

function clip(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}
