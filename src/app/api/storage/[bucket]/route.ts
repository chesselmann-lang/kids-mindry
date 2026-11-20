/**
 * GET /api/storage/<bucket>?path=<storage_path>
 * Leitet auf eine kurzlebige signierte URL aus einem privaten Bucket weiter.
 * Signiert wird mit dem Nutzer-Client – die Storage-Richtlinien (Einrichtung, Kind,
 * Eltern-Freigabe, Gesprächsteilnahme) entscheiden also über den Zugriff.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const ALLOWED_BUCKETS = new Set(['portfolio', 'media', 'kita-docs'])

export async function GET(req: Request, { params }: { params: { bucket: string } }) {
  const bucket = params.bucket
  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json({ error: 'Unbekannter Speicher' }, { status: 404 })
  }

  const path = new URL(req.url).searchParams.get('path')
  if (!path || path.includes('..')) {
    return NextResponse.json({ error: 'Ungültiger Pfad' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10)
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  const res = NextResponse.redirect(data.signedUrl, 302)
  res.headers.set('Cache-Control', 'private, max-age=300')
  return res
}
