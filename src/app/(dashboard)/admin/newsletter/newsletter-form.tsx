'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Send, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  staffId: string
  siteId: string
  groups: { id: string; name: string }[]
}

export default function NewsletterForm({ staffId, siteId, groups }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [groupId, setGroupId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [topic, setTopic] = useState('')
  const [aiTopicOpen, setAiTopicOpen] = useState(false)

  async function generateDraft() {
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/newsletter-entwurf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() || undefined }),
      })
      const data = await res.json()
      if (data.titel) setTitle(data.titel)
      if (data.zusammenfassung) setSummary(data.zusammenfassung)
      if (data.inhalt) setContent(data.inhalt)
      setAiTopicOpen(false)
    } catch { /* silent */ }
    finally { setAiLoading(false) }
  }

  async function handleSend() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const supabase = createClient()

    await supabase.from('newsletters').insert({
      site_id: siteId,
      title: title.trim(),
      summary: summary.trim() || null,
      content: content.trim(),
      group_id: groupId || null,
      author_id: staffId,
      published_at: new Date().toISOString(),
    })

    setSaving(false)
    setSaved(true)
    setTitle(''); setSummary(''); setContent(''); setGroupId(''); setTopic('')
    setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
    router.refresh()
  }

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
            <Plus size={16} className="text-brand-600" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Neuen Newsletter erstellen</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
          {/* AI Draft Button */}
          <div className="pt-3">
            <div className="rounded-xl border border-violet-100 bg-violet-50 overflow-hidden">
              <button
                onClick={() => setAiTopicOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-violet-500" />
                  <span className="text-xs font-semibold text-violet-700">KI-Entwurf generieren</span>
                </div>
                {aiTopicOpen
                  ? <ChevronUp size={13} className="text-violet-400" />
                  : <ChevronDown size={13} className="text-violet-400" />}
              </button>
              {aiTopicOpen && (
                <div className="px-3 pb-3 border-t border-violet-100 space-y-2">
                  <input
                    className="input-field mt-2 text-sm"
                    placeholder="Thema/Anlass (optional, z.B. Sommerfest, Schließzeiten)"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                  />
                  <button
                    onClick={generateDraft}
                    disabled={aiLoading}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-40"
                  >
                    {aiLoading
                      ? <><Loader2 size={12} className="animate-spin" /> KI schreibt…</>
                      : <><Sparkles size={12} /> Entwurf erstellen</>}
                  </button>
                  <p className="text-[10px] text-violet-500">KI nutzt aktuelle Termine & Aktivitäten · Text bitte prüfen</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="label">Betreff *</label>
            <input className="input-field" placeholder="Titel des Newsletters"
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Kurzzusammenfassung</label>
            <input className="input-field" placeholder="Kurze Vorschau (optional)"
              value={summary} onChange={e => setSummary(e.target.value)} />
          </div>
          <div>
            <label className="label">Inhalt *</label>
            <textarea className="input-field resize-none" rows={6}
              placeholder="Newsletter-Text …"
              value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <div>
            <label className="label">Zielgruppe</label>
            <select className="input-field" value={groupId} onChange={e => setGroupId(e.target.value)}>
              <option value="">Alle Eltern</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <button onClick={handleSend} disabled={!title.trim() || !content.trim() || saving}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saved
              ? <><CheckCircle2 size={16} /> Gesendet!</>
              : saving
                ? 'Sende…'
                : <><Send size={15} /> Newsletter senden</>}
          </button>
        </div>
      )}
    </div>
  )
}
