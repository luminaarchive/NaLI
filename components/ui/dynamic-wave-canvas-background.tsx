"use client";

import React, { useEffect, useRef } from "react";

type RGB = [number, number, number];

interface DynamicWaveBackgroundProps {
  /** Trough color (the darker part of the wave). */
  colorLow?: RGB;
  /** Crest color (the brighter, accent part of the wave). */
  colorHigh?: RGB;
}

/**
 * Interference-pattern wave field. Tinted via two colors so it can be driven
 * clay (Tentang) or royal blue (Kontak).
 *
 * Perf: the canvas backing store is kept small (a fixed low-res buffer) and the
 * browser/GPU upscales it to full size via CSS (`w-full h-full`). That avoids a
 * per-frame full-resolution `drawImage` blit, which is what made the original
 * janky — this keeps the per-pixel CPU cost flat and well under one frame.
 */
const DynamicWaveBackground: React.FC<DynamicWaveBackgroundProps> = ({
  colorLow = [40, 20, 12],
  colorHigh = [180, 92, 56],
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed low-res compute buffer; CSS stretches it to the viewport.
    const BUF_W = 240;
    let width = 0;
    let height = 0;
    let imageData: ImageData;
    let data: Uint8ClampedArray;

    const resize = () => {
      width = BUF_W;
      height = Math.max(1, Math.round(BUF_W * (window.innerHeight / window.innerWidth)));
      canvas.width = width;
      canvas.height = height;
      imageData = ctx.createImageData(width, height);
      data = imageData.data;
    };
    resize();

    const startTime = Date.now();
    const SIN_TABLE = new Float32Array(1024);
    const COS_TABLE = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const angle = (i / 1024) * Math.PI * 2;
      SIN_TABLE[i] = Math.sin(angle);
      COS_TABLE[i] = Math.cos(angle);
    }
    const IDX = 1024 / (Math.PI * 2);
    // (v * IDX) & 1023 does ToInt32 truncation + 1024-wrap in one step — no
    // Math.floor / modulo / divide per pixel, which is the hot-loop win.
    const fastSin = (x: number) => SIN_TABLE[(x * IDX) & 1023];
    const fastCos = (x: number) => COS_TABLE[(x * IDX) & 1023];

    const [lr, lg, lb] = colorLow;
    const [hr, hg, hb] = colorHigh;

    let raf = 0;
    const render = () => {
      const time = (Date.now() - startTime) * 0.001;
      for (let y = 0; y < height; y++) {
        const u_y = (2 * y - height) / height;
        for (let x = 0; x < width; x++) {
          const u_x = (2 * x - width) / height;
          let a = 0;
          let d = 0;
          for (let i = 0; i < 4; i++) {
            a += fastCos(i - d + time * 0.5 - a * u_x);
            d += fastSin(i * u_y + a);
          }
          const wave = (fastSin(a) + fastCos(d)) * 0.5;
          const t = wave < -1 ? 0 : wave > 1 ? 1 : 0.5 + 0.5 * wave;
          const intensity = 0.55 + 0.45 * fastCos(u_x + u_y + time * 0.3);
          const index = (y * width + x) * 4;
          data[index] = (lr + (hr - lr) * t) * intensity;
          data[index + 1] = (lg + (hg - lg) * t) * intensity;
          data[index + 2] = (lb + (hb - lb) * t) * intensity;
          data[index + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      raf = requestAnimationFrame(render);
    };
    render();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [colorLow, colorHigh]);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />;
};

export default DynamicWaveBackground;
export { DynamicWaveBackground };
