'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, ChevronRight, Trash2, Scale } from 'lucide-react'

interface Rule {
  id: string
  title: string
  content: string
  category: string
  sort_order: number
}

const CATEGORIES = [
  { value: 'general', label: 'Allgemein' },
  { value: 'hygiene', label: 'Hygiene & Sicherheit' },
  { value: 'communication', label: 'Kommunikation' },
  { value: 'emergencies', label: 'Notfälle' },
  { value: 'documentation', label: 'Dokumentation' },
  { value: 'conduct', label: 'Verhaltensregeln' },
]

interface Props { rules: Rule[]; isAdmin: boolean; siteId: string }

export default function RegelwerkManager({ rules: initial, isAdmin, siteId }: Props) {
  const [rules, setRules] = useState<Rule[]>(initial)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [saving, setSaving] = useState(false)

  async function saveRule() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('rulebook_entries').insert({
      site_id: siteId, title: title.trim(), content: content.trim(), category,
      sort_order: rules.filter(r => r.category === category).length + 1,
    }).select().single()
    setSaving(false)
    if (data) {
      setRules(prev => [...prev, data as Rule].sort((a, b) => a.category.localeCompare(b.category) || a.sort_order - b.sort_order))
      setTitle(''); setContent(''); setOpen(false)
    }
  }

  async function deleteRule(id: string) {
    const supabase = createClient()
    await supabase.from('rulebook_entries').delete().eq('id', id)
    setRules(prev => prev.filter(r => r.id !== id))
  }

  const grouped = CATEGORIES.map(cat => ({
    ...cat, items: rules.filter(r => r.category === cat.value)
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="card overflow-hidden">
          <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <Plus size={16} className="text-slate-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Regel hinzufügen</span>
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
                <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="label">Inhalt *</label>
                <textarea className="input-field resize-none" rows={5} value={content}
                  onChange={e => setContent(e.target.value)} />
              </div>
              <button onClick={saveRule} disabled={!title.trim() || !content.trim() || saving}
                className="btn-primary w-full py-2.5 disabled:opacity-50">
                {saving ? 'Speichern…' : 'Regel hinzufügen'}
              </button>
            </div>
          )}
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="card p-8 text-center">
          <Scale size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Regeln hinterlegt</p>
        </div>
      ) : grouped.map(({ value, label, items }) => (
        <div key={value}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
          <div className="space-y-2">
            {items.map(rule => (
              <div key={rule.id} className="card overflow-hidden">
                <button className="w-full p-3 flex items-center gap-3 text-left"
                  onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{rule.title}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={e => { e.stopPropagation(); deleteRule(rule.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                      <Trash2 size={13} />
                    </button>
                  )}
                  <ChevronRight size={14} className={`text-gray-300 transition-transform flex-shrink-0 ${expandedId === rule.id ? 'rotate-90' : ''}`} />
                </button>
                {expandedId === rule.id && (
                  <div className="px-3 pb-3 border-t border-gray-50 pt-2">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{rule.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
