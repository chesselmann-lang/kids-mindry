import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listGoogleDriveFiles, createGoogleDoc } from '@/lib/google-docs'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('site_id').eq('id', user.id).single()
  const { data: integration } = await supabase
    .from('document_integrations')
    .select('access_token, refresh_token')
    .eq('site_id', (profile as any).site_id)
    .eq('provider', 'google')
    .single()

  if (!integration) return NextResponse.json({ error: 'Google nicht verbunden' }, { status: 404 })

  const files = await listGoogleDriveFiles(
    (integration as any).access_token,
    (integration as any).refresh_token ?? undefined
  )
  return NextResponse.json({ files })
}

const CreateSchema = z.object({ title: z.string().min(1).max(200) })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('site_id, role').eq('id', user.id).single()
  if (!['admin', 'erzieher'].includes((profile as any).role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: integration } = await supabase
    .from('document_integrations')
    .select('access_token, refresh_token')
    .eq('site_id', (profile as any).site_id)
    .eq('provider', 'google')
    .single()

  if (!integration) return NextResponse.json({ error: 'Google nicht verbunden' }, { status: 404 })

  const doc = await createGoogleDoc(
    (integration as any).access_token,
    parsed.data.title,
    (integration as any).refresh_token ?? undefined
  )

  // Save reference in DB
  await supabase.from('documents').insert({
    site_id:         (profile as any).site_id,
    provider:        'google',
    provider_doc_id: doc.documentId!,
    title:           parsed.data.title,
    web_url:         `https://docs.google.com/document/d/${doc.documentId}/edit`,
    mime_type:       'application/vnd.google-apps.document',
    created_by:      user.id,
  })

  return NextResponse.json({ url: `https://docs.google.com/document/d/${doc.documentId}/edit` })
}
