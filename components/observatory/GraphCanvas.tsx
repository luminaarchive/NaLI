"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useGraphStore } from "./useGraphStore";
import { computeAuditorTrace } from "./computeAuditorTrace";
import type { GraphNode, GraphEdge } from "@/lib/graph";
import gsap from "gsap";

interface SimNode extends GraphNode {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

const CATEGORY_COLOR: Record<string, string> = {
  alam: "#2f9e6e",
  sejarah: "#3b6fb0",
  investigasi: "#c9772f",
  "catatan-lapangan": "#6b8f2f",
};

const TYPE_COLOR = {
  artikel: "#2f9e6e",
  sumber: "#8a8f98",
  seri: "#7a5bb0",
  topik: "#b08a3b",
};

function getColorOf(node: GraphNode): string {
  if (node.type === "artikel") {
    return CATEGORY_COLOR[node.category ?? ""] ?? TYPE_COLOR.artikel;
  }
  return TYPE_COLOR[node.type] ?? "#8a8f98";
}

// GLSL shaders for the Epistemic Glow shell
const glowVertexShader = `
  uniform float u_time;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const glowFragmentShader = `
  uniform float u_time;
  uniform int u_confidence_type; // 0 = Strong, 1 = Insufficient/Needs, 2 = Conflict
  uniform vec3 u_base_color;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float intensity = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
    
    vec4 glowColor = vec4(0.0);
    
    if (u_confidence_type == 0) {
      // Terverifikasi Kuat: pulsing gold-green halo
      float pulse = 0.65 + 0.35 * sin(u_time * 2.0);
      vec3 gold = vec3(0.85, 0.68, 0.2);
      glowColor = vec4(mix(u_base_color, gold, 0.5), intensity * pulse * 0.9);
    } else if (u_confidence_type == 1) {
      // Belum Cukup Bukti: dim red pulse
      float pulse = 0.4 + 0.2 * sin(u_time * 4.0);
      vec3 red = vec3(0.8, 0.15, 0.15);
      glowColor = vec4(red, intensity * pulse * 0.65);
    } else {
      // Default / Conflict: glitching oscillating warning yellow-red
      float glitch = step(0.9, sin(u_time * 12.0 + cos(u_time * 30.0)));
      vec3 warnRed = vec3(0.85, 0.1, 0.1);
      vec3 warnYellow = vec3(0.85, 0.75, 0.15);
      glowColor = vec4(mix(warnRed, warnYellow, glitch), intensity * (0.5 + glitch * 0.4));
    }
    
    gl_FragColor = glowColor;
  }
