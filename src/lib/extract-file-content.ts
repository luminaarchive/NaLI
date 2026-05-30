export interface ExtractedFile {
  name: string;
  type: "pdf" | "image" | "text";
  content: string;
  base64?: string;
  sizeKB: number;
}

export async function extractFileContent(file: File): Promise<ExtractedFile> {
  const sizeKB = Math.round(file.size / 1024);
  const name = file.name;

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    const pdfjsLib = await import("pdfjs-dist");
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = (textContent.items as any[])
        .map((item) => item.str)
        .join(" ");
      fullText += `\n--- Halaman ${i} ---\n${pageText}`;
    }
    return { name, type: "pdf", content: fullText.trim(), sizeKB };
  }

  if (file.type.startsWith("image/")) {
    const base64 = await fileToBase64(file);
    return { name, type: "image", content: "", base64, sizeKB };
  }

  if (
    file.type.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".csv") ||
    name.endsWith(".md")
  ) {
    const content = await file.text();
    return { name, type: "text", content, sizeKB };
  }

  throw new Error(`Format file tidak didukung: ${file.type || name}`);
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
