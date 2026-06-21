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
      minPixelRatio={1}
      maxPixelCount={960 * 540}
      proportion={0.4}
      softness={1}
      distortion={0.25}
      swirl={0.8}
      swirlIterations={4}
      shape="checks"
      shapeScale={0.1}
      scale={1}
      rotation={0}
      speed={0.6}
      colors={[
        "hsl(207, 60%, 26%)",
        "hsl(205, 55%, 44%)",
        "hsl(210, 64%, 18%)",
        "hsl(202, 52%, 52%)",
      ]}
    />
  );
}

export default SeriWarpBackground;
