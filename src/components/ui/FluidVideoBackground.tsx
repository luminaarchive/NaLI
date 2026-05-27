"use client";

import { useEffect, useRef, useState } from "react";

const videoSources: { src: string; type: string }[] = [];

export function FluidVideoBackground() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const showVideo = videoSources.length > 0 && !prefersReducedMotion && !videoFailed;
  const animateClass = prefersReducedMotion ? "" : "will-change-transform";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#060b08]"
    >
      <div className="absolute inset-0 h-full w-full">
        {showVideo ? (
          <video
            autoPlay
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? "opacity-100" : "opacity-0"
            }`}
            loop
            muted
            onCanPlay={() => setVideoLoaded(true)}
            onError={() => setVideoFailed(true)}
            playsInline
            poster="/ambient/nali-fluid-poster.jpg"
            preload="metadata"
            ref={videoRef}
          >
            {videoSources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        ) : null}

        <div
          className="absolute inset-[-3%] h-[106%] w-[106%] bg-cover bg-center opacity-[0.10]"
          style={{
            backgroundImage: "url('/ambient/nali-fluid-poster.jpg')",
            filter: "blur(18px) saturate(1.05)",
          }}
        />

        <div
          className={`absolute rounded-full mix-blend-screen transform-gpu ${animateClass}`}
          style={{
            bottom: "-15%",
            left: "-10%",
            width: "min(70vw, 700px)",
            height: "min(70vw, 700px)",
            background:
              "radial-gradient(circle, rgba(0,255,179,0.25) 0%, rgba(0,255,179,0) 70%)",
            filter: "blur(60px)",
            animation: prefersReducedMotion
              ? "none"
              : "nali-blob-1 14s infinite alternate ease-in-out",
          }}
        />

        <div
          className={`absolute rounded-full mix-blend-screen transform-gpu ${animateClass} hidden md:block`}
          style={{
            bottom: "-20%",
            left: "20%",
            width: "min(80vw, 800px)",
            height: "min(80vw, 800px)",
            background:
              "radial-gradient(circle, rgba(0,255,179,0.12) 0%, rgba(0,255,179,0) 70%)",
            filter: "blur(70px)",
            animation: prefersReducedMotion
              ? "none"
              : "nali-blob-2 18s infinite alternate ease-in-out",
          }}
        />

        <div
          className={`absolute rounded-full mix-blend-screen transform-gpu ${animateClass} hidden md:block`}
          style={{
            bottom: "-10%",
            right: "-10%",
            width: "min(65vw, 650px)",
            height: "min(65vw, 650px)",
            background:
              "radial-gradient(circle, rgba(0,255,179,0.10) 0%, rgba(0,255,179,0) 70%)",
            filter: "blur(60px)",
            animation: prefersReducedMotion
              ? "none"
              : "nali-blob-3 16s infinite alternate ease-in-out",
          }}
        />

        <div
          className={`absolute rounded-full mix-blend-screen transform-gpu ${animateClass} hidden md:block`}
          style={{
            top: "-5%",
            left: "30%",
            width: "min(50vw, 500px)",
            height: "min(50vw, 500px)",
            background:
              "radial-gradient(circle, rgba(0,255,179,0.10) 0%, rgba(0,255,179,0) 70%)",
            filter: "blur(80px)",
            animation: prefersReducedMotion
              ? "none"
              : "nali-blob-breathe 20s infinite alternate ease-in-out",
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, rgba(6,11,8,0.5) 65%, rgba(6,11,8,0.92) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <style>{`
        @keyframes nali-blob-1 {
          0% { transform: translate3d(0, 10%, 0) scale(1); opacity: 0.55; }
          33% { transform: translate3d(12%, -8%, 0) scale(1.2); opacity: 0.78; }
          66% { transform: translate3d(-8%, -3%, 0) scale(0.92); opacity: 0.62; }
          100% { transform: translate3d(5%, 5%, 0) scale(1.08); opacity: 0.68; }
        }
        @keyframes nali-blob-2 {
          0% { transform: translate3d(0, 0, 0) scale(1.1); opacity: 0.48; }
          50% { transform: translate3d(-12%, -15%, 0) scale(0.86); opacity: 0.68; }
          100% { transform: translate3d(8%, -5%, 0) scale(1.14); opacity: 0.54; }
        }
        @keyframes nali-blob-3 {
          0% { transform: translate3d(0, 0, 0) scale(0.9); opacity: 0.48; }
          50% { transform: translate3d(-15%, -12%, 0) scale(1.24); opacity: 0.7; }
          100% { transform: translate3d(5%, -8%, 0) scale(1); opacity: 0.58; }
        }
        @keyframes nali-blob-breathe {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.36; }
          50% { transform: translate3d(-5%, 8%, 0) scale(1.16); opacity: 0.52; }
          100% { transform: translate3d(3%, -3%, 0) scale(1.04); opacity: 0.42; }
        }
      `}</style>
    </div>
  );
}
