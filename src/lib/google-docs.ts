import { google } from 'googleapis'

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI  = process.env.NEXT_PUBLIC_APP_URL + '/api/docs/google/callback'

export function getGoogleOAuthClient() {
  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI)
}

export function getGoogleAuthUrl(state: string) {
  const client = getGoogleOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
    state,
  })
}

export async function getGoogleTokens(code: string) {
  const client = getGoogleOAuthClient()
  const { tokens } = await client.getToken(code)
  return tokens
}

export async function getGoogleDriveClient(accessToken: string, refreshToken?: string) {
  const client = getGoogleOAuthClient()
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  return google.drive({ version: 'v3', auth: client })
}

export async function getGoogleDocsClient(accessToken: string, refreshToken?: string) {
  const client = getGoogleOAuthClient()
  client.setCredentials({ access_token: accessToken, refresh_token: refreshToken })
  return google.docs({ version: 'v1', auth: client })
}

export async function listGoogleDriveFiles(accessToken: string, refreshToken?: string) {
  const drive = await getGoogleDriveClient(accessToken, refreshToken)
  const res = await drive.files.list({
    pageSize: 30,
    orderBy: 'modifiedTime desc',
    fields: 'files(id,name,mimeType,webViewLink,thumbnailLink,modifiedTime)',
    q: "mimeType='application/vnd.google-apps.document' or mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/pdf' and trashed=false",
  })
  return res.data.files ?? []
}

export async function createGoogleDoc(accessToken: string, title: string, refreshToken?: string) {
  const docs = await getGoogleDocsClient(accessToken, refreshToken)
  const res = await docs.documents.create({ requestBody: { title } })
  const drive = await getGoogleDriveClient(accessToken, refreshToken)
  // Make it accessible to anyone with link
  await drive.permissions.create({
    fileId: res.data.documentId!,
    requestBody: { role: 'reader', type: 'anyone' },
  })
  return res.data
}

export async function refreshGoogleToken(refreshToken: string) {
  const client = getGoogleOAuthClient()
  client.setCredentials({ refresh_token: refreshToken })
  const { credentials } = await client.refreshAccessToken()
  return credentials
}
