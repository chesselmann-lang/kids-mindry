'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pin, PinOff, Trash2, StickyNote, Pencil, Check, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'

interface Note {
  id: string
  content: string
  color: string
  pinned: boolean
  created_at: string
  author_id: string
  profiles?: { full_name: string }
}

const COLORS = [
  { value: 'yellow',  bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-400' },
  { value: 'blue',    bg: 'bg-sky-50',      border: 'border-sky-200',    dot: 'bg-sky-400' },
  { value: 'green',   bg: 'bg-emerald-50',  border: 'border-emerald-200',dot: 'bg-emerald-400' },
  { value: 'pink',    bg: 'bg-pink-50',     border: 'border-pink-200',   dot: 'bg-pink-400' },
  { value: 'purple',  bg: 'bg-violet-50',   border: 'border-violet-200', dot: 'bg-violet-400' },
]

function getColorCfg(value: string) {
  return COLORS.find(c => c.value === value) ?? COLORS[0]
}

interface Props {
  notes: Note[]
  userId: string
  siteId: string
}

export default function NotizenClient({ notes: initial, userId, siteId }: Props) {
  const [notes, setNotes] = useState<Note[]>(initial)
  const [newContent, setNewContent] = useState('')
  const [newColor, setNewColor] = useState('yellow')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  async function addNote() {
    if (!newContent.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('quick_notes').insert({
      site_id: siteId,
      author_id: userId,
      content: newContent.trim(),
      color: newColor,
    }).select('*, profiles:author_id(full_name)').single()
    setSaving(false)
    if (data) {
      setNotes(prev => [data as Note, ...prev])
      setNewContent('')
      setOpen(false)
    }
  }

  async function togglePin(note: Note) {
    const supabase = createClient()
    await supabase.from('quick_notes').update({ pinned: !note.pinned }).eq('id', note.id)
    setNotes(prev => {
      const updated = prev.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n)
      return updated.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    })
  }

  async function deleteNote(id: string) {
    const supabase = createClient()
    await supabase.from('quick_notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  async function saveEdit(id: string) {
    if (!editContent.trim()) return
    const supabase = createClient()
    await supabase.from('quick_notes').update({ content: editContent.trim(), updated_at: new Date().toISOString() }).eq('id', id)
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content: editContent.trim() } : n))
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)}
          className="w-full flex items-center gap-3 p-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <Plus size={16} className="text-amber-600" />
          </div>
          <span className="font-semibold text-sm text-gray-900 flex-1 text-left">Neue Notiz</span>
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <textarea
              className="input-field resize-none w-full"
              rows={4}
              placeholder="Notiz schreiben…"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              autoFocus
            />
            {/* Color picker */}
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400">Farbe:</span>
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setNewColor(c.value)}
                  className={`w-6 h-6 rounded-full ${c.dot} transition-transform ${newColor === c.value ? 'scale-125 ring-2 ring-offset-1 ring-gray-300' : ''}`} />
              ))}
            </div>
            <button onClick={addNote} disabled={!newContent.trim() || saving}
              className="btn-primary w-full py-2.5 disabled:opacity-50">
              {saving ? 'Speichern…' : 'Notiz hinzufügen'}
            </button>
          </div>
        )}
      </div>

      {/* Notes grid */}
      {notes.length === 0 ? (
        <div className="card p-8 text-center">
          <StickyNote size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Notizen</p>
        </div>
      ) : (
        <div className="columns-2 gap-3 space-y-3">
          {notes.map(note => {
            const cfg = getColorCfg(note.color)
            const isOwn = note.author_id === userId
            const isEditing = editingId === note.id
            const ago = formatDistanceToNow(new Date(note.created_at), { locale: de, addSuffix: true })

            return (
              <div key={note.id}
                className={`break-inside-avoid rounded-2xl border p-3 ${cfg.bg} ${cfg.border} ${note.pinned ? 'ring-1 ring-offset-1 ring-amber-300' : ''}`}>
                {note.pinned && (
                  <div className="flex items-center gap-1 mb-1.5">
                    <Pin size={10} className="text-amber-500" />
                    <span className="text-[9px] text-amber-600 font-semibold uppercase tracking-wider">Angepinnt</span>
                  </div>
                )}
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg p-1.5 resize-none focus:outline-none"
                      rows={4}
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-1.5">
                      <button onClick={() => saveEdit(note.id)}
                        className="flex-1 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                        <Check size={12} /> OK
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="flex-1 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold flex items-center justify-center gap-1">
                        <X size={12} /> Abbruch
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400">{note.profiles?.full_name}</p>
                        <p className="text-[10px] text-gray-400">{ago}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {isOwn && (
                          <button onClick={() => { setEditingId(note.id); setEditContent(note.content) }}
                            className="p-1 rounded hover:bg-white/50 text-gray-400">
                            <Pencil size={11} />
                          </button>
                        )}
                        <button onClick={() => togglePin(note)}
                          className="p-1 rounded hover:bg-white/50 text-gray-400">
                          {note.pinned ? <PinOff size={11} /> : <Pin size={11} />}
                        </button>
                        {isOwn && (
                          <button onClick={() => deleteNote(note.id)}
                            className="p-1 rounded hover:bg-white/50 text-red-400">
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
