"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useGraphStore } from "./useGraphStore";
import { computeAuditorTrace } from "./computeAuditorTrace";
import type { GraphNode, GraphEdge } from "@/lib/graph";
import gsap from "gsap";
import Portal from "./Portal";
import EpistemicHoverCard from "./EpistemicHoverCard";
import useTooltipProjection from "./useTooltipProjection";
import useHoverDebounce from "./useHoverDebounce";

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
      // Default / Conflict: glitching warning yellow-red
      float glitch = step(0.9, sin(u_time * 12.0 + cos(u_time * 30.0)));
      vec3 warnRed = vec3(0.85, 0.1, 0.1);
      vec3 warnYellow = vec3(0.85, 0.75, 0.15);
      glowColor = vec4(mix(warnRed, warnYellow, glitch), intensity * (0.5 + glitch * 0.4));
    }
    
    gl_FragColor = glowColor;
  }
`;

// Helper function to recursively dispose resources and prevent memory leaks in strict mode
function disposeWebGLContext(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  controls: OrbitControls | null
) {
  if (controls) {
    controls.dispose();
  }

  scene.traverse((object: any) => {
    if (!object) return;

    if (object.geometry) {
      if (object.geometry.boundsTree) {
        object.geometry.boundsTree = null;
      }
      object.geometry.dispose();
    }

    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((mat: THREE.Material) => mat.dispose());
      } else {
        object.material.dispose();
      }
    }
  });

  renderer.dispose();
  renderer.forceContextLoss();
}

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

  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Debounced hover state hook
  const { activeNode: activeHoveredNodeId, onMouseEnter, onMouseLeave } = useHoverDebounce(150);

  // Tooltip coordinate projection hook
  const { position2D, isVisible, projectNode, setIsVisible } = useTooltipProjection();

  // Refs for animation loop cleanups
  const requestRef = useRef<number>(0);
  const simNodesRef = useRef<SimNode[]>([]);
  const meshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const glowMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const isDraggingRef = useRef<boolean>(false);

  // Track viewport dimensions on client-side
  useEffect(() => {
    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Scene & Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a1411");

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 1, 2000);
    camera.position.set(0, 0, 450);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

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

    const uTime = { value: 0 };

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    const meshMap = new Map<string, THREE.Mesh>();
    const glowMap = new Map<string, THREE.Mesh>();

    // 7. Seed node coordinates in 3D
    const prevSimNodes = simNodesRef.current;
    const simNodes: SimNode[] = filteredNodes.map((n) => {
      const existing = prevSimNodes.find((prev) => prev.id === n.id);
      if (existing) {
        return {
          ...n,
          x: existing.x,
          y: existing.y,
          z: existing.z,
          vx: existing.vx,
          vy: existing.vy,
          vz: existing.vz,
        };
      }
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

    const nodeById = new Map<string, SimNode>();
    simNodes.forEach((n) => nodeById.set(n.id, n));

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

      // Create glow material shader uniforms
      const glowMat = new THREE.ShaderMaterial({
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        uniforms: {
          u_time: uTime,
          u_confidence_type: { value: node.confidence === "high" ? 0 : node.confidence === "needs-verification" ? 1 : 2 },
          u_base_color: { value: new THREE.Color(colorVal) },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.visible = false;
      graphGroup.add(glowMesh);
      glowMap.set(node.id, glowMesh);
    });

    meshMapRef.current = meshMap;
    glowMapRef.current = glowMap;

    // Single Draw-call batching of lines
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x9ecdbf,
      transparent: true,
      opacity: 0.15,
      linewidth: 1,
    });

    const lineGeometry = new THREE.BufferGeometry();
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    graphGroup.add(lineSegments);

    // 8. 3D physics simulation tick
    const tickPhysics = () => {
      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const a = simNodes[i];
          const b = simNodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let dz = a.z - b.z;
          let d2 = dx * dx + dy * dy + dz * dz || 0.1;
          const d = Math.sqrt(d2);
          if (d > 350) continue;

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

      const gravity = 0.0025;
      simNodes.forEach((node) => {
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

    // 9. Raycasting for hovers/clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedNode = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

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

      // Determine active trace
      const activeHoverId = activeHoveredNodeId || hoveredNode;
      const trace = activeHoverId ? computeAuditorTrace(filteredNodes, filteredEdges, activeHoverId) : null;

      // Update positions of meshes directly on Three.js objects (no React setState)
      simNodes.forEach((node) => {
        const mesh = meshMap.get(node.id);
        const glow = glowMap.get(node.id);

        if (mesh) {
          mesh.position.set(node.x, node.y, node.z);

          if (trace) {
            const hasConnect = trace.highlightNodes.has(node.id);
            if (node.id === activeHoverId) {
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
          const isGlowActive =
            node.id === activeHoverId ||
            node.id === selectedNode ||
            (node.type === "artikel" && !activeHoverId && !selectedNode);

          glow.visible = isGlowActive;
          if (isGlowActive) {
            const sizeMultiplier = node.id === activeHoverId ? 1.4 : 1.2;
            glow.scale.set(sizeMultiplier, sizeMultiplier, sizeMultiplier);
          }
        }
      });

      // Update batched lines coordinates
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

          let alpha = 0.18;
          if (trace) {
            const linkKey = `${sId}-${tId}`;
            const linkKeyRev = `${tId}-${sId}`;
            if (trace.highlightLinks.has(linkKey) || trace.highlightLinks.has(linkKeyRev)) {
              alpha = 0.85;
            } else {
              alpha = 0.02;
            }
          } else if (selectedNode) {
            const connectsToSel = sId === selectedNode || tId === selectedNode;
            alpha = connectsToSel ? 0.65 : 0.04;
          }

          lineColors.push(0.62, 0.8, 0.75, alpha);
          lineColors.push(0.62, 0.8, 0.75, alpha);
        }
      });

      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
      lineGeometry.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 4));
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      lineMaterial.vertexColors = true;
      lineMaterial.needsUpdate = true;

      // Project hovered coordinates to 2D for the React Portal Tooltip
      if (activeHoverId) {
        const hoveredMesh = meshMap.get(activeHoverId);
        if (hoveredMesh) {
          projectNode(hoveredMesh.position, activeHoverId, camera, renderer, scene);
        }
      } else {
        setIsVisible(false);
      }

      controls.update();
      renderer.render(scene, camera);

      requestRef.current = requestAnimationFrame(animate);
    };

    // Kickoff
    requestRef.current = requestAnimationFrame(animate);

    // Event handlers using Debounced state triggers
    const handlePointerMove = (e: MouseEvent) => {
      if (isDraggingRef.current) return;
      const hoveredId = getIntersectedNode(e.clientX, e.clientY);
      if (hoveredId) {
        onMouseEnter(hoveredId);
        setHoveredNode(hoveredId);
      } else {
        onMouseLeave();
        setHoveredNode(null);
      }
    };

    const handlePointerDown = () => {
      isDraggingRef.current = false;
    };

    const handleMouseMove = () => {
      isDraggingRef.current = true;
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (isDraggingRef.current) return;
      const clickedId = getIntersectedNode(e.clientX, e.clientY);
      setSelectedNode(clickedId);

      if (clickedId) {
        setViewMode("local");
        const node = nodeById.get(clickedId);
        if (node) {
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

    // Mobile touch events: single tap selects node and shows tooltip, tap outside dismisses
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      isDraggingRef.current = false;
    };

    const handleTouchMove = () => {
      isDraggingRef.current = true;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isDraggingRef.current) return;
      if (e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const clickedId = getIntersectedNode(touch.clientX, touch.clientY);
      
      setSelectedNode(clickedId);
      if (clickedId) {
        setViewMode("local");
        setHoveredNode(clickedId);
        onMouseEnter(clickedId);
        const node = nodeById.get(clickedId);
        if (node) {
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
        setHoveredNode(null);
        onMouseLeave();
      }
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("mousedown", handlePointerDown);
    renderer.domElement.addEventListener("mouseup", handlePointerUp);
    renderer.domElement.addEventListener("touchstart", handleTouchStart, { passive: true });
    renderer.domElement.addEventListener("touchmove", handleTouchMove, { passive: true });
    renderer.domElement.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousemove", handlePointerMove);

    const handleResize = () => {
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Strict Mode Perfect Cleanup using disposeWebGLContext
    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener("mousemove", handleMouseMove);
        renderer.domElement.removeEventListener("mousedown", handlePointerDown);
        renderer.domElement.removeEventListener("mouseup", handlePointerUp);
        renderer.domElement.removeEventListener("touchstart", handleTouchStart);
        renderer.domElement.removeEventListener("touchmove", handleTouchMove);
        renderer.domElement.removeEventListener("touchend", handleTouchEnd);
      }
      disposeWebGLContext(scene, renderer, controls);
      currentMount.removeChild(renderer.domElement);
    };
  }, [
    filteredNodes,
    filteredEdges,
    selectedNode,
    hoveredNode,
    activeHoveredNodeId,
    setHoveredNode,
    setSelectedNode,
    setViewMode,
    onMouseEnter,
    onMouseLeave,
    projectNode,
    setIsVisible,
  ]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (selectedNode) {
      const node = filteredNodes.find((n) => n.id === selectedNode);
      if (node?.href) {
        window.location.href = node.href;
      }
    }
  };

  const activeHoveredNode = filteredNodes.find(
    (n) => n.id === (activeHoveredNodeId || hoveredNode)
  );

  return (
    <div
      className="relative w-full h-[620px] border border-[#9ecdbf] bg-[#0a1411] cursor-grab active:cursor-grabbing select-none"
      onDoubleClick={handleDoubleClick}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Epistemic Hover Card portal overlay */}
      {isVisible && position2D && activeHoveredNode && (
        <Portal>
          <EpistemicHoverCard
            title={activeHoveredNode.label}
            confidence={activeHoveredNode.confidence || "high"}
            excerpt={activeHoveredNode.excerpt || ""}
            year={activeHoveredNode.year}
            province={activeHoveredNode.locationLabels?.[0]}
            sourcesCount={activeHoveredNode.sourcesCount || 0}
            x={position2D.x}
            y={position2D.y}
            viewportWidth={viewportSize.width}
            viewportHeight={viewportSize.height}
          />
        </Portal>
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
export default GraphCanvas;
