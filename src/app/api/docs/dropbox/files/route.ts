import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { listDropboxFiles, createDropboxDoc, refreshDropboxToken } from '@/lib/dropbox'

async function getDropboxToken(supabase: any, siteId: string) {
  const { data } = await supabase
    .from('document_integrations')
    .select('*')
    .eq('site_id', siteId)
    .eq('provider', 'dropbox')
    .single()

  if (!data) return null

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    if (data.refresh_token) {
      const refreshed = await refreshDropboxToken(data.refresh_token)
      if (refreshed.access_token) {
        await supabase.from('document_integrations').update({
          access_token: refreshed.access_token,
          expires_at: refreshed.expires_in
            ? new Date(Date.now() + refreshed.expires_in * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        }).eq('site_id', siteId).eq('provider', 'dropbox')
        return refreshed.access_token
      }
    }
  }

  return data.access_token
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('site_id').eq('id', user.id).single()

  const siteId = (profile as any).site_id
  const token = await getDropboxToken(supabase, siteId)
  if (!token) return NextResponse.json({ error: 'Dropbox not connected' }, { status: 400 })

  const files = await listDropboxFiles(token)
  return NextResponse.json({ files })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  if (!['admin', 'educator', 'group_lead'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title } = await req.json()
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const siteId = (profile as any).site_id
  const token = await getDropboxToken(supabase, siteId)
  if (!token) return NextResponse.json({ error: 'Dropbox not connected' }, { status: 400 })

  const doc = await createDropboxDoc(token, title)

  await supabase.from('documents').insert({
    site_id: siteId,
    provider: 'dropbox',
    provider_doc_id: doc.id,
    title,
    web_url: doc.path,
    created_by: user.id,
  })

  return NextResponse.json({ path: doc.path, id: doc.id })
}
