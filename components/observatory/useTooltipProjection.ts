"use client";

import { useState, useRef, useCallback } from "react";
import * as THREE from "three";

export function useTooltipProjection() {
  const [position2D, setPosition2D] = useState<{ x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const tempV3 = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());

  const projectNode = useCallback(
    (
      nodePosition: THREE.Vector3,
      nodeName: string,
      camera: THREE.Camera,
      renderer: THREE.WebGLRenderer,
      scene: THREE.Scene
    ) => {
      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();

      // 1. Project 3D vector to Normalized Device Coordinates (NDC)
      tempV3.current.copy(nodePosition).project(camera);

      // 2. Behind camera / frustum culling check
      if (tempV3.current.z > 1.0) {
        setIsVisible(false);
        return;
      }

      // 3. Occlusion Check (Raycast to verify line of sight)
      const dir = new THREE.Vector3().copy(nodePosition).sub(camera.position).normalize();
      raycaster.current.set(camera.position, dir);

      // Filter intersects to avoid hitting particles/lines, only meshes
      const meshes: THREE.Object3D[] = [];
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          meshes.push(obj);
        }
      });

      const intersects = raycaster.current.intersectObjects(meshes, true);
      if (intersects.length > 0) {
        const firstHit = intersects[0].object;
        const targetDist = camera.position.distanceTo(nodePosition);
        if (
          firstHit.name !== nodeName &&
          intersects[0].distance < targetDist - 0.5
        ) {
          // Occluded by a foreground mesh object
          setIsVisible(false);
          return;
        }
      }

      // 4. Map to 2D absolute DOM positions relative to viewport
      const x = ((tempV3.current.x + 1) / 2) * rect.width + rect.left;
      const y = ((1 - tempV3.current.y) / 2) * rect.height + rect.top;

      setPosition2D({ x, y });
      setIsVisible(true);
    },
    []
  );

  return { position2D, isVisible, projectNode, setIsVisible };
}

export default useTooltipProjection;
