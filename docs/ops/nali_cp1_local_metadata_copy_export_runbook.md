# Operations Runbook: Local Image Metadata Helper & Offline Copy Export

This runbook outlines operational procedures, troubleshooting steps, and privacy boundaries for the Local Image Metadata Helper and client-side Copy/Download features.

## How the Metadata Helper Works

1. **Local-Only File Scanning**:
   - The user selects a photo from their device via the `input[type="file"]` inside the detail fields.
   - The browser parses the image locally using a dynamically imported version of the `exifr` parser.
   - It extracts the `DateTimeOriginal` EXIF tag and GPS coordinates (latitude/longitude).
2. **Review & Apply**:
   - The extracted data is shown to the user in a preview panel.
   - The user must explicitly click "Gunakan sebagai isian awal" to copy these values to the "Lokasi" and "Keterangan bahan/lampiran" fields.
   - If values already exist in those fields, the browser prompts the user with a confirmation dialog before overwriting.

## Explaining "File Not Uploaded"

- **Customer Support Script**:
  - *"NaLI tidak pernah mengunggah foto Anda ke server kami. Aplikasi ini hanya membaca data waktu dan koordinat secara lokal dari dalam browser perangkat Anda. File gambar tidak disimpan di database kami dan tidak dikirim ke internet."*
- **UI Copy Marker**:
  - The text `File tidak diupload` is explicitly appended to prefilled fields to guarantee transparency.

## Troubleshooting

### What to Do If Metadata Is Missing

- **Cause**: Many modern messaging apps (WhatsApp, Telegram) and social media platforms strip EXIF metadata when saving or sending images.
- **Action**:
  - Advise the user to select the original camera photo file rather than a downloaded copy from messaging apps.
  - The user can fill the location and date manually in the form fields.
  - NaLI will display a warning: "Metadata lokasi dan waktu pengambilan foto tidak ditemukan di dalam file."

### What to Do If GPS Is Wrong/Missing

- **Cause**: Device location services were turned off when the picture was taken, or the EXIF record was altered.
- **Action**:
  - The coordinates are prefilled as a guide ("Perkiraan koordinat...").
  - The user can edit the coordinates directly in the "Lokasi" field.

## How Local Copy/Download Works

1. **Free Preview Actions**:
   - Users can copy Markdown text directly, copy stripped plain text, or download `.md` and `.txt` files offline.
   - File downloads are generated entirely in the client's browser as memory Blobs, meaning they work even without internet connection.
2. **PDF/Payment Status**:
   - PDF downloads remain locked in this phase.
   - If users try to download a PDF, they will see the testing-phase warning: *"PDF berbayar belum aktif di fase testing ini. Export berbayar masih terkunci."*

## Privacy & Security Policy

- **No binary data in storage**: Never store base64 string outputs of selected images in recovery snapshots or cache.
- **Strict sanitization**: File names are sanitized on load to remove double dots, slashes, or script injections.
