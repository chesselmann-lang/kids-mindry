'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, BookOpen, CheckCircle2, Loader2 } from 'lucide-react'

interface Props {
  userId: string
  siteId: string
  today: string
}

const STORAGE_KEY_PREFIX = 'kitahub_journal_'

export default function TagesjournalClient({ userId, siteId, today }: Props) {
  const [entry, setEntry] = useState('')
  const [savedEntry, setSavedEntry] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()
  const storageKey = STORAGE_KEY_PREFIX + today

  useEffect(() => {
    // Load existing journal entry for today from quick_notes (type = journal)
    const load = async () => {
      const { data } = await (supabase as any)
        .from('quick_notes')
        .select('id, content')
        .eq('site_id', siteId)
        .eq('author_id', userId)
        .eq('color', 'journal_' + today)
        .maybeSingle()

      if (data?.content) {
        setEntry(data.content)
        setSavedEntry(data.content)
      } else {
        // Restore from localStorage draft
        try {
          const draft = localStorage.getItem(storageKey)
          if (draft) setEntry(draft)
        } catch {}
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today])

  function handleChange(val: string) {
    setEntry(val)
    // Save draft to localStorage
    try { localStorage.setItem(storageKey, val) } catch {}
  }

  async function handleSave() {
    if (!entry.trim()) return
    setSaving(true)

    // Use color field as composite key: 'journal_YYYY-MM-DD' (a hack, but avoids new table)
    await (supabase as any)
      .from('quick_notes')
      .upsert({
        site_id: siteId,
        author_id: userId,
        content: entry.trim(),
        color: 'journal_' + today,
        pinned: false,
      }, { onConflict: 'author_id,color' })

    setSavedEntry(entry.trim())
    try { localStorage.removeItem(storageKey) } catch {}
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div className="card p-6 flex items-center justify-center">
        <Loader2 size={20} className="text-brand-400 animate-spin" />
      </div>
    )
  }

  const isDirty = entry.trim() !== (savedEntry ?? '').trim()

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen size={16} className="text-brand-600" />
        <h2 className="font-semibold text-sm text-gray-900">Tagebucheintrag</h2>
        {savedEntry && !isDirty && (
          <span className="text-[10px] text-green-600 font-medium flex items-center gap-0.5 ml-auto">
            <CheckCircle2 size={11} /> Gespeichert
          </span>
        )}
        {isDirty && (
          <span className="text-[10px] text-amber-600 font-medium ml-auto">Ungespeicherte Änderungen</span>
        )}
      </div>

      <textarea
        className="input w-full resize-none text-sm"
        rows={5}
        placeholder="Was ist heute in der Gruppe passiert? Besondere Ereignisse, Stimmung, Aktivitäten…"
        value={entry}
        onChange={e => handleChange(e.target.value)}
      />

      <button
        onClick={handleSave}
        disabled={!entry.trim() || saving || !isDirty}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40
          bg-brand-600 text-white hover:bg-brand-700 disabled:cursor-not-allowed"
      >
        {saving ? (
          <><Loader2 size={15} className="animate-spin" /> Speichern…</>
        ) : saved ? (
          <><CheckCircle2 size={15} /> Gespeichert!</>
        ) : (
          <><Save size={15} /> Eintrag speichern</>
        )}
      </button>
    </div>
  )
}
