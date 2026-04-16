'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, Copy, Trash2, FileText, Check } from 'lucide-react'

interface Template {
  id: string
  title: string
  body: string
  category: string
  created_at: string
}

const CATEGORIES = [
  { value: 'betrieb',        label: 'Betrieb',          color: 'bg-blue-100 text-blue-700' },
  { value: 'gesundheit',     label: 'Gesundheit',        color: 'bg-red-100 text-red-700' },
  { value: 'veranstaltung',  label: 'Veranstaltung',     color: 'bg-purple-100 text-purple-700' },
  { value: 'kommunikation',  label: 'Kommunikation',     color: 'bg-green-100 text-green-700' },
  { value: 'allgemein',      label: 'Allgemein',         color: 'bg-gray-100 text-gray-700' },
]

function getCatCfg(cat: string) {
  return CATEGORIES.find(c => c.value === cat) ?? CATEGORIES[4]
}

interface Props {
  templates: Template[]
  siteId: string
}

export default function VorlagenManager({ templates: initial, siteId }: Props) {
  const [templates, setTemplates] = useState<Template[]>(initial)
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('allgemein')
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState<string | null>(null)

  async function saveTemplate() {
    if (!title.trim() || !body.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('message_templates').insert({
      site_id: siteId, title: title.trim(), body: body.trim(), category,
    }).select().single()
    setSaving(false)
    if (data) {
      setTemplates(prev => [data as Template, ...prev])
      setTitle(''); setBody(''); setOpen(false)
    }
  }

  async function deleteTemplate(id: string) {
    const supabase = createClient()
    await supabase.from('message_templates').delete().eq('id', id)
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  async function copyToClipboard(t: Template) {
    await navigator.clipboard.writeText(t.body)
    setCopiedId(t.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: templates.filter(t => t.category === cat.value && (!filterCat || filterCat === cat.value))
  })).filter(c => c.items.length > 0)

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <Plus size={16} className="text-rose-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Vorlage hinzufügen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <div>
              <label className="label">Kategorie</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Titel *</label>
              <input className="input-field" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="z.B. Kita geschlossen – Feiertag" />
            </div>
            <div>
              <label className="label">Text *</label>
              <textarea className="input-field resize-none" rows={8} value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Vorlage mit [PLATZHALTERN] in eckigen Klammern…" />
            </div>
            <button onClick={saveTemplate} disabled={!title.trim() || !body.trim() || saving}
              className="btn-primary w-full py-2.5 disabled:opacity-50">
              {saving ? 'Speichern…' : 'Vorlage speichern'}
            </button>
          </div>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        <button onClick={() => setFilterCat(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            !filterCat ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
          Alle
        </button>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setFilterCat(v => v === c.value ? null : c.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filterCat === c.value ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Template groups */}
      {grouped.length === 0 ? (
        <div className="card p-8 text-center">
          <FileText size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Vorlagen</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ label, color, items }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
              <div className="space-y-2">
                {items.map(t => {
                  const cfg = getCatCfg(t.category)
                  const isExpanded = expandedId === t.id
                  const isCopied = copiedId === t.id
                  return (
                    <div key={t.id} className="card overflow-hidden">
                      <button className="w-full p-3 flex items-center gap-3 text-left"
                        onClick={() => setExpandedId(isExpanded ? null : t.id)}>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <p className="flex-1 text-sm font-semibold text-gray-900">{t.title}</p>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => copyToClipboard(t)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                            {isCopied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                          </button>
                          <button onClick={() => deleteTemplate(t.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <ChevronDown size={14} className={`text-gray-300 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 border-t border-gray-50 pt-2">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">{t.body}</pre>
                          <button onClick={() => copyToClipboard(t)}
                            className="mt-3 flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700">
                            {isCopied ? <><Check size={12} /> Kopiert!</> : <><Copy size={12} /> Text kopieren</>}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
