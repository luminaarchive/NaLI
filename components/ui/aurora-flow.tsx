"use client";

import { useEffect, useRef } from "react";

const VERT = `
  precision highp float;
  varying vec2 vUv;
  attribute vec2 a_position;
  void main() {
    vUv = 0.5 * (a_position + 1.0);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Flowing aurora, ported from the R3F snippet to a single self-contained
// fragment shader. Palette synced to NaLI's teal (#2DD4A7) over deep ink.
const FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2 u_resolution;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float t = u_time;

    float flow1 = snoise(vec2(uv.x * 2.0 + t * 0.10, uv.y * 0.5 + t * 0.05));
    float flow2 = snoise(vec2(uv.x * 1.5 + t * 0.08, uv.y * 0.8 + t * 0.03));
    float flow3 = snoise(vec2(uv.x * 3.0 + t * 0.12, uv.y * 0.3 + t * 0.07));

    float streaks = sin((uv.x + flow1 * 0.3) * 8.0 + t * 0.2) * 0.5 + 0.5;
    streaks *= sin((uv.y + flow2 * 0.2) * 12.0 + t * 0.15) * 0.5 + 0.5;

    float aurora = (flow1 + flow2 + flow3) * 0.33 + 0.5;
    aurora = pow(aurora, 2.0);

    // NaLI teal family on deep ink (#03100d base, #2DD4A7 highlights)
    vec3 darkBase   = vec3(0.012, 0.063, 0.051);
    vec3 teal       = vec3(0.050, 0.330, 0.270);
    vec3 cyan       = vec3(0.090, 0.620, 0.480);
    vec3 brightTeal = vec3(0.176, 0.831, 0.655);
    vec3 green      = vec3(0.070, 0.660, 0.420);

    vec3 color = darkBase;

    float tealFlow = smoothstep(0.3, 0.7, aurora + streaks * 0.3);
    color = mix(color, teal, tealFlow);

    float cyanFlow = smoothstep(0.6, 0.9, aurora + flow1 * 0.4);
    color = mix(color, cyan, cyanFlow);

    float brightFlow = smoothstep(0.8, 1.0, streaks + aurora * 0.5);
    color = mix(color, brightTeal, brightFlow * 0.7);

    float greenFlow = smoothstep(0.7, 0.95, flow3 + streaks * 0.2);
    color = mix(color, green, greenFlow * 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("Aurora shader error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/**
 * Full-bleed flowing aurora background (vanilla WebGL, no three.js / R3F).
 * Fills its parent; render at CSS resolution (dpr 1) so the heavy fragment
 * shader holds 60fps. Static single frame under prefers-reduced-motion.
 */
export function AuroraFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: false, antialias: true }) as
      | WebGLRenderingContext
      | null;
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Aurora link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const u_time = gl.getUniformLocation(program, "u_time");
    const u_resolution = gl.getUniformLocation(program, "u_resolution");

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    // Render at 0.7x and let CSS upscale the canvas; the soft aurora tolerates
    // it and it keeps the fragment shader comfortably at 60fps.
    const RES = 0.7;
    const resize = () => {
      const w = Math.max(1, Math.round((canvas.clientWidth || window.innerWidth) * RES));
      const h = Math.max(1, Math.round((canvas.clientHeight || window.innerHeight) * RES));
      canvas.width = w;
      canvas.height = h;
      gl.uniform2f(u_resolution, w, h);
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let raf = 0;

    const draw = (tSeconds: number) => {
      gl.uniform1f(u_time, tSeconds);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    if (reduced) {
      draw(12); // a pleasant static frame
    } else {
      const loop = () => {
        draw((performance.now() - start) * 0.0006);
        raf = requestAnimationFrame(loop);
      };
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />;
}
