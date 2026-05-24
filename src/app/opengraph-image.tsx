import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "NaLI — Nature & Evidence Intelligence OS";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          color: "#ffffff",
          padding: "60px",
          border: "4px solid #6f8057",
        }}
      >
        <div
          style={{
            fontSize: "80px",
            fontWeight: "bold",
            letterSpacing: "-0.02em",
            color: "#ffffff",
            marginBottom: "12px",
          }}
        >
          NaLI
        </div>
        <div
          style={{
            fontSize: "22px",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "#6f8057",
            fontWeight: "bold",
            marginBottom: "36px",
          }}
        >
          Nature & Evidence Intelligence OS
        </div>
        <div
          style={{
            fontSize: "20px",
            color: "rgba(255, 255, 255, 0.55)",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.6",
          }}
        >
          Ubah catatan lapangan, praktikum, dan materi observasi menjadi draf laporan lingkungan berbasis bukti terstruktur secara instan.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
