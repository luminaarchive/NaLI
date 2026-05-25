export interface LocalImageMetadataResult {
  ok: boolean;
  fileName?: string;
  fileType?: string;
  fileSizeBytes?: number;
  capturedAt?: string;
  fileLastModifiedAt?: string;
  latitude?: number;
  longitude?: number;
  locationText?: string;
  warnings: string[];
  source: "local_file_metadata";
  uploaded: false;
}

/**
 * Sanitizes a filename to keep only safe characters.
 */
export function sanitizeFileName(name: string): string {
  if (!name) return "";
  // Keep letters, numbers, dot, dash, underscore, space
  const clean = name
    .replace(/[^\w\s.-]/g, "")
    .replace(/\.+/g, ".")
    .replace(/\s+/g, " ")
    .trim();
  // limit to 80 chars
  return clean.slice(0, 80);
}

/**
 * Reads local metadata (captured date, GPS, etc.) from an image File in the browser.
 * Uses dynamic import("exifr") to keep the initial page bundle size unaffected.
 */
export async function readLocalImageMetadata(file: File): Promise<LocalImageMetadataResult> {
  const result: LocalImageMetadataResult = {
    ok: false,
    warnings: [],
    source: "local_file_metadata",
    uploaded: false,
  };

  // 1. Validation: Safe file constraints
  if (!file) {
    result.warnings.push("File tidak valid atau kosong.");
    return result;
  }

  const fileName = sanitizeFileName(file.name);
  const fileType = file.type || "";
  const fileSizeBytes = file.size;

  result.fileName = fileName;
  result.fileType = fileType;
  result.fileSizeBytes = fileSizeBytes;

  // Accept only image/*
  if (!fileType.startsWith("image/")) {
    result.warnings.push("Tipe file tidak didukung. Harap pilih file gambar (JPEG/PNG).");
    return result;
  }

  // Reject files larger than 10MB
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (fileSizeBytes > MAX_SIZE) {
    result.warnings.push("Ukuran file terlalu besar. Batas maksimal adalah 10MB.");
    return result;
  }

  // File timestamp fallback (lastModified)
  let fileModifiedStr = "";
  try {
    if (file.lastModified) {
      fileModifiedStr = new Date(file.lastModified).toISOString();
      result.fileLastModifiedAt = fileModifiedStr;
    }
  } catch {
    // ignore
  }

  // 2. Parse EXIF metadata using exifr dynamically loaded
  try {
    const exifrModule = await import("exifr");
    // Handle both ESM default export and CommonJS module shape
    const exifr = typeof (exifrModule as any).parse === "function" ? exifrModule : ((exifrModule as any).default || exifrModule);

    // Parse DateTimeOriginal
    const tags = await exifr.parse(file, {
      pick: ["DateTimeOriginal"],
      translateValues: true,
    });

    if (tags && tags.DateTimeOriginal) {
      let captureDate: Date;
      if (tags.DateTimeOriginal instanceof Date) {
        captureDate = tags.DateTimeOriginal;
      } else {
        captureDate = new Date(tags.DateTimeOriginal);
      }
      if (!isNaN(captureDate.getTime())) {
        result.capturedAt = captureDate.toISOString();
      }
    }

    // Parse GPS
    const gps = await exifr.gps(file);
    if (gps && typeof gps.latitude === "number" && typeof gps.longitude === "number") {
      result.latitude = gps.latitude;
      result.longitude = gps.longitude;
      result.locationText = `Perkiraan koordinat dari metadata lokal: lat ${gps.latitude.toFixed(6)}, lon ${gps.longitude.toFixed(6)}`;
    }
  } catch (err) {
    // exifr might throw if file format is unsupported or has no EXIF block
    // We degrade gracefully
  }

  // Determine warnings/success
  if (!result.capturedAt && !result.latitude) {
    result.warnings.push("Metadata lokasi dan waktu pengambilan foto tidak ditemukan di dalam file.");
  } else {
    result.warnings.push("Metadata ini dibaca secara lokal dari file perangkat Anda dan tidak melalui verifikasi server.");
  }

  result.ok = true;
  return result;
}
