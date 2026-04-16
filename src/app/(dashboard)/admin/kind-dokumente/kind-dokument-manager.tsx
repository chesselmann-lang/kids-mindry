'use client'

import { useState, useRef } from 'react'
import { Plus, ChevronDown, ChevronUp, Upload, Trash2, FileText, ExternalLink, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Child { id: string; first_name: string; last_name: string }
interface Doc {
  id: string
  child_id: string
  title: string
  doc_type: string
  file_url: string
  visible_to_parents: boolean
  created_at: string
  children?: { first_name: string; last_name: string }
}

interface Props {
  siteId: string
  staffId: string
  children: Child[]
  docs: Doc[]
}

const DOC_TYPES = [
  { value: 'contract',   label: 'Betreuungsvertrag' },
  { value: 'health',     label: 'Gesundheitszeugnis' },
  { value: 'permit',     label: 'Erlaubnis / Einwilligung' },
  { value: 'report',     label: 'Bericht' },
  { value: 'other',      label: 'Sonstiges' },
]

export default function KindDokumentManager({ siteId, staffId, children, docs: initialDocs }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [docs, setDocs] = useState<Doc[]>(initialDocs)
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState('')
  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState('other')
  const [visibleToParents, setVisibleToParents] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleUpload() {
    if (!childId || !title.trim() || !file) return
    setSaving(true)
    const supabase = createClient()

    // Upload to storage
    const ext = file.name.split('.').pop()
    const path = `kind-dokumente/${childId}/${Date.now()}.${ext}`
    const { data: uploadData, error } = await supabase.storage.from('media').upload(path, file)

    if (error) { setSaving(false); return }

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

    const { data } = await supabase.from('child_documents').insert({
      child_id: childId,
      site_id: siteId,
      title: title.trim(),
      doc_type: docType,
      file_url: publicUrl,
      visible_to_parents: visibleToParents,
      uploaded_by: staffId,
    }).select('*, children(first_name, last_name)').single()

    setSaving(false)
    if (data) {
      setDocs(prev => [data as Doc, ...prev])
      setSaved(true)
      setChildId(''); setTitle(''); setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
    }
  }

  async function handleDelete(id: string, fileUrl: string) {
    const supabase = createClient()
    await supabase.from('child_documents').delete().eq('id', id)
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  const TYPE_LABEL: Record<string, string> = Object.fromEntries(DOC_TYPES.map(t => [t.value, t.label]))

  return (
    <div className="space-y-3">
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <Plus size={16} className="text-brand-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Dokument hochladen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <label className="label">Kind *</label>
                <select className="input-field" value={childId} onChange={e => setChildId(e.target.value)}>
                  <option value="">Auswählen…</option>
                  {children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Typ</label>
                <select className="input-field" value={docType} onChange={e => setDocType(e.target.value)}>
                  {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Bezeichnung *</label>
              <input className="input-field" placeholder="z.B. Betreuungsvertrag 2026"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Datei *</label>
              <input ref={fileRef} type="file" className="input-field py-1.5"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={e => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVisibleToParents(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${visibleToParents ? 'bg-brand-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${visibleToParents ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-xs text-gray-600">Für Eltern sichtbar</span>
            </div>
            <button onClick={handleUpload} disabled={!childId || !title.trim() || !file || saving}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {saved ? <><CheckCircle2 size={16} /> Gespeichert!</>
                : saving ? <><Upload size={15} className="animate-bounce" /> Hochladen…</>
                : <><Upload size={15} /> Dokument hochladen</>}
            </button>
          </div>
        )}
      </div>

      {/* Doc list */}
      {docs.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Dokumente hochgeladen</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{doc.title}</p>
                <p className="text-xs text-gray-400">
                  {doc.children?.first_name} {doc.children?.last_name}
                  {' · '}{TYPE_LABEL[doc.doc_type] ?? doc.doc_type}
                  {!doc.visible_to_parents && ' · 🔒 Intern'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-gray-100">
                  <ExternalLink size={13} className="text-brand-600" />
                </a>
                <button onClick={() => handleDelete(doc.id, doc.file_url)}
                  className="p-1.5 rounded-lg hover:bg-red-50">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
