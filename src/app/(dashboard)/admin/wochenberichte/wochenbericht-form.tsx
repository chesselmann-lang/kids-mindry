'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Send, CheckCircle2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, startOfWeek } from 'date-fns'

interface Props {
  staffId: string
  siteId: string
  groups: { id: string; name: string }[]
}

export default function WochenberichtForm({ staffId, siteId, groups }: Props) {
  const router = useRouter()
  const thisWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [groupId, setGroupId] = useState('')
  const [weekStart, setWeekStart] = useState(thisWeek)
  const [highlights, setHighlights] = useState<string[]>([])
  const [newHighlight, setNewHighlight] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addHighlight() {
    const t = newHighlight.trim()
    if (t) { setHighlights(p => [...p, t]); setNewHighlight('') }
  }

  async function handleSend() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const supabase = createClient()

    await supabase.from('weekly_reports').insert({
      site_id: siteId,
      title: title.trim(),
      summary: summary.trim() || null,
      content: content.trim(),
      group_id: groupId || null,
      week_start: weekStart,
      highlights: highlights.length > 0 ? highlights : null,
      author_id: staffId,
      published_at: new Date().toISOString(),
    })

    setSaving(false)
    setSaved(true)
    setTitle(''); setSummary(''); setContent(''); setGroupId(''); setHighlights([])
    setTimeout(() => { setSaved(false); setOpen(false); router.refresh() }, 1500)
  }

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
            <Plus size={16} className="text-brand-600" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Neuen Wochenbericht erstellen</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div>
              <label className="label">Woche (Mo)</label>
              <input type="date" className="input-field" value={weekStart} onChange={e => setWeekStart(e.target.value)} />
            </div>
            <div>
              <label className="label">Gruppe</label>
              <select className="input-field" value={groupId} onChange={e => setGroupId(e.target.value)}>
                <option value="">Alle</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Titel *</label>
            <input className="input-field" placeholder="z.B. Eine Woche voller Entdeckungen"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Kurzzusammenfassung</label>
            <input className="input-field" placeholder="Kurze Vorschau …"
              value={summary} onChange={e => setSummary(e.target.value)} />
          </div>
          <div>
            <label className="label">Bericht *</label>
            <textarea className="input-field resize-none" rows={5}
              placeholder="Was hat die Gruppe diese Woche erlebt?"
              value={content} onChange={e => setContent(e.target.value)} />
          </div>
          {/* Highlights */}
          <div>
            <label className="label">Highlights der Woche</label>
            <div className="flex gap-2">
              <input className="input-field flex-1" placeholder="Highlight hinzufügen …"
                value={newHighlight}
                onChange={e => setNewHighlight(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addHighlight() } }} />
              <button onClick={addHighlight} className="btn-primary px-3 py-2 text-sm">+</button>
            </div>
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-1 bg-brand-50 rounded-lg px-2 py-1">
                    <span className="text-xs text-brand-800">✨ {h}</span>
                    <button onClick={() => setHighlights(p => p.filter((_, j) => j !== i))}>
                      <X size={10} className="text-brand-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSend} disabled={!title.trim() || !content.trim() || saving}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saved ? <><CheckCircle2 size={16} /> Veröffentlicht!</>
              : saving ? 'Speichere…'
              : <><Send size={15} /> Wochenbericht veröffentlichen</>}
          </button>
        </div>
      )}
    </div>
  )
}
