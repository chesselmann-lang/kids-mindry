'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, FileText, ExternalLink, Trash2, Download } from 'lucide-react'

interface FormTemplate {
  id: string
  title: string
  description: string | null
  category: string
  file_url: string | null
  external_url: string | null
}

const CATEGORIES = [
  { value: 'registration', label: 'Anmeldung', color: 'bg-blue-100 text-blue-700' },
  { value: 'medical', label: 'Gesundheit', color: 'bg-red-100 text-red-700' },
  { value: 'consent', label: 'Einwilligung', color: 'bg-green-100 text-green-700' },
  { value: 'financial', label: 'Finanziell', color: 'bg-amber-100 text-amber-700' },
  { value: 'excursion', label: 'Ausflug', color: 'bg-teal-100 text-teal-700' },
  { value: 'general', label: 'Allgemein', color: 'bg-gray-100 text-gray-600' },
]

interface Props {
  forms: FormTemplate[]
  isAdmin: boolean
  siteId: string
}

export default function FormularManager({ forms: initial, isAdmin, siteId }: Props) {
  const [forms, setForms] = useState<FormTemplate[]>(initial)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [externalUrl, setExternalUrl] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('form_templates').insert({
      site_id: siteId,
      title: title.trim(),
      description: description.trim() || null,
      category,
      external_url: externalUrl.trim() || null,
    }).select().single()
    setSaving(false)
    if (data) {
      setForms(prev => [...prev, data as FormTemplate].sort((a, b) => a.title.localeCompare(b.title)))
      setTitle('')
      setDescription('')
      setExternalUrl('')
      setOpen(false)
    }
  }

  async function deleteForm(id: string) {
    const supabase = createClient()
    await supabase.from('form_templates').delete().eq('id', id)
    setForms(prev => prev.filter(f => f.id !== id))
  }

  // Group by category
  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: forms.filter(f => f.category === cat.value),
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="card overflow-hidden">
          <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <Plus size={16} className="text-orange-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Formular hinzufügen</span>
            </div>
            {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {open && (
            <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
              <div>
                <label className="label">Titel *</label>
                <input className="input-field" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="z.B. Anmeldeformular Kita" />
              </div>
              <div>
                <label className="label">Kategorie</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Beschreibung</label>
                <textarea className="input-field resize-none" rows={2} value={description}
                  onChange={e => setDescription(e.target.value)} />
              </div>
              <div>
                <label className="label">Externer Link (optional)</label>
                <input className="input-field" value={externalUrl} onChange={e => setExternalUrl(e.target.value)}
                  placeholder="https://…" type="url" />
              </div>
              <button onClick={handleSave} disabled={!title.trim() || saving}
                className="btn-primary w-full py-2.5 disabled:opacity-50">
                {saving ? 'Hinzufügen…' : 'Formular hinzufügen'}
              </button>
            </div>
          )}
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Formulare hinterlegt</p>
        </div>
      ) : (
        grouped.map(({ value, label, color, items }) => (
          <div key={value}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
            <div className="space-y-2">
              {items.map(form => (
                <div key={form.id} className="card p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <FileText size={15} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900">{form.title}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color}`}>{label}</span>
                    </div>
                    {form.description && <p className="text-xs text-gray-500">{form.description}</p>}
                    <div className="flex gap-2 mt-2">
                      {form.external_url && (
                        <a href={form.external_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-brand-600 font-semibold hover:underline">
                          <ExternalLink size={11} /> Öffnen
                        </a>
                      )}
                      {form.file_url && (
                        <a href={form.file_url} download
                          className="flex items-center gap-1 text-xs text-green-600 font-semibold hover:underline">
                          <Download size={11} /> Herunterladen
                        </a>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => deleteForm(form.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
