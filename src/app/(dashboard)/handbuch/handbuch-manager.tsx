'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, ChevronRight, Pencil, Trash2, BookOpen, Save } from 'lucide-react'

interface Chapter {
  id: string
  title: string
  content: string
  sort_order: number
  icon: string | null
}

interface Props {
  chapters: Chapter[]
  isAdmin: boolean
  siteId: string
}

const CHAPTER_ICONS = ['📋', '🕐', '🍎', '🏥', '🚗', '💰', '👔', '🎉', '📞', '📅', '🔒', '❓']

export default function HandbuchManager({ chapters: initial, isAdmin, siteId }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>(initial)
  const [expandedId, setExpandedId] = useState<string | null>(chapters[0]?.id ?? null)
  const [addOpen, setAddOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [icon, setIcon] = useState('📋')
  const [saving, setSaving] = useState(false)

  async function saveChapter() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const supabase = createClient()

    if (editingId) {
      const { data } = await supabase.from('handbook_chapters')
        .update({ title: title.trim(), content: content.trim(), icon })
        .eq('id', editingId).select().single()
      if (data) setChapters(prev => prev.map(c => c.id === editingId ? data as Chapter : c))
    } else {
      const { data } = await supabase.from('handbook_chapters').insert({
        site_id: siteId,
        title: title.trim(),
        content: content.trim(),
        icon,
        sort_order: chapters.length + 1,
      }).select().single()
      if (data) setChapters(prev => [...prev, data as Chapter])
    }

    setSaving(false)
    setTitle('')
    setContent('')
    setIcon('📋')
    setEditingId(null)
    setAddOpen(false)
  }

  function startEdit(c: Chapter) {
    setEditingId(c.id)
    setTitle(c.title)
    setContent(c.content)
    setIcon(c.icon ?? '📋')
    setAddOpen(true)
  }

  async function deleteChapter(id: string) {
    if (!confirm('Kapitel löschen?')) return
    const supabase = createClient()
    await supabase.from('handbook_chapters').delete().eq('id', id)
    setChapters(prev => prev.filter(c => c.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <div className="space-y-3">
      {isAdmin && (
        <div className="card overflow-hidden">
          <button onClick={() => { if (!addOpen) { setEditingId(null); setTitle(''); setContent(''); setIcon('📋') } setAddOpen(v => !v) }}
            className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <Plus size={16} className="text-blue-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">
                {editingId ? 'Kapitel bearbeiten' : 'Kapitel hinzufügen'}
              </span>
            </div>
            {addOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {addOpen && (
            <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
              <div>
                <label className="label">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {CHAPTER_ICONS.map(i => (
                    <button key={i} onClick={() => setIcon(i)}
                      className={`text-xl p-1.5 rounded-lg transition-colors ${icon === i ? 'bg-blue-100 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Titel *</label>
                <input className="input-field" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="z.B. Öffnungszeiten & Bring-/Abholzeiten" />
              </div>
              <div>
                <label className="label">Inhalt *</label>
                <textarea className="input-field resize-none" rows={6} value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Inhalt dieses Kapitels…" />
              </div>
              <div className="flex gap-2">
                <button onClick={saveChapter} disabled={!title.trim() || !content.trim() || saving}
                  className="flex-1 btn-primary py-2.5 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save size={14} /> {saving ? 'Speichern…' : editingId ? 'Aktualisieren' : 'Kapitel hinzufügen'}
                </button>
                {editingId && (
                  <button onClick={() => { setEditingId(null); setAddOpen(false) }}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-600">
                    Abbruch
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {chapters.length === 0 ? (
        <div className="card p-8 text-center">
          <BookOpen size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Das Handbuch ist noch leer</p>
        </div>
      ) : (
        chapters.map(chapter => (
          <div key={chapter.id} className="card overflow-hidden">
            <button
              className="w-full p-4 flex items-center gap-3 text-left"
              onClick={() => setExpandedId(expandedId === chapter.id ? null : chapter.id)}
            >
              <span className="text-xl flex-shrink-0">{chapter.icon ?? '📋'}</span>
              <p className="flex-1 font-semibold text-gray-900 text-sm">{chapter.title}</p>
              {isAdmin && (
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => startEdit(chapter)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteChapter(chapter.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
              <ChevronRight size={14} className={`text-gray-300 transition-transform flex-shrink-0 ${expandedId === chapter.id ? 'rotate-90' : ''}`} />
            </button>
            {expandedId === chapter.id && (
              <div className="px-4 pb-4 border-t border-gray-50 pt-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{chapter.content}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
