const DROPBOX_CLIENT_ID     = process.env.DROPBOX_CLIENT_ID!
const DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET!
const DROPBOX_REDIRECT_URI  = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de') + '/api/docs/dropbox/callback'

export function getDropboxAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: DROPBOX_CLIENT_ID,
    response_type: 'code',
    redirect_uri: DROPBOX_REDIRECT_URI,
    token_access_type: 'offline',
    state,
  })
  return `https://www.dropbox.com/oauth2/authorize?${params}`
}

export async function getDropboxTokens(code: string) {
  const creds = Buffer.from(`${DROPBOX_CLIENT_ID}:${DROPBOX_CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      redirect_uri: DROPBOX_REDIRECT_URI,
    }),
  })
  return res.json()
}

export async function refreshDropboxToken(refreshToken: string) {
  const creds = Buffer.from(`${DROPBOX_CLIENT_ID}:${DROPBOX_CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  return res.json()
}

async function dropboxFetch(accessToken: string, endpoint: string, body: any) {
  const res = await fetch(`https://api.dropboxapi.com/2${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Dropbox API ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function getDropboxUserEmail(accessToken: string): Promise<string> {
  const data = await dropboxFetch(accessToken, '/users/get_current_account', null)
  return data?.email ?? ''
}

export interface DropboxFile {
  id: string
  name: string
  path_lower: string
  client_modified: string
  server_modified: string
  '.tag': 'file' | 'folder'
  sharing_info?: { read_only: boolean }
}

export async function listDropboxFiles(accessToken: string, path = ''): Promise<DropboxFile[]> {
  const data = await dropboxFetch(accessToken, '/files/list_folder', {
    path,
    limit: 50,
    recursive: false,
    include_media_info: false,
  })
  return (data.entries ?? []).filter((e: any) => e['.tag'] === 'file')
}

export async function createDropboxSharedLink(accessToken: string, path: string): Promise<string> {
  try {
    const data = await dropboxFetch(accessToken, '/sharing/create_shared_link_with_settings', {
      path,
      settings: { requested_visibility: 'public', audience: 'public', access: 'viewer' },
    })
    return data.url?.replace('?dl=0', '?dl=1') ?? ''
  } catch (e: any) {
    // Link might already exist
    if (e.message?.includes('shared_link_already_exists')) {
      const existing = await dropboxFetch(accessToken, '/sharing/list_shared_links', { path, direct_only: true })
      return existing?.links?.[0]?.url?.replace('?dl=0', '?dl=1') ?? ''
    }
    throw e
  }
}

export async function createDropboxDoc(accessToken: string, name: string): Promise<{ path: string; id: string }> {
  // Create empty text file as placeholder (Dropbox has no server-side doc creation like Google Docs)
  const path = `/KitaHub/${name}.txt`
  const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path,
        mode: 'add',
        autorename: true,
        mute: false,
      }),
    },
    body: `KitaHub Dokument: ${name}\nErstellt am: ${new Date().toLocaleString('de-DE')}\n`,
  })
  if (!res.ok) throw new Error(`Dropbox upload error: ${res.status}`)
  const data = await res.json()
  return { path: data.path_lower, id: data.id }
}
