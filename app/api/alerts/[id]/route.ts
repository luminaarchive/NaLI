import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/http";
import { deleteAlert, watchAlertsEnabled } from "@/lib/watch-alerts/queries";

export const dynamic = "force-dynamic";

/** DELETE /api/alerts/:id -> remove a watch alert (cascades to its events). */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Asal permintaan tidak sah" }, { status: 403 });
  }
  if (!watchAlertsEnabled) {
    return NextResponse.json({ error: "Layanan belum dikonfigurasi" }, { status: 503 });
  }
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Id tidak valid" }, { status: 400 });
  try {
    await deleteAlert(id);
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
