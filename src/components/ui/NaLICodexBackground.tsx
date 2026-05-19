"use client";

import type { CSSProperties } from "react";
import { NoiseTexture } from "@/components/ui/noise-texture";

export function NaLICodexBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#f8fbff]">
      {/* Layer 1 - base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 12% 60%, rgba(96,165,250,0.24) 0%, rgba(147,197,253,0.14) 34%, transparent 68%), radial-gradient(ellipse at 86% 34%, rgba(167,139,250,0.26) 0%, rgba(196,181,253,0.16) 36%, transparent 70%), radial-gradient(circle at 50% 24%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 28%, transparent 52%), linear-gradient(135deg, #f4f8ff 0%, #edf5ff 28%, #efedff 64%, #ffffff 100%)",
        }}
      />

      {/* Layer 2 - huge left blue atmospheric field */}
      <div
        className="nali-atmosphere-drift-a absolute top-[18vh] left-[-24vw] h-[clamp(560px,74vw,1320px)] w-[clamp(720px,88vw,1500px)] transform-gpu rounded-[46%_54%_62%_38%/52%_43%_57%_48%]"
        style={{
          background:
            "radial-gradient(ellipse at 42% 44%, rgba(96,165,250,0.46) 0%, rgba(147,197,253,0.34) 28%, rgba(186,230,253,0.22) 48%, transparent 72%), radial-gradient(ellipse at 24% 70%, rgba(186,230,253,0.26) 0%, transparent 58%)",
          filter: "blur(34px)",
        }}
      />

      {/* Layer 3 - huge right violet/lavender atmospheric field */}
      <div
        className="nali-atmosphere-drift-b absolute top-[8vh] right-[-22vw] h-[clamp(560px,76vw,1380px)] w-[clamp(720px,90vw,1500px)] transform-gpu rounded-[58%_42%_44%_56%/42%_56%_44%_58%]"
        style={{
          background:
            "radial-gradient(ellipse at 56% 38%, rgba(129,114,255,0.42) 0%, rgba(167,139,250,0.34) 32%, rgba(196,181,253,0.26) 52%, transparent 76%), radial-gradient(ellipse at 74% 68%, rgba(221,214,254,0.28) 0%, transparent 60%)",
          filter: "blur(36px)",
        }}
      />

      {/* Layer 4 - central luminous bloom */}
      <div
        className="nali-atmosphere-breathe absolute top-[13vh] left-1/2 h-[clamp(360px,50vw,760px)] w-[clamp(460px,58vw,900px)] -translate-x-1/2 transform-gpu rounded-full"
        style={
          {
            "--nali-breathe-x": "-50%",
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.76) 22%, rgba(255,255,255,0.36) 42%, rgba(255,255,255,0) 64%)",
          } as CSSProperties
        }
      />

      {/* Layer 5 - lower mist / preview transition */}
      <div
        className="nali-atmosphere-drift-c absolute inset-x-[-12vw] bottom-[-20vh] h-[58vh] transform-gpu"
        style={{
          background:
            "radial-gradient(ellipse at 52% 12%, rgba(255,255,255,0.76) 0%, rgba(255,255,255,0.34) 26%, transparent 55%), radial-gradient(ellipse at 28% 42%, rgba(147,197,253,0.19) 0%, transparent 56%), radial-gradient(ellipse at 73% 32%, rgba(167,139,250,0.17) 0%, transparent 58%), linear-gradient(180deg, transparent 0%, rgba(238,244,255,0.58) 46%, rgba(247,250,255,0.92) 100%)",
          filter: "blur(28px)",
        }}
      />

      {/* Layer 6 - cloud veils unify the large fields */}
      <div
        className="nali-atmosphere-veil absolute inset-[-8%] transform-gpu"
        style={{
          background:
            "linear-gradient(105deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.04) 24%, rgba(255,255,255,0.26) 50%, rgba(255,255,255,0.08) 78%, rgba(255,255,255,0.44) 100%)",
        }}
      />
      <div
        className="nali-atmosphere-veil absolute inset-0 transform-gpu opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 50% 44%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.24) 34%, transparent 68%), radial-gradient(ellipse at 50% 94%, rgba(243,247,255,0.76) 0%, rgba(243,247,255,0.18) 40%, transparent 72%)",
        }}
      />

      {/* Layer 7 - subtle grain/noise */}
      <NoiseTexture
        className="nali-atmosphere-grain opacity-[0.055] mix-blend-soft-light"
        frequency={0.82}
        noiseOpacity={0.5}
        octaves={4}
        slope={0.12}
      />

      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/20 to-transparent" />
    </div>
  );
}
