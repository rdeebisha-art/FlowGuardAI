/*
# FlowGuard AI — Evidence photo storage bucket

1. Storage
- Create public bucket `evidence` for citizen report + road damage photos.
- Public read so map markers can display thumbnails; writes go through anon-key upload.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anon + authenticated to upload to evidence bucket
DROP POLICY IF EXISTS "anon_upload_evidence" ON storage.objects;
CREATE POLICY "anon_upload_evidence" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'evidence');

DROP POLICY IF EXISTS "anon_read_evidence" ON storage.objects;
CREATE POLICY "anon_read_evidence" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'evidence');

DROP POLICY IF EXISTS "anon_delete_evidence" ON storage.objects;
CREATE POLICY "anon_delete_evidence" ON storage.objects FOR DELETE
  TO anon, authenticated USING (bucket_id = 'evidence');
