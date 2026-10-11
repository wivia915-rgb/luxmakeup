"use client";

import { activateMetaPixel, flushMetaQueue, metaPixelId, trackMeta } from "@/lib/meta";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

const stub = (pixelId: string) => `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');
`;

const tiktokStub = (pixelId: string) => `
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${pixelId}');ttq.page();}(window,document,'ttq');
`;

export function MetaPixel({ facebookId = "", tiktokId = "" }: { facebookId?: string; tiktokId?: string }) {
  const pathname = usePathname();
  activateMetaPixel(facebookId);
  const pixelId = metaPixelId();
  const tiktok = /^[A-Z0-9]{8,32}$/.test(tiktokId.trim().toUpperCase()) ? tiktokId.trim().toUpperCase() : "";
  const atelier = pathname.startsWith("/admin");

  useEffect(() => {
    if (!pixelId || atelier) return;
    trackMeta("PageView");
  }, [atelier, pathname, pixelId]);

  if (atelier || (!pixelId && !tiktok)) return null;

  return (
    <>
      {pixelId ? (
        <>
          <Script id="meta-pixel" strategy="lazyOnload" onLoad={flushMetaQueue}>
            {stub(pixelId)}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              height={1}
              width={1}
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}
      {tiktok ? (
        <Script id="tiktok-pixel" strategy="lazyOnload">
          {tiktokStub(tiktok)}
        </Script>
      ) : null}
    </>
  );
}
