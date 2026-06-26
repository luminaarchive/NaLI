export interface AnchorStyles {
  transform: string;
  className: string;
}

export function computeSmartAnchor(
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
  tooltipWidth = 320,
  tooltipHeight = 180,
  padding = 16
): AnchorStyles {
  let translateX = `${padding}px`;
  let translateY = `${padding}px`;
  let verticalAnchor = "top";
  let horizontalAnchor = "left";

  // Check right boundary overflow
  if (x + tooltipWidth + padding > viewportWidth) {
    translateX = `calc(-100% - ${padding}px)`;
    horizontalAnchor = "right";
  }

  // Check bottom boundary overflow
  if (y + tooltipHeight + padding > viewportHeight) {
    translateY = `calc(-100% - ${padding}px)`;
    verticalAnchor = "bottom";
  }

  return {
    transform: `translate3d(${translateX}, ${translateY}, 0)`,
    className: `anchor-${verticalAnchor}-${horizontalAnchor}`,
  };
}
