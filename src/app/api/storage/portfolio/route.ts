/**
 * GET /api/storage/portfolio?path=<storage_path>
 * Liefert eine Weiterleitung auf eine kurzlebige signierte URL aus dem privaten Bucket "portfolio".
 * Signiert wird mit dem Nutzer-Client – die Storage-Richtlinien (Einrichtung, Eltern-Freigabe,
 * Gesprächsteilnehmer) entscheiden also über den Zugriff.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get('path')
  if (!path || path.includes('..')) {
    return NextResponse.json({ error: 'Ungültiger Pfad' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.storage.from('portfolio').createSignedUrl(path, 60 * 10)
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
  }

  const res = NextResponse.redirect(data.signedUrl, 302)
  res.headers.set('Cache-Control', 'private, max-age=300')
  return res
}
