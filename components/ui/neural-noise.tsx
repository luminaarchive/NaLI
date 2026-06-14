"use client";

import { useEffect, useRef } from "react";

interface NeuralNoiseProps {
  /** RGB in 0..1. Defaults to NaLI's Jurnal indigo (#5C40A8). */
  color?: [number, number, number];
  /** Animation speed (multiplied by elapsed ms). */
  speed?: number;
}

const VERT = `
  precision mediump float;
  varying vec2 vUv;
  attribute vec2 a_position;
  void main() {
    vUv = 0.5 * (a_position + 1.0);
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// Neural "plexus" noise. Loop trimmed 15 -> 8 iterations for perf; still reads
// as an intricate web. Output is premultiplied-ish (col * noise, alpha = noise)
// so it sits as colored threads over a transparent canvas.
const FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_ratio;
  uniform vec2 u_pointer_position;
  uniform vec3 u_color;
  uniform float u_speed;
  vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
  }
  float neuro_shape(vec2 uv, float t, float p) {
    vec2 sine_acc = vec2(0.0);
    vec2 res = vec2(0.0);
    float scale = 8.0;
    for (int j = 0; j < 8; j++) {
      uv = rotate(uv, 1.0);
      sine_acc = rotate(sine_acc, 1.0);
      vec2 layer = uv * scale + float(j) + sine_acc - t;
      sine_acc += sin(layer) + 2.4 * p;
      res += (0.5 + 0.5 * cos(layer)) / scale;
      scale *= 1.2;
    }
    return res.x + res.y;
  }
  void main() {
    vec2 uv = 0.5 * vUv;
    uv.x *= u_ratio;
    vec2 pointer = vUv - u_pointer_position;
    pointer.x *= u_ratio;
    float p = clamp(length(pointer), 0.0, 1.0);
    p = 0.5 * pow(1.0 - p, 2.0);
    float t = u_speed * u_time;
    float noise = neuro_shape(uv, t, p);
    noise = 1.2 * pow(noise, 3.0);
    noise += pow(noise, 10.0);
    noise = max(0.0, noise - 0.5);
    noise *= (1.0 - length(vUv - 0.5));
    vec3 col = u_color * noise;
    gl_FragColor = vec4(col, noise);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function NeuralNoise({
  color = [0.38, 0.27, 0.74],
  speed = 0.0006,
}: NeuralNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      premultipliedAlpha: false,
      antialias: true,
    }) as WebGLRenderingContext | null;
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
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const u_time = gl.getUniformLocation(program, "u_time");
    const u_ratio = gl.getUniformLocation(program, "u_ratio");
    const u_pointer = gl.getUniformLocation(program, "u_pointer_position");
    const u_color = gl.getUniformLocation(program, "u_color");
    const u_speed = gl.getUniformLocation(program, "u_speed");

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    gl.uniform3f(u_color, color[0], color[1], color[2]);
    gl.uniform1f(u_speed, speed);

    // Perf: render at CSS resolution (dpr 1), the heavy fragment shader is the
    // bottleneck so fewer pixels matters most. The soft web upscales fine.
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.uniform1f(u_ratio, canvas.width / Math.max(1, canvas.height));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const pointer = { x: 0, y: 0, tX: 0, tY: 0 };
    let raf = 0;
    const render = () => {
      const now = performance.now();
      pointer.x += (pointer.tX - pointer.x) * 0.2;
      pointer.y += (pointer.tY - pointer.y) * 0.2;
      gl.uniform1f(u_time, now);
      gl.uniform2f(
        u_pointer,
        pointer.x / window.innerWidth,
        1 - pointer.y / window.innerHeight,
      );
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    render();

    const onResize = () => resize();
    const onPointer = (e: PointerEvent) => {
      pointer.tX = e.clientX;
      pointer.tY = e.clientY;
    };
    const onTouch = (e: TouchEvent) => {
      const t0 = e.targetTouches[0];
      if (t0) {
        pointer.tX = t0.clientX;
        pointer.tY = t0.clientY;
      }
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("touchmove", onTouch);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("touchmove", onTouch);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, [color, speed]);

  return <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />;
}
