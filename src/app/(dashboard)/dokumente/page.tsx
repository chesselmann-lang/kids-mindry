import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FolderOpen, FileText, FileSpreadsheet, Image, File, Download, Plus } from 'lucide-react'
import AiDokumenteAnalyse from './ai-dokumente-analyse'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Dokumente' }

const CATEGORIES: Record<string, { label: string; color: string }> = {
  general:  { label: 'Allgemein',        color: 'bg-gray-100 text-gray-600' },
  contract: { label: 'Verträge',         color: 'bg-blue-100 text-blue-700' },
  form:     { label: 'Formulare',        color: 'bg-purple-100 text-purple-700' },
  menu:     { label: 'Speisepläne',      color: 'bg-green-100 text-green-700' },
  other:    { label: 'Sonstiges',        color: 'bg-amber-100 text-amber-700' },
}

function FileIcon({ mime }: { mime: string | null }) {
  if (!mime) return <File size={18} className="text-gray-400" />
  if (mime === 'application/pdf') return <FileText size={18} className="text-red-500" />
  if (mime.startsWith('image/')) return <Image size={18} className="text-blue-500" />
  if (mime.includes('spreadsheet') || mime.includes('excel')) return <FileSpreadsheet size={18} className="text-green-600" />
  return <FileText size={18} className="text-gray-500" />
}

function fileSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default async function DokumentePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const { data: documents } = await supabase
    .from('kita_documents')
    .select('*')
    .order('created_at', { ascending: false })

  const docs = (documents ?? []) as any[]

  // Group by category
  const grouped: Record<string, any[]> = {}
  for (const doc of docs) {
    const cat = doc.category ?? 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(doc)
  }

  // Signed URLs for download
  const urlMap: Record<string, string> = {}
  for (const doc of docs) {
    const { data } = await supabase.storage
      .from('kita-docs')
      .createSignedUrl(doc.file_path, 3600)  // 1 hour
    if (data?.signedUrl) urlMap[doc.id] = data.signedUrl
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dokumente</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kita-Unterlagen &amp; Formulare</p>
        </div>
        {isAdmin && (
          <Link href="/admin/dokumente" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Hochladen
          </Link>
        )}
      </div>

      {isAdmin && <AiDokumenteAnalyse />}

      {docs.length === 0 ? (
        <div className="card p-12 text-center">
          <FolderOpen size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Noch keine Dokumente vorhanden</p>
          {isAdmin && (
            <Link href="/admin/dokumente" className="btn-primary mt-4 inline-flex">
              Erstes Dokument hochladen
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([cat, catDocs]) => {
            const catInfo = CATEGORIES[cat] ?? CATEGORIES.general
            return (
              <div key={cat} className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                  {catInfo.label} ({catDocs.length})
                </p>
                <div className="card overflow-hidden p-0">
                  {catDocs.map((doc, idx) => (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-3 px-4 py-3.5 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <FileIcon mime={doc.mime_type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{doc.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {doc.file_name}
                          {doc.file_size ? ` · ${fileSize(doc.file_size)}` : ''}
                          {' · '}{format(new Date(doc.created_at), 'd. MMM yyyy', { locale: de })}
                        </p>
                        {doc.description && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.description}</p>
                        )}
                      </div>
                      {urlMap[doc.id] && (
                        <a
                          href={urlMap[doc.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl hover:bg-brand-50 transition-colors flex-shrink-0"
                          title="Herunterladen"
                        >
                          <Download size={16} className="text-brand-600" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
