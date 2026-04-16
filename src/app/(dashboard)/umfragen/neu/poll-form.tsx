'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Props {
  authorId: string
  siteId: string
  groups: { id: string; name: string }[]
}

export default function PollForm({ authorId, siteId, groups }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [multipleChoice, setMultipleChoice] = useState(false)
  const [closesAt, setClosesAt] = useState('')
  const [groupId, setGroupId] = useState('')
  const [loading, setLoading] = useState(false)

  function addOption() {
    if (options.length < 10) setOptions(prev => [...prev, ''])
  }

  function updateOption(idx: number, val: string) {
    setOptions(prev => prev.map((o, i) => i === idx ? val : o))
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return
    setOptions(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleSave() {
    const validOptions = options.filter(o => o.trim())
    if (!title.trim() || validOptions.length < 2) return
    setLoading(true)
    const supabase = createClient()

    const { data: poll } = await supabase.from('polls').insert({
      site_id: siteId,
      author_id: authorId,
      title: title.trim(),
      description: description.trim() || null,
      options: validOptions,
      multiple: multipleChoice,
      closed_at: closesAt || null,
      group_id: groupId || null,
    }).select().single()

    setLoading(false)
    if (poll) {
      router.push('/umfragen')
      router.refresh()
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/umfragen" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Neue Umfrage</h1>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <div>
          <label className="label">Titel *</label>
          <input className="input-field" placeholder="Worum geht es?" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Beschreibung</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Optionale Erläuterung…"
            value={description} onChange={e => setDescription(e.target.value)} />
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="label mb-0">Antwortoptionen *</label>
          <button onClick={addOption} className="text-xs text-brand-600 flex items-center gap-1 font-medium">
            <Plus size={14} /> Option hinzufügen
          </button>
        </div>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
              {idx + 1}
            </span>
            <input
              className="input-field flex-1"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={e => updateOption(idx, e.target.value)}
            />
            {options.length > 2 && (
              <button onClick={() => removeOption(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Mehrfachauswahl</p>
            <p className="text-xs text-gray-400 mt-0.5">Mehrere Optionen wählbar</p>
          </div>
          <button onClick={() => setMultipleChoice(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${multipleChoice ? 'bg-brand-600' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${multipleChoice ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div>
          <label className="label">Enddatum</label>
          <input type="datetime-local" className="input-field" value={closesAt} onChange={e => setClosesAt(e.target.value)} />
        </div>

        {groups.length > 0 && (
          <div>
            <label className="label">Zielgruppe</label>
            <select className="input-field" value={groupId} onChange={e => setGroupId(e.target.value)}>
              <option value="">Alle Eltern</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={!title.trim() || options.filter(o => o.trim()).length < 2 || loading}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
        <Save size={18} />
        {loading ? 'Speichere…' : 'Umfrage veröffentlichen'}
      </button>
    </div>
  )
}
