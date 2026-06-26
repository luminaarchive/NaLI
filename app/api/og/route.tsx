import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CATEGORY_COLOR: Record<string, string> = {
  alam: "#2f9e6e",
  sejarah: "#3b6fb0",
  investigasi: "#c9772f",
  sumber: "#8a8f98",
  seri: "#7a5bb0",
  topik: "#b08a3b",
};

const CATEGORY_LABEL: Record<string, string> = {
  alam: "Alam",
  sejarah: "Sejarah",
  investigasi: "Investigasi",
  sumber: "Arsip Sumber",
  seri: "Seri",
  topik: "Topik",
  artikel: "Artikel",
  jurnal: "Jurnal",
  pustaka: "Pustaka",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "NaLI";
  const category = searchParams.get("category") ?? "artikel";
  const date = searchParams.get("date") ?? "";

  const accentColor = CATEGORY_COLOR[category] ?? "#8a8f98";
  const categoryLabel = CATEGORY_LABEL[category] ?? category.toUpperCase();

  // Truncate long titles for readability
  const displayTitle =
    title.length > 90 ? title.slice(0, 87) + "…" : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0E3A5C",
          color: "#F5F0EB",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Accent bar at top */}
        <div
          style={{
            width: "100%",
            height: "4px",
            backgroundColor: accentColor,
          }}
        />

        {/* Content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            padding: "56px 64px 48px 64px",
          }}
        >
          {/* Category + date */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontFamily: "monospace",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: accentColor,
                border: `1px dashed ${accentColor}`,
                padding: "6px 14px",
              }}
            >
              {categoryLabel}
            </span>
            {date && (
              <span
                style={{
                  fontSize: "13px",
                  fontFamily: "monospace",
                  letterSpacing: "0.08em",
                  color: "#8a9fad",
                }}
              >
                {date}
              </span>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              paddingTop: "24px",
              paddingBottom: "24px",
            }}
          >
            <span
              style={{
                fontSize: displayTitle.length > 60 ? "38px" : "46px",
                lineHeight: 1.2,
                fontWeight: 600,
                color: "#F5F0EB",
                maxWidth: "1000px",
              }}
            >
              {displayTitle}
            </span>
          </div>

          {/* Footer branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px dashed #1e5a7d",
              paddingTop: "20px",
            }}
          >
            <span
              style={{
                fontSize: "15px",
                fontFamily: "monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#8a9fad",
              }}
            >
              NaLI - Jurnal Riset Terbuka
            </span>
            <span
              style={{
                fontSize: "13px",
                fontFamily: "monospace",
                color: "#5a7a8d",
              }}
            >
              nalijournal.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