`;

export function GraphCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    filteredNodes,
    filteredEdges,
    selectedNode,
    hoveredNode,
    setSelectedNode,
    setHoveredNode,
    setViewMode,
  } = useGraphStore();

  const [tooltip, setTooltip] = useState<{
    label: string;
    x: number;
    y: number;
    visible: boolean;
    excerpt?: string;
  }>({ label: "", x: 0, y: 0, visible: false });

  // Refs for animation loop cleanups
  const requestRef = useRef<number>(0);
  const simNodesRef = useRef<SimNode[]>([]);
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const glowMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const isDraggingRef = useRef<boolean>(false);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Scene & Setup
    const scene = new THREE.Scene();
    // Dark forest paper background
    scene.background = new THREE.Color("#0a1411");

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 1, 2000);
    camera.position.set(0, 0, 450);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 1000;
    controls.minDistance = 30;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x46cfa8, 1.2, 800);
    pointLight.position.set(100, 200, 150);
    scene.add(pointLight);

    // 6. Geometry definitions
    const sphereGeo = new THREE.SphereGeometry(6, 16, 16);
    const boxGeo = new THREE.BoxGeometry(8, 8, 8);
    const coneGeo = new THREE.ConeGeometry(6, 10, 4);
    const cylinderGeo = new THREE.CylinderGeometry(4, 4, 10, 8);
    const glowGeo = new THREE.SphereGeometry(8.5, 16, 16);

    // Dynamic glow material uniforms
    const uTime = { value: 0 };

    // Group for nodes and lines
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Initialize node representation meshes
    const meshMap = new Map<string, THREE.Mesh>();
    const glowMap = new Map<string, THREE.Mesh>();

    // 7. Seed node coordinates in 3D
    const prevSimNodes = simNodesRef.current;
    const simNodes: SimNode[] = filteredNodes.map((n) => {
      const existing = prevSimNodes.find((prev) => prev.id === n.id);
      if (existing) {
        return { ...n, x: existing.x, y: existing.y, z: existing.z, vx: existing.vx, vy: existing.vy, vz: existing.vz };
      }
      // Sphere placement coordinates
      const angle = Math.random() * Math.PI * 2;
      const radius = 120 + Math.random() * 80;
      return {
        ...n,
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 60,
        vx: 0,
        vy: 0,
        vz: 0,
      };
    });
    simNodesRef.current = simNodes;

    // Map ID to node references
    const nodeById = new Map<string, SimNode>();
    simNodes.forEach((n) => nodeById.set(n.id, n));

    // Populate materials and meshes
    simNodes.forEach((node) => {
      const colorVal = getColorOf(node);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorVal),
        roughness: 0.25,
        metalness: 0.75,
      });

      let mesh: THREE.Mesh;
      if (node.type === "artikel") {
        mesh = new THREE.Mesh(sphereGeo, mat);
      } else if (node.type === "sumber") {
        mesh = new THREE.Mesh(boxGeo, mat);
      } else if (node.type === "topik") {
        mesh = new THREE.Mesh(coneGeo, mat);
      } else {
        mesh = new THREE.Mesh(cylinderGeo, mat);
      }

      mesh.name = node.id;
      graphGroup.add(mesh);
      meshMap.set(node.id, mesh);

      // Create glow halo for nodes
      const glowMat = new THREE.ShaderMaterial({
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        uniforms: {
          u_time: uTime,
          u_confidence_type: { value: node.id.includes("a:") ? 0 : 2 }, // Articles get gold pulses, others warning glows
          u_base_color: { value: new THREE.Color(colorVal) },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.visible = false; // Hover/selection toggles visibility
      graphGroup.add(glowMesh);
      glowMap.set(node.id, glowMesh);
    });

    meshMapRef.current = meshMap;
    glowMapRef.current = glowMap;

    // Line segments geometry for connections
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x9ecdbf,
      transparent: true,
      opacity: 0.15,
      linewidth: 1,
    });

    const lineGeometry = new THREE.BufferGeometry();
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    graphGroup.add(lineSegments);

    // 8. 3D D3-like physics simulation tick
    const tickPhysics = () => {
      // 8.1 Repulsion forces
      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const a = simNodes[i];
          const b = simNodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let dz = a.z - b.z;
          let d2 = dx * dx + dy * dy + dz * dz || 0.1;
          const d = Math.sqrt(d2);
          if (d > 350) continue; // Out of range

          const f = 1200 / d2;
          dx /= d;
          dy /= d;
          dz /= d;

          a.vx += dx * f;
          a.vy += dy * f;
          a.vz += dz * f;
          b.vx -= dx * f;
          b.vy -= dy * f;
          b.vz -= dz * f;
        }
      }

      // 8.2 Link Spring pulls
      filteredEdges.forEach((edge) => {
        const sId = typeof edge.source === "string" ? edge.source : (edge.source as any).id;
        const tId = typeof edge.target === "string" ? edge.target : (edge.target as any).id;

        const sNode = nodeById.get(sId);
        const tNode = nodeById.get(tId);

        if (sNode && tNode) {
          let dx = tNode.x - sNode.x;
          let dy = tNode.y - sNode.y;
          let dz = tNode.z - sNode.z;
          const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;

          // Target distance based on relation type
          const targetDist = edge.relasi.includes("seri") ? 60 : edge.relasi.includes("sumber") ? 90 : 75;
          const f = (d - targetDist) * 0.025;

          dx /= d;
          dy /= d;
          dz /= d;

          sNode.vx += dx * f;
          sNode.vy += dy * f;
          sNode.vz += dz * f;
          tNode.vx -= dx * f;
          tNode.vy -= dy * f;
          tNode.vz -= dz * f;
        }
      });

      // 8.3 Gravity and Damping update
      const gravity = 0.0025;
      simNodes.forEach((node) => {
        // Soft pull to coordinate origin
        node.vx += (0 - node.x) * gravity;
        node.vy += (0 - node.y) * gravity;
        node.vz += (0 - node.z) * gravity;

        node.vx *= 0.82;
        node.vy *= 0.82;
        node.vz *= 0.82;

        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;
      });
    };

    // 9. Raycasting for hovers / clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedNode = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(meshMap.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        return intersects[0].object.name;
      }
      return null;
    };

    // 10. Frame Render loop
    const animate = () => {
      uTime.value += 0.015;

      tickPhysics();

      // Render nodes and update active glows
      const trace = hoveredNode ? computeAuditorTrace(filteredNodes, filteredEdges, hoveredNode) : null;

      simNodes.forEach((node) => {
        const mesh = meshMap.get(node.id);
        const glow = glowMap.get(node.id);

        if (mesh) {
          mesh.position.set(node.x, node.y, node.z);

          // Auditor trace opacity highlight logic
          if (trace) {
            const hasConnect = trace.highlightNodes.has(node.id);
            if (node.id === hoveredNode) {
              mesh.scale.set(1.2, 1.2, 1.2);
              (mesh.material as THREE.MeshStandardMaterial).opacity = 1.0;
            } else if (hasConnect) {
              const deg = trace.degrees.get(node.id) || 2;
              const scaleVal = deg === 1 ? 1.0 : 0.85;
              mesh.scale.set(scaleVal, scaleVal, scaleVal);
              (mesh.material as THREE.MeshStandardMaterial).opacity = deg === 1 ? 0.95 : 0.6;
            } else {
              mesh.scale.set(0.6, 0.6, 0.6);
              (mesh.material as THREE.MeshStandardMaterial).opacity = 0.08;
            }
            (mesh.material as THREE.MeshStandardMaterial).transparent = true;
          } else if (selectedNode) {
            // Selected node has focus
            const isSel = node.id === selectedNode;
            mesh.scale.set(isSel ? 1.3 : 0.8, isSel ? 1.3 : 0.8, isSel ? 1.3 : 0.8);
            (mesh.material as THREE.MeshStandardMaterial).opacity = isSel ? 1.0 : 0.45;
            (mesh.material as THREE.MeshStandardMaterial).transparent = true;
          } else {
            mesh.scale.set(1.0, 1.0, 1.0);
            (mesh.material as THREE.MeshStandardMaterial).opacity = 1.0;
            (mesh.material as THREE.MeshStandardMaterial).transparent = false;
          }
        }

        if (glow) {
          glow.position.set(node.x, node.y, node.z);
          // Show glow only for selected/hovered nodes or strong articles
          const isGlowActive =
            node.id === hoveredNode ||
            node.id === selectedNode ||
            (node.type === "artikel" && !hoveredNode && !selectedNode);

          glow.visible = isGlowActive;
          if (isGlowActive) {
            const sizeMultiplier = node.id === hoveredNode ? 1.4 : 1.2;
            glow.scale.set(sizeMultiplier, sizeMultiplier, sizeMultiplier);
          }
        }
      });

      // Update lines buffer geometry
      const points: number[] = [];
      const lineColors: number[] = [];

      filteredEdges.forEach((edge) => {
        const sId = typeof edge.source === "string" ? edge.source : (edge.source as any).id;
        const tId = typeof edge.target === "string" ? edge.target : (edge.target as any).id;

        const sNode = nodeById.get(sId);
        const tNode = nodeById.get(tId);

        if (sNode && tNode) {
          points.push(sNode.x, sNode.y, sNode.z);
          points.push(tNode.x, tNode.y, tNode.z);

          // Link opacity highlights based on trace
          let alpha = 0.18;
          if (trace) {
            const linkKey = `${sId}-${tId}`;
            const linkKeyRev = `${tId}-${sId}`;
            if (trace.highlightLinks.has(linkKey) || trace.highlightLinks.has(linkKeyRev)) {
              alpha = 0.85;
            } else {
              alpha = 0.02; // Fade out completely
            }
          } else if (selectedNode) {
            const connectsToSel = sId === selectedNode || tId === selectedNode;
            alpha = connectsToSel ? 0.65 : 0.04;
          }

          // Dark teal rule lines matching NaLI
          lineColors.push(0.62, 0.8, 0.75, alpha); // #9ecdbf / rgb(158, 205, 191)
          lineColors.push(0.62, 0.8, 0.75, alpha);
        }
      });

      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
      lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 4));
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Enable colored vertex line segment overrides
      lineMaterial.vertexColors = true;
      lineMaterial.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);

      requestRef.current = requestAnimationFrame(animate);
    };

    // Kickoff
    requestRef.current = requestAnimationFrame(animate);

    // Event handlers
    const handlePointerMove = (e: MouseEvent) => {
      if (isDraggingRef.current) return;
      const hoveredId = getIntersectedNode(e);
      if (hoveredId !== hoveredNode) {
        setHoveredNode(hoveredId);

        if (hoveredId) {
          const node = nodeById.get(hoveredId);
          if (node) {
            setTooltip({
              label: node.label,
              x: e.clientX,
              y: e.clientY - 40,
              visible: true,
              excerpt: node.excerpt,
            });
          }
        } else {
          setTooltip((prev) => ({ ...prev, visible: false }));
        }
      } else if (hoveredId && tooltip.visible) {
        // Move tooltip with cursor
        setTooltip((prev) => ({
          ...prev,
          x: e.clientX,
          y: e.clientY - 40,
        }));
      }
    };

    const handlePointerDown = () => {
      isDraggingRef.current = false;
    };

    const handleMouseMove = () => {
      isDraggingRef.current = true;
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (isDraggingRef.current) return; // Ignore drag finishes
      const clickedId = getIntersectedNode(e);
      setSelectedNode(clickedId);

      if (clickedId) {
        setViewMode("local");
        const node = nodeById.get(clickedId);
        if (node) {
          // Camera slerp camera animation
          gsap.to(camera.position, {
            x: node.x,
            y: node.y,
            z: node.z + 180,
            duration: 1.2,
            ease: "power2.inOut",
            onUpdate: () => {
              controls.target.set(node.x, node.y, node.z);
            },
          });
        }
      } else {
        setViewMode("global");
      }
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mousedown", handlePointerDown);
    renderer.domElement.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("mousemove", handlePointerMove);

    const handleResize = () => {
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("mousemove", handleMouseMove);
        renderer.domElement.removeEventListener("mousedown", handlePointerDown);
        renderer.domElement.removeEventListener("mouseup", handlePointerUp);
      }
      renderer.dispose();
      currentMount.removeChild(renderer.domElement);
    };
  }, [
    filteredNodes,
    filteredEdges,
    selectedNode,
    hoveredNode,
    setHoveredNode,
    setSelectedNode,
    setViewMode,
    tooltip.visible,
  ]);

  // Navigate to slug on double click
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (selectedNode) {
      const node = filteredNodes.find((n) => n.id === selectedNode);
      if (node?.href) {
        window.location.href = node.href;
      }
    }
  };

  return (
    <div
      className="relative w-full h-[620px] border border-[#9ecdbf] bg-[#0a1411] cursor-grab active:cursor-grabbing select-none"
      onDoubleClick={handleDoubleClick}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Epistemic Tooltip Overlay */}
      {tooltip.visible && (
        <div
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          className="pointer-events-none fixed z-50 bg-[#0a1411]/95 border border-[#9ecdbf] p-3 text-xs font-mono text-[#cfe8df] shadow-2xl max-w-xs transition-opacity duration-150"
        >
          <div className="font-bold text-[#46cfa8] border-b border-[#9ecdbf]/30 pb-1 mb-1.5 flex justify-between gap-4">
            <span>{tooltip.label}</span>
            {selectedNode && (
              <span className="text-[10px] text-gray-light leading-none">[Double Click to Open]</span>
            )}
          </div>
          {tooltip.excerpt && (
            <p className="text-[10px] text-[#9ecdbf] leading-relaxed italic">{tooltip.excerpt}</p>
          )}
        </div>
      )}

      {/* Floating Control Tips */}
      <div className="absolute top-4 left-4 pointer-events-none bg-[#0a1411]/80 border border-[#9ecdbf]/40 p-2 font-mono text-[9px] text-emerald-800/80 leading-relaxed uppercase">
        <div>[Klik Kiri]: Fokus Simpul</div>
        <div>[Tarik Kiri]: Putar Kamera</div>
        <div>[Tarik Kanan]: Geser Kamera</div>
        <div>[Scroll]: Zoom Kamera</div>
        <div>[Double Klik]: Buka Artikel</div>
      </div>
    </div>
  );
}
