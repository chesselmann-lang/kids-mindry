'use client'

import { useState } from 'react'
import { Eye, ChevronDown, ChevronUp, Save, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Child { id: string; first_name: string; last_name: string }

interface Props {
  children: Child[]
  authorId: string
  siteId: string
}

const CATEGORIES = [
  { value: 'sprache', label: '🗣️ Sprache' },
  { value: 'motorik', label: '🏃 Motorik' },
  { value: 'sozial', label: '👥 Soziales' },
  { value: 'kognition', label: '🧠 Kognition' },
  { value: 'kreativitaet', label: '🎨 Kreativität' },
  { value: 'emotion', label: '💛 Emotion' },
  { value: 'allgemein', label: '📝 Allgemein' },
]

export default function SchnellBeobachtung({ children, authorId, siteId }: Props) {
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState('')
  const [category, setCategory] = useState('allgemein')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  async function handleSave() {
    if (!childId || !content.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('observations').insert({
      site_id: siteId,
      child_id: childId,
      author_id: authorId,
      content: content.trim(),
      category,
    })
    setSaving(false)
    setSaved(true)
    setChildId(''); setContent(''); setCategory('allgemein')
    setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
  }

  async function improveWithAI() {
    if (!content.trim()) return
    setAiLoading(true)
    try {
      const child = children.find(c => c.id === childId)
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Formuliere diese pädagogische Beobachtung professioneller und detailreicher (max. 3 Sätze, neutrale Sprache, ohne Namen):

Ursprüngliche Notiz: "${content}"
${child ? `Kind: ${child.first_name} (${category})` : ''}

Antworte NUR mit dem verbesserten Text.`,
          }],
        }),
      })
      const data = await res.json()
      if (data.text) setContent(data.text.trim())
    } catch { /* silent */ }
    finally { setAiLoading(false) }
  }

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center">
            <Eye size={16} className="text-sky-600" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Schnell-Beobachtung</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Kind *</label>
              <select className="input-field" value={childId} onChange={e => setChildId(e.target.value)}>
                <option value="">Auswählen…</option>
                {children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Bereich</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Beobachtung *</label>
              <button
                onClick={improveWithAI}
                disabled={!content.trim() || aiLoading}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors disabled:opacity-40"
              >
                {aiLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                KI verbessern
              </button>
            </div>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Was hast du beobachtet? Kurze Notiz genügt…"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!childId || !content.trim() || saving}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saved
              ? <><CheckCircle2 size={15} /> Gespeichert!</>
              : saving
              ? 'Speichere…'
              : <><Save size={15} /> Beobachtung speichern</>
            }
          </button>
        </div>
      )}
    </div>
  )
}
