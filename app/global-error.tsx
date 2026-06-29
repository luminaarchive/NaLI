"use client";

import { useEffect } from "react";

/* -------------------------------------------------------------------------- */
/*  Root error boundary.                                                       */
/*                                                                            */
/*  Last-resort fallback for errors thrown in the root layout itself (where    */
/*  the segment error.tsx cannot help). It must render its own <html>/<body>.  */
/*  Kept dependency-free and inline-styled so it works even if the app shell   */
/*  or stylesheet failed to load.                                              */
/* -------------------------------------------------------------------------- */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary:", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          color: "#0E3A5C",
          fontFamily:
            "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(14,58,92,0.6)",
              margin: 0,
            }}
          >
            NaLI
          </p>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "1.9rem",
              lineHeight: 1.2,
              margin: "0.75rem 0 0",
            }}
          >
            Situs sedang tersendat
          </h1>
          <p
            style={{
              fontSize: "0.85rem",
              lineHeight: 1.7,
              color: "rgba(14,58,92,0.75)",
              marginTop: "1rem",
            }}
          >
            Terjadi gangguan teknis saat memuat halaman. Ini di sisi kami, bukan
            kesalahanmu. Coba muat ulang sebentar lagi.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              border: "1px solid #0E3A5C",
              background: "#0E3A5C",
              color: "#ffffff",
              padding: "0.7rem 1.25rem",
              fontSize: "0.74rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Coba muat ulang
          </button>
          {error?.digest && (
            <p
              style={{
                marginTop: "1.5rem",
                fontSize: "0.66rem",
                color: "rgba(14,58,92,0.4)",
              }}
            >
              Kode rujukan: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
