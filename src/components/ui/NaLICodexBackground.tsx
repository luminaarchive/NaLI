"use client";

import type { CSSProperties } from "react";

/**
 * NaLICodexBackground — Rich atmospheric canvas.
 * 
 * Fixed position background that creates depth through layered gradients.
 * The base gradient goes from dark indigo top → rich purple middle → 
 * lighter lavender bottom, creating natural darkening as hero content
 * scrolls through it.
 */
export function NaLICodexBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #17103a 0%, #231960 10%, #3a2d7a 20%, #5b4a9e 30%, #7b6cb8 38%, #9890c8 46%, #b5afd8 54%, #cec9e6 62%, #e0dcf0 70%, #ede9f5 78%, #f5f3fb 86%, #faf9fd 93%, #ffffff 100%)",
      }}
    >
      {/* Layer 1 — Top dark atmospheric mass */}
      <div
        className="nali-atmosphere-drift-a absolute inset-x-[-20%] top-[-10%] h-[50vh] transform-gpu"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 0%, rgba(23,16,58,0.9) 0%, rgba(35,25,96,0.7) 35%, rgba(58,45,122,0.4) 55%, transparent 78%)",
          filter: "blur(15px)",
        }}
      />

      {/* Layer 2 — Massive left blue-violet cloud */}
      <div
        className="nali-atmosphere-drift-b absolute top-[10%] left-[-15%] h-[clamp(400px,60vh,900px)] w-[clamp(500px,70vw,1200px)] transform-gpu rounded-[50%_50%_60%_40%/45%_55%_45%_55%]"
        style={{
          background:
            "radial-gradient(ellipse at 40% 45%, rgba(90,70,180,0.5) 0%, rgba(120,100,200,0.35) 30%, rgba(155,140,220,0.2) 50%, transparent 72%)",
          filter: "blur(35px)",
        }}
      />

      {/* Layer 3 — Massive right violet-purple cloud */}
      <div
        className="nali-atmosphere-drift-a absolute top-[6%] right-[-12%] h-[clamp(400px,65vh,1000px)] w-[clamp(500px,75vw,1300px)] transform-gpu rounded-[55%_45%_48%_52%/50%_50%_50%_50%]"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, rgba(110,80,195,0.45) 0%, rgba(140,115,215,0.3) 32%, rgba(170,150,230,0.18) 52%, transparent 75%)",
          filter: "blur(40px)",
          animationDelay: "-12s",
        }}
      />

      {/* Layer 4 — Center luminous bloom */}
      <div
        className="nali-atmosphere-breathe absolute top-[20%] left-1/2 h-[clamp(350px,48vh,700px)] w-[clamp(450px,60vw,950px)] -translate-x-1/2 transform-gpu rounded-full"
        style={
          {
            "--nali-breathe-x": "-50%",
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(235,230,248,0.5) 22%, rgba(210,205,235,0.3) 40%, rgba(185,180,225,0.15) 55%, transparent 75%)",
            filter: "blur(6px)",
          } as CSSProperties
        }
      />

      {/* Layer 5 — Blue accent wisps left */}
      <div
        className="nali-atmosphere-drift-c absolute top-[28%] left-[-5%] h-[clamp(250px,35vh,500px)] w-[clamp(350px,50vw,800px)] transform-gpu rounded-[60%_40%_55%_45%/50%_50%_50%_50%]"
        style={{
          background:
            "radial-gradient(ellipse at 35% 50%, rgba(70,110,210,0.3) 0%, rgba(100,130,220,0.18) 40%, transparent 68%)",
          filter: "blur(30px)",
        }}
      />

      {/* Layer 6 — Purple accent wisps right */}
      <div
        className="nali-atmosphere-drift-b absolute top-[22%] right-[-3%] h-[clamp(230px,32vh,450px)] w-[clamp(330px,45vw,700px)] transform-gpu rounded-[45%_55%_50%_50%/55%_45%_55%_45%]"
        style={{
          background:
            "radial-gradient(ellipse at 65% 45%, rgba(130,95,210,0.25) 0%, rgba(160,135,225,0.14) 42%, transparent 68%)",
          filter: "blur(28px)",
          animationDelay: "-8s",
        }}
      />

      {/* Layer 7 — Subtle lavender veil */}
      <div
        className="nali-atmosphere-veil absolute inset-[-5%] transform-gpu"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 35%, rgba(190,185,230,0.15) 0%, rgba(210,205,240,0.08) 45%, transparent 68%)",
        }}
      />

      {/* Layer 8 — Top edge darkening for nav contrast */}
      <div
        className="absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(23,16,58,0.4) 0%, rgba(35,25,96,0.2) 50%, transparent 100%)",
        }}
      />
    </div>
  );
}
