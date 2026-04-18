// @ts-nocheck
import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>English Coach — Telugu to English</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" defer />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body > div:first-child { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; }
              [role="tablist"] [role="tab"] * { overflow: visible !important; }
              [role="heading"], [role="heading"] * { overflow: visible !important; }
              *::-webkit-scrollbar { width: 8px; height: 8px; }
              *::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
              *::-webkit-scrollbar-thumb { background: rgba(245,200,66,0.3); border-radius: 4px; }
              *::-webkit-scrollbar-thumb:hover { background: rgba(245,200,66,0.5); }
              @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,60px) scale(1.15); } }
              @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px,-40px) scale(1.1); } }
              @keyframes drift3 { 0%,100% { transform: translate(-50%,-50%) scale(1); } 50% { transform: translate(-45%,-55%) scale(1.2); } }
              @keyframes pulseRing { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(1.6); opacity: 0; } }
              @keyframes micPulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); } 50% { transform: scale(1.04); box-shadow: 0 0 0 14px rgba(239,68,68,0); } }
              @keyframes statusPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
              @keyframes wave { 0%,100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
              @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes reconnectPulse { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.05); } }
              .orb1 { animation: drift1 18s ease-in-out infinite; }
              .orb2 { animation: drift2 22s ease-in-out infinite; }
              .orb3 { animation: drift3 26s ease-in-out infinite; }
              .pulse-ring { animation: pulseRing 2s ease-out infinite; }
              .pulse-ring.r2 { animation-delay: 0.6s; }
              .pulse-ring.r3 { animation-delay: 1.2s; }
              .mic-pulse { animation: micPulse 1.2s ease-in-out infinite; }
              .status-pulse { animation: statusPulse 1.4s ease-in-out infinite; }
              .wave-bar { animation: wave 0.9s ease-in-out infinite; transform-origin: center; }
              .msg-enter { animation: fadeInUp 0.3s ease-out; }
              .reconnect-pulse { animation: reconnectPulse 1.2s ease-in-out infinite; }
              .telugu-font { font-family: 'Noto Sans Telugu', 'DM Sans', sans-serif !important; }
              .serif-font { font-family: 'DM Serif Display', serif !important; }
              .sans-font { font-family: 'DM Sans', sans-serif !important; }
            `,
          }}
        />
      </head>
      <body
        style={{
          margin: 0,
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
          backgroundColor: "#07090f",
        }}
      >
        {children}
      </body>
    </html>
  );
}
