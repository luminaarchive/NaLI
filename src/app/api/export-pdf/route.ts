import { NextRequest } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { tmpdir } from "os";
import path from "path";

const execAsync = promisify(exec);

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let tmpIn: string | null = null;
  let tmpOut: string | null = null;

  try {
    const data = await req.json();

    if (!data || typeof data !== "object") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ts = Date.now();
    tmpIn = path.join(tmpdir(), `nali_in_${ts}.json`);
    tmpOut = path.join(tmpdir(), `nali_out_${ts}.pdf`);

    writeFileSync(tmpIn, JSON.stringify(data), "utf-8");

    const scriptPath = path.join(process.cwd(), "scripts", "nali_pdf_generator.py");

    if (!existsSync(scriptPath)) {
      return new Response(JSON.stringify({ error: "PDF generator script not found" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { stderr } = await execAsync(`python3 "${scriptPath}" "${tmpIn}" "${tmpOut}"`, {
      timeout: 55000,
    });

    if (stderr && stderr.toLowerCase().includes("error")) {
      console.error("PDF generator stderr:", stderr);
      return new Response(JSON.stringify({ error: "PDF generation failed", detail: stderr }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!existsSync(tmpOut)) {
      return new Response(JSON.stringify({ error: "PDF output file not created" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const pdfBytes = readFileSync(tmpOut);

    const titleSlug = String(data.title || "NaLI_Report")
      .slice(0, 50)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-]/g, "");

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${titleSlug}.pdf"`,
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Export PDF error:", msg);

    if (msg.includes("python3") && msg.includes("not found")) {
      return new Response(
        JSON.stringify({
          error: "Python tidak tersedia di deployment ini",
          detail: "Export fitur membutuhkan Python runtime. Gunakan tombol Salin teks.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "Internal server error", detail: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    if (tmpIn && existsSync(tmpIn)) {
      try {
        unlinkSync(tmpIn);
      } catch {}
    }
    if (tmpOut && existsSync(tmpOut)) {
      try {
        unlinkSync(tmpOut);
      } catch {}
    }
  }
}
