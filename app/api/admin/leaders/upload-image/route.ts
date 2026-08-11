import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const BUCKET = "leader-portraits";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

const ALLOWED = new Set<string>([
  ...ALLOWED_MIMES,
  "image/jpg", // browsers sometimes send this
]);

function safeFileBase(name: string): string {
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "portrait";
}

function extFor(mime: string, filename: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/avif") return "avif";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  const m = filename.toLowerCase().match(/\.(jpe?g|png|webp|gif|avif)$/);
  return m ? m[1].replace("jpeg", "jpg") : "jpg";
}

/**
 * Ensure the public portraits bucket exists and allows AVIF (and other image types).
 * Older buckets created without image/avif reject AVIF uploads with
 * "mime type image/avif is not supported".
 */
async function ensurePortraitBucket(supabase: SupabaseClient): Promise<void> {
  const opts = {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: [...ALLOWED_MIMES],
  };

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((b) => b.id === BUCKET || b.name === BUCKET);

  if (!exists) {
    await supabase.storage.createBucket(BUCKET, opts);
    return;
  }

  // Always refresh allowed MIME types so AVIF is included after deploy
  await supabase.storage.updateBucket(BUCKET, opts);
}

/**
 * Admin portrait upload → Supabase Storage (public bucket).
 * Multipart form: file (required), leaderId (optional folder prefix).
 * Returns { url } for leaders.image_url.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data with a file field." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Choose an image file to upload." },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  // Infer type from extension if the browser sends empty/unknown type
  let mime = (file.type || "").toLowerCase();
  if (!mime || mime === "application/octet-stream") {
    const n = (file.name || "").toLowerCase();
    if (n.endsWith(".avif")) mime = "image/avif";
    else if (n.endsWith(".webp")) mime = "image/webp";
    else if (n.endsWith(".png")) mime = "image/png";
    else if (n.endsWith(".gif")) mime = "image/gif";
    else if (n.endsWith(".jpg") || n.endsWith(".jpeg")) mime = "image/jpeg";
  }

  if (mime && !ALLOWED.has(mime)) {
    return NextResponse.json(
      {
        error: "Use JPEG, PNG, WebP, AVIF or GIF only.",
        received: mime,
      },
      { status: 400 },
    );
  }

  const contentType = mime === "image/jpg" ? "image/jpeg" : mime || "image/jpeg";

  const leaderIdRaw = String(form.get("leaderId") || "new").trim();
  const leaderFolder = /^[0-9a-f-]{36}$/i.test(leaderIdRaw)
    ? leaderIdRaw
    : "pending";
  const ext = extFor(contentType, file.name || "portrait.jpg");
  const path = `${leaderFolder}/${Date.now()}-${safeFileBase(file.name)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  // Make sure bucket allows AVIF before upload (fixes legacy bucket config)
  try {
    await ensurePortraitBucket(auth.supabase);
  } catch {
    // Non-fatal: upload may still work if bucket already exists
  }

  const uploadOnce = () =>
    auth.supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });

  let { error: uploadError } = await uploadOnce();

  // If Storage still rejects MIME (stale bucket), force-update and retry once
  if (
    uploadError &&
    /mime type|not supported|allowed/i.test(uploadError.message || "")
  ) {
    try {
      await ensurePortraitBucket(auth.supabase);
      const retry = await uploadOnce();
      uploadError = retry.error;
    } catch {
      /* keep original error */
    }
  }

  if (uploadError) {
    const msg = uploadError.message || String(uploadError);
    if (/bucket not found|not found/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "Storage bucket “leader-portraits” is missing. Run lib/supabase/migrations/leader_portraits_storage.sql in Supabase.",
          hint: msg,
        },
        { status: 503 },
      );
    }
    if (/mime type|not supported/i.test(msg)) {
      return NextResponse.json(
        {
          error:
            "Supabase Storage is still blocking this image type. In Supabase SQL editor run: UPDATE storage.buckets SET allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/avif','image/gif'] WHERE id = 'leader-portraits';",
          hint: msg,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { data: pub } = auth.supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = pub?.publicUrl;
  if (!url) {
    return NextResponse.json(
      { error: "Upload succeeded but public URL could not be built." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    url,
    path,
    bucket: BUCKET,
    bytes: file.size,
    contentType,
  });
}
