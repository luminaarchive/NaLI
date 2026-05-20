# Fluid Ambient Background Video Asset Guidelines

This folder is designated for the premium looping video background files used on the NaLI homepage. The background player `FluidVideoBackground` uses these files for high-fidelity ambient rendering, falling back to a CSS-animated gradient if they are missing or if the browser blocks video autoplay.

## Required Assets

Place the following files in this directory:

1. **`nali-fluid-poster.jpg`**: A static high-quality image file displaying the fluid gradient. Serves as the video placeholder and static fallback for browsers with video disabled, slow connection speeds, or `prefers-reduced-motion` enabled.
2. **`nali-fluid-glow.webm`**: A WebM video file. Highly compressed, premium quality, WebM is the primary file format used for modern browser support.
3. **`nali-fluid-glow.mp4`**: An MP4 video file. Act as a fallback for browsers that do not support WebM.

## Video Specifications

For optimal visuals and loading performance, follow these guidelines when creating the video files:

- **Theme & Style**: Gemini/Google Assistant inspired fluid light clouds. Near-black background base with slow rising, organic breathing emerald, cyan, teal, indigo, and violet fluid glows. Avoid text, sharp elements, stars, grids, particles, or cyberpunk elements.
- **Resolution**: 1920x1080 (minimum) or 2560x1440 (recommended) for crisp display.
- **Duration**: 8 to 12 seconds loop.
- **Seamlessness**: The loop must be completely seamless with identical start and end frames to prevent jumpiness on restart.
- **File Size limits**:
  - **WebM**: Under 6MB.
  - **MP4**: Under 10MB.
- **Bitrate**: Keep the bitrate low (e.g., target 2000-4000 Kbps), utilizing double-pass encoding to ensure smooth dark gradient transitions without visible compression banding.
