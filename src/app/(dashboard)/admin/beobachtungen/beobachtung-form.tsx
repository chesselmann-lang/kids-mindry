'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Save, CheckCircle2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  children: { id: string; first_name: string; last_name: string }[]
  staffId: string
  siteId: string
  preselectedChildId: string
  domainConfig: Record<string, { label: string; color: string; emoji: string }>
}

export default function BeobachtungForm({ children, staffId, siteId, preselectedChildId, domainConfig }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState(preselectedChildId)
  const [domain, setDomain] = useState('general')
  const [content, setContent] = useState('')
  const [observedAt, setObservedAt] = useState(today)
  const [isHighlight, setIsHighlight] = useState(false)
  const [shareWithParents, setShareWithParents] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!childId || !content.trim()) return
    setSaving(true)
    const supabase = createClient()

    await supabase.from('observations').insert({
      child_id: childId,
      site_id: siteId,
      observed_at: observedAt,
      domain,
      content: content.trim(),
      is_highlight: isHighlight,
      author_id: staffId,
      shared_with_parents: shareWithParents,
    })

    setSaving(false)
    setSaved(true)
    setContent(''); setIsHighlight(false); setShareWithParents(false)
    setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
    router.refresh()
  }

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
            <Plus size={16} className="text-teal-600" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Neue Beobachtung</span>
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
              <label className="label">Datum</label>
              <input type="date" className="input-field" value={observedAt} max={today} onChange={e => setObservedAt(e.target.value)} />
            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="label">Bereich</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(domainConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => setDomain(key)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${domain === key ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cfg.emoji} {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Beobachtung *</label>
            <textarea className="input-field resize-none" rows={4}
              placeholder="Was haben Sie beobachtet? Beschreiben Sie konkrete Situationen und Verhaltensweisen…"
              value={content} onChange={e => setContent(e.target.value)} />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsHighlight(v => !v)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${isHighlight ? 'text-amber-500' : 'text-gray-400'}`}>
              <Star size={16} fill={isHighlight ? 'currentColor' : 'none'} />
              Highlight
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600">Mit Eltern teilen</span>
              <button onClick={() => setShareWithParents(v => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${shareWithParents ? 'bg-brand-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${shareWithParents ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <button onClick={handleSave} disabled={!childId || !content.trim() || saving}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saved ? <><CheckCircle2 size={16} /> Gespeichert!</> : saving ? 'Speichere…' : <><Save size={15} /> Beobachtung speichern</>}
          </button>
        </div>
      )}
    </div>
  )
}
