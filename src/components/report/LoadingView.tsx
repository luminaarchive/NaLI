"use client";

import { NaLIChatLogoAnimated, ThoughtLine, generateAgenticThoughts } from "./NaLIChatLogo";

interface LoadingViewProps {
  prompt: string;
  model?: string | null;
  activeStep?: number;
  streamingText?: string;
}

export function LoadingView({ prompt, activeStep = 0, streamingText = "" }: LoadingViewProps) {
  const thoughts = generateAgenticThoughts(prompt, activeStep);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "32px",
        padding: "40px 20px",
      }}
    >
      <NaLIChatLogoAnimated size={52} />

      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "0 16px",
        }}
      >
        {thoughts.map((thought, i) => (
          <ThoughtLine
            key={i}
            text={thought}
            isActive={i === thoughts.length - 1}
            delay={i === thoughts.length - 1 ? 200 : 0}
          />
        ))}
      </div>

      {streamingText.length > 0 && (
        <div
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            borderLeft: "2px solid #00FFB330",
            paddingLeft: "12px",
            marginTop: "16px",
            maxWidth: "480px",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            maxHeight: "60px",
            overflow: "hidden",
          }}
        >
          {streamingText.slice(-120)}
        </div>
      )}
    </div>
  );
}
