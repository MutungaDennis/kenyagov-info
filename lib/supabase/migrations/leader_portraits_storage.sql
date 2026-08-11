-- Public storage bucket for leader/MCA portrait photos.
-- Run in Supabase SQL editor (service role / dashboard).
-- Admin uploads go through /api/admin/leaders/upload-image (service role).
--
-- If you already created the bucket without AVIF, run the UPDATE below
-- (or the full INSERT … ON CONFLICT) so image/avif is allowed.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'leader-portraits',
  'leader-portraits',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Explicit fix for existing buckets that reject AVIF:
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif'
],
file_size_limit = 5242880,
public = true
WHERE id = 'leader-portraits' OR name = 'leader-portraits';

-- Public read (portraits on /government/people/[slug])
DROP POLICY IF EXISTS "Public read leader portraits" ON storage.objects;
CREATE POLICY "Public read leader portraits"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'leader-portraits');

-- Authenticated insert/update/delete (optional if only service role uploads)
DROP POLICY IF EXISTS "Authenticated write leader portraits" ON storage.objects;
CREATE POLICY "Authenticated write leader portraits"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'leader-portraits')
  WITH CHECK (bucket_id = 'leader-portraits');

COMMENT ON COLUMN public.leaders.image_url IS
  'Portrait URL — external HTTPS or Supabase Storage public URL from bucket leader-portraits.';
