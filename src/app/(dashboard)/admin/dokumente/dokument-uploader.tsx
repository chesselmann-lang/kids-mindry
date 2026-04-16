'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Upload, File, FileText, FileSpreadsheet, Image,
  Loader2, Trash2, X, CheckCircle2, AlertCircle
} from 'lucide-react'

const CATEGORIES = [
  { value: 'general',  label: 'Allgemein' },
  { value: 'contract', label: 'Verträge' },
  { value: 'form',     label: 'Formulare' },
  { value: 'menu',     label: 'Speisepläne' },
  { value: 'other',    label: 'Sonstiges' },
]

function FileIcon({ mime }: { mime: string }) {
  if (mime === 'application/pdf') return <FileText size={16} className="text-red-500" />
  if (mime.startsWith('image/')) return <Image size={16} className="text-blue-500" />
  if (mime.includes('spreadsheet') || mime.includes('excel')) return <FileSpreadsheet size={16} className="text-green-600" />
  return <File size={16} className="text-gray-400" />
}

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

interface Doc {
  id: string; title: string; description: string | null
  category: string; file_name: string; file_size: number | null
  mime_type: string | null; created_at: string; file_path: string
}

interface Props {
  siteId: string
  uploaderId: string
  initialDocuments: Doc[]
}

export default function DokumentUploader({ siteId, uploaderId, initialDocuments }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [docs, setDocs] = useState<Doc[]>(initialDocuments)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [deleting, setDeleting] = useState<string | null>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '))
    setUploadStatus('idle')
  }

  async function upload() {
    if (!selectedFile || !title.trim()) return
    setUploading(true)
    setUploadStatus('idle')

    const ext = selectedFile.name.split('.').pop()
    const path = `${siteId}/${Date.now()}-${crypto.randomUUID()}.${ext}`

    const { error: storageErr } = await supabase.storage
      .from('kita-docs')
      .upload(path, selectedFile, { contentType: selectedFile.type })

    if (storageErr) {
      setUploading(false)
      setUploadStatus('error')
      return
    }

    const { data, error: dbErr } = await supabase
      .from('kita_documents')
      .insert({
        site_id: siteId,
        title: title.trim(),
        description: description.trim() || null,
        category,
        file_path: path,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        uploaded_by: uploaderId,
      })
      .select()
      .single()

    setUploading(false)
    if (dbErr) { setUploadStatus('error'); return }

    setDocs(prev => [data as Doc, ...prev])
    setSelectedFile(null)
    setTitle('')
    setDescription('')
    setCategory('general')
    setUploadStatus('success')
    if (inputRef.current) inputRef.current.value = ''
    router.refresh()
  }

  async function deleteDoc(doc: Doc) {
    if (!confirm(`„${doc.title}" wirklich löschen?`)) return
    setDeleting(doc.id)

    await supabase.storage.from('kita-docs').remove([doc.file_path])
    await supabase.from('kita_documents').delete().eq('id', doc.id)

    setDocs(prev => prev.filter(d => d.id !== doc.id))
    setDeleting(null)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Upload-Formular */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Neues Dokument hochladen</h2>

        {/* Datei wählen */}
        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
            selectedFile ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            onChange={onFileChange}
          />
          {selectedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileIcon mime={selectedFile.type} />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{fileSize(selectedFile.size)}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); setSelectedFile(null); if (inputRef.current) inputRef.current.value = '' }}
                className="p-1 rounded-lg hover:bg-red-50">
                <X size={14} className="text-red-400" />
              </button>
            </div>
          ) : (
            <>
              <Upload size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">Datei auswählen</p>
              <p className="text-xs text-gray-400 mt-0.5">PDF, Word, Excel, Bild · max. 20 MB</p>
            </>
          )}
        </div>

        {selectedFile && (
          <>
            <div>
              <label className="label">Titel *</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. Kita-Satzung 2026" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Kategorie</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Beschreibung</label>
                <input className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional…" />
              </div>
            </div>

            <button
              onClick={upload}
              disabled={!title.trim() || uploading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading
                ? <><Loader2 size={16} className="animate-spin" /> Wird hochgeladen…</>
                : <><Upload size={16} /> Dokument hochladen</>
              }
            </button>
          </>
        )}

        {uploadStatus === 'success' && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2.5">
            <CheckCircle2 size={16} /> Dokument erfolgreich hochgeladen
          </div>
        )}
        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-4 py-2.5">
            <AlertCircle size={16} /> Fehler beim Hochladen. Bitte erneut versuchen.
          </div>
        )}
      </div>

      {/* Vorhandene Dokumente */}
      {docs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            Hochgeladene Dokumente ({docs.length})
          </p>
          <div className="card overflow-hidden p-0">
            {docs.map((doc, idx) => (
              <div
                key={doc.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <FileIcon mime={doc.mime_type ?? ''} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{doc.title}</p>
                  <p className="text-xs text-gray-400">
                    {doc.file_name}
                    {doc.file_size ? ` · ${fileSize(doc.file_size)}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => deleteDoc(doc)}
                  disabled={deleting === doc.id}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  {deleting === doc.id
                    ? <Loader2 size={15} className="animate-spin text-gray-400" />
                    : <Trash2 size={15} />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
