const MS_CLIENT_ID     = process.env.MS_CLIENT_ID!
const MS_CLIENT_SECRET = process.env.MS_CLIENT_SECRET!
const MS_TENANT_ID     = process.env.MS_TENANT_ID ?? 'common'
const MS_REDIRECT_URI  = process.env.NEXT_PUBLIC_APP_URL + '/api/docs/microsoft/callback'

const SCOPES = [
  'offline_access',
  'Files.ReadWrite',
  'Sites.ReadWrite.All',
  'User.Read',
].join(' ')

export function getMicrosoftAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: MS_CLIENT_ID,
    response_type: 'code',
    redirect_uri: MS_REDIRECT_URI,
    scope: SCOPES,
    response_mode: 'query',
    state,
  })
  return `https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/authorize?${params}`
}

export async function getMicrosoftTokens(code: string) {
  const res = await fetch(`https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: MS_CLIENT_ID,
      client_secret: MS_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: MS_REDIRECT_URI,
    }),
  })
  return res.json()
}

export async function refreshMicrosoftToken(refreshToken: string) {
  const res = await fetch(`https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: MS_CLIENT_ID,
      client_secret: MS_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  return res.json()
}

async function graphFetch(accessToken: string, path: string, options?: RequestInit) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!res.ok) throw new Error(`Graph API error: ${res.status}`)
  return res.json()
}

export async function getMicrosoftUserEmail(accessToken: string): Promise<string> {
  const data = await graphFetch(accessToken, '/me?$select=mail,userPrincipalName')
  return data.mail ?? data.userPrincipalName
}

export async function listOneDriveFiles(accessToken: string) {
  const data = await graphFetch(
    accessToken,
    "/me/drive/root/children?$select=id,name,file,webUrl,thumbnailUrl,lastModifiedDateTime&$orderby=lastModifiedDateTime desc&$top=30"
  )
  return (data.value ?? []).filter((f: any) => f.file) // nur Dateien, keine Ordner
}

export async function createWordDocument(accessToken: string, title: string) {
  // Upload leere DOCX als Byte-Array (minimal valides DOCX)
  const emptyDocx = Buffer.from(
    'UEsDBAoAAAAAAA1jUFcAAAAAAAAAAAAAAAAJAAAAd29yZC9QSwMECgAAAAAA' +
    'DWNQVwAAAAAAAAAAAAAAAA8AAAB3b3JkL3NldHRpbmdzLnhtbFBLAQIfAAoA' +
    'AAAAAA1jUFcAAAAAAAAAAAAAAAAJAAAAAAAAAAAAEAAAAAAAAAAd29yZC9QSwEC' +
    'HwAKAAAAAA1jUFcAAAAAAAAAAAAAAAAPAAAAAAAAAAAAEAAAACcAAAB3b3JkL3Nl' +
    'dHRpbmdzLnhtbFBLBQYAAAAAAgACAHMAAABUAAAAAAA=',
    'base64'
  )
  const data = await graphFetch(
    accessToken,
    `/me/drive/root:/${encodeURIComponent(title)}.docx:/content`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      body: emptyDocx,
    }
  )
  return data
}

export async function shareOneDriveFile(accessToken: string, itemId: string) {
  const data = await graphFetch(accessToken, `/me/drive/items/${itemId}/createLink`, {
    method: 'POST',
    body: JSON.stringify({ type: 'view', scope: 'anonymous' }),
  })
  return data.link?.webUrl as string
}
