import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listOneDriveFiles, createWordDocument, shareOneDriveFile } from '@/lib/microsoft-docs'
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
    .eq('provider', 'microsoft')
    .single()

  if (!integration) return NextResponse.json({ error: 'Microsoft nicht verbunden' }, { status: 404 })

  const files = await listOneDriveFiles((integration as any).access_token)
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
    .eq('provider', 'microsoft')
    .single()

  if (!integration) return NextResponse.json({ error: 'Microsoft nicht verbunden' }, { status: 404 })

  const file = await createWordDocument((integration as any).access_token, parsed.data.title)
  const shareUrl = await shareOneDriveFile((integration as any).access_token, file.id)

  await supabase.from('documents').insert({
    site_id:         (profile as any).site_id,
    provider:        'microsoft',
    provider_doc_id: file.id,
    title:           parsed.data.title,
    web_url:         shareUrl ?? file.webUrl,
    mime_type:       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    created_by:      user.id,
  })

  return NextResponse.json({ url: shareUrl ?? file.webUrl })
}
