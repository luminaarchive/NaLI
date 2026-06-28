import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isSameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/* -------------------------------------------------------------------------- */
/*  Citizen field-report intake (Step 2.3).                                    */
/*                                                                            */
/*  Anonymous, same-origin, server-validated. Stores an UNVERIFIED observation */
/*  in `citizen_reports` (insert-only RLS) + an optional photo in the          */
/*  citizen-reports bucket. Reports stay private until an admin promotes them. */
/* -------------------------------------------------------------------------- */

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Asal permintaan tidak sah" }, { status: 403 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Pretend success without storing anything.
  if (str(form, "website")) return NextResponse.json({ ok: true });

  const subject = str(form, "subject");
  const description = str(form, "description");
  const locationLabel = str(form, "location_label");
  const reporterName = str(form, "reporter_name");
  const reporterContact = str(form, "reporter_contact");
  const missionId = str(form, "mission_id");
  const latRaw = str(form, "lat");
  const lngRaw = str(form, "lng");

  // Required + length validation (mirrors the DB CHECK).
  if (subject.length < 1 || subject.length > 200) {
    return NextResponse.json({ error: "Subjek wajib diisi (maks 200 karakter)." }, { status: 400 });
  }
  if (description.length < 1 || description.length > 5000) {
    return NextResponse.json({ error: "Deskripsi wajib diisi (maks 5000 karakter)." }, { status: 400 });
  }
  if (locationLabel.length > 200 || reporterName.length > 120 || reporterContact.length > 200) {
    return NextResponse.json({ error: "Sebagian isian terlalu panjang." }, { status: 400 });
  }

  // GPS sanity (optional).
  let lat: number | null = null;
  let lng: number | null = null;
  if (latRaw || lngRaw) {
    const la = Number(latRaw);
    const ln = Number(lngRaw);
    if (Number.isFinite(la) && Number.isFinite(ln) && la >= -90 && la <= 90 && ln >= -180 && ln <= 180) {
      lat = la;
      lng = ln;
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Layanan belum dikonfigurasi" }, { status: 503 });
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Optional photo: validate type + size, upload to the capped bucket.
  let photoUrl: string | null = null;
  const photo = form.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!ALLOWED_TYPES.includes(photo.type)) {
      return NextResponse.json({ error: "Foto harus JPG, PNG, atau WebP." }, { status: 400 });
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "Foto maksimal 5 MB." }, { status: 400 });
    }
    const path = `reports/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${EXT[photo.type]}`;
    const { error: upErr } = await supabase.storage
      .from("citizen-reports")
      .upload(path, photo, { contentType: photo.type, upsert: false });
    if (upErr) {
      return NextResponse.json({ error: "Gagal mengunggah foto." }, { status: 500 });
    }
    photoUrl = supabase.storage.from("citizen-reports").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from("citizen_reports").insert({
    subject,
    description,
    location_label: locationLabel || null,
    lat,
    lng,
    photo_url: photoUrl,
    reporter_name: reporterName || null,
    reporter_contact: reporterContact || null,
    mission_id: missionId || null,
  });

  if (error) {
    return NextResponse.json({ error: "Gagal mengirim laporan." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
