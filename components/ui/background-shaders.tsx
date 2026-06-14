"use client";

import { Warp } from "@paper-design/shaders-react";

/**
 * Animated "warp" mesh tuned to NaLI's Seri accent (wine/plum). Fills its
 * parent; meant to live inside <PageBackdrop/> as a page atmosphere.
 */
export function SeriWarpBackground() {
  return (
    <Warp
      style={{ width: "100%", height: "100%" }}
      proportion={0.4}
      softness={1}
      distortion={0.25}
      swirl={0.8}
      swirlIterations={10}
      shape="checks"
      shapeScale={0.1}
      scale={1}
      rotation={0}
      speed={0.6}
      colors={[
        "hsl(334, 58%, 40%)",
        "hsl(346, 52%, 56%)",
        "hsl(320, 44%, 30%)",
        "hsl(350, 48%, 62%)",
      ]}
    />
  );
}

export default SeriWarpBackground;
