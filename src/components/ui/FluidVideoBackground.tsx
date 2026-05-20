"use client";

import { useEffect, useState, useRef } from "react";

/**
 * FluidVideoBackground — High-performance, video-based fluid ambient background system.
 * 
 * Features:
 * 1. Muted, loop, playsInline, autoPlay with preload="metadata".
 * 2. Fallbacks gracefully to high-quality animated CSS glow if files fail to load or are missing.
 * 3. Supports prefers-reduced-motion by rendering a static background overlay.
 * 4. Includes dark readability overlay and radial vignette layers to maintain text contrast.
 * 5. Uses a subtle noise/grain texture for high-fidelity aesthetics.
 * 6. Placed safely at z-0 behind content without z-index stacking issues.
 */
export function FluidVideoBackground() {
  const [videoFailed, setVideoFailed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check and listen for prefers-reduced-motion media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Gracefully handle case where video files do not load or exist
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || prefersReducedMotion) return;

    // If metadata doesn't load within 3 seconds, indicate potential load issue/absence
    const checkTimeout = setTimeout(() => {
      if (videoEl.readyState < 1 && !videoLoaded) {
        console.warn("Video background sources are slow to respond or missing. Retaining fallback visual layer.");
      }
    }, 3000);

    return () => clearTimeout(checkTimeout);
  }, [prefersReducedMotion, videoLoaded]);

  const handleVideoError = () => {
    console.error("Fluid video background failed to load or source is missing. Falling back to CSS glow background.");
    setVideoFailed(true);
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  const showVideo = !prefersReducedMotion && !videoFailed;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden bg-[#07090e]"
    >
      {/* 1. Main Background / Video / CSS Fallback Wrapper */}
      <div className="absolute inset-0 h-full w-full">
        {showVideo && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
            poster="/ambient/nali-fluid-poster.jpg"
            className={`h-full w-full object-cover transition-opacity duration-1000 ${
              videoLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <source src="/ambient/nali-fluid-glow.webm" type="video/webm" />
            <source src="/ambient/nali-fluid-glow.mp4" type="video/mp4" />
          </video>
        )}

        {/* CSS Fallback (rendered when video is loading, fails, or prefers-reduced-motion is active) */}
        {(!videoLoaded || !showVideo) && (
          <div className="absolute inset-0 h-full w-full transition-opacity duration-1000">
            {/* Layer 1: Emerald glow (left/bottom) */}
            <div
              className={`absolute -bottom-[10%] -left-[10%] h-[75vw] w-[75vw] max-w-[700px] max-h-[700px] rounded-full bg-emerald-500/32 blur-[100px] mix-blend-screen transform-gpu sm:h-[50vw] sm:w-[50vw] sm:blur-[160px] ${
                prefersReducedMotion ? "" : "animate-fluid-1"
              }`}
              style={{ willChange: "transform, opacity" }}
            />

            {/* Layer 2: Cyan/teal glow (center/bottom) */}
            <div
              className={`absolute -bottom-[12%] left-[15%] h-[85vw] w-[85vw] max-w-[850px] max-h-[850px] rounded-full bg-cyan-500/26 blur-[110px] mix-blend-screen transform-gpu sm:h-[60vw] sm:w-[60vw] sm:blur-[180px] ${
                prefersReducedMotion ? "" : "animate-fluid-2"
              }`}
              style={{ willChange: "transform, opacity" }}
            />

            {/* Layer 3: Indigo/violet glow (right/bottom) */}
            <div
              className={`absolute -bottom-[10%] -right-[10%] h-[70vw] w-[70vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-600/24 blur-[90px] mix-blend-screen transform-gpu sm:h-[50vw] sm:w-[50vw] sm:blur-[140px] ${
                prefersReducedMotion ? "" : "animate-fluid-3"
              }`}
              style={{ willChange: "transform, opacity" }}
            />

            {/* Layer 4: Soft blue upper haze */}
            <div
              className={`absolute -top-[10%] left-[20%] h-[60vw] w-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-900/12 blur-[120px] mix-blend-screen transform-gpu ${
                prefersReducedMotion ? "" : "animate-fluid-breathe"
              }`}
              style={{ willChange: "transform, opacity" }}
            />
          </div>
        )}
      </div>

      {/* 2. Readability overlay to darken and normalize contrast */}
      <div 
        className="pointer-events-none absolute inset-0 h-full w-full bg-[#07090e]/50 mix-blend-multiply" 
      />

      {/* 3. Vignette/radial gradient overlay to focus center content */}
      <div
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          background: "radial-gradient(circle at 50% 40%, transparent 20%, rgba(7, 9, 14, 0.4) 60%, rgba(7, 9, 14, 0.95) 100%)",
        }}
      />

      {/* 4. Subtle noise/grain texture overlay for premium cinematic feel */}
      <div
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
