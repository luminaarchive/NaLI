"use client";

import { useState, useRef, useCallback } from "react";

export function useHoverDebounce(delay = 150) {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onMouseEnter = useCallback(
    (nodeId: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setActiveNode(nodeId);
      }, delay);
    },
    [delay]
  );

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveNode(null);
  }, []);

  return { activeNode, onMouseEnter, onMouseLeave };
}

export default useHoverDebounce;
