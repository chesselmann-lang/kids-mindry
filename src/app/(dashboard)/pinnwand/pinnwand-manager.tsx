'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, Pin, PinOff, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Post {
  id: string
  title: string
  content: string
  is_pinned: boolean
  category: string | null
  author_id: string
  created_at: string
  profiles?: { full_name: string; role: string }
}

const CATEGORIES = [
  { value: 'info', label: 'Info', color: 'bg-blue-100 text-blue-700' },
  { value: 'important', label: 'Wichtig', color: 'bg-red-100 text-red-700' },
  { value: 'event', label: 'Veranstaltung', color: 'bg-green-100 text-green-700' },
  { value: 'request', label: 'Bitte', color: 'bg-amber-100 text-amber-700' },
  { value: 'other', label: 'Sonstiges', color: 'bg-gray-100 text-gray-600' },
]

interface Props {
  posts: Post[]
  userId: string
  siteId: string
  isAdmin: boolean
  isStaff: boolean
}

export default function PinnwandManager({ posts: initial, userId, siteId, isAdmin, isStaff }: Props) {
  const [posts, setPosts] = useState<Post[]>(initial)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('info')
  const [isPinned, setIsPinned] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('bulletin_posts').insert({
      site_id: siteId,
      author_id: userId,
      title: title.trim(),
      content: content.trim(),
      category,
      is_pinned: isPinned,
    }).select('*, profiles:author_id(full_name, role)').single()
    setSaving(false)
    if (data) {
      setPosts(prev => {
        const updated = [data as Post, ...prev]
        return updated.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at))
      })
      setTitle('')
      setContent('')
      setIsPinned(false)
      setOpen(false)
    }
  }

  async function togglePin(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('bulletin_posts').update({ is_pinned: !current }).eq('id', id)
    setPosts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, is_pinned: !current } : p)
      return updated.sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at))
    })
  }

  async function deletePost(id: string) {
    const supabase = createClient()
    await supabase.from('bulletin_posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const pinned = posts.filter(p => p.is_pinned)
  const regular = posts.filter(p => !p.is_pinned)

  return (
    <div className="space-y-4">
      {/* Create form — staff only */}
      {isStaff && (
        <div className="card overflow-hidden">
          <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Plus size={16} className="text-yellow-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Aushang erstellen</span>
            </div>
            {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {open && (
            <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
              <div>
                <label className="label">Titel *</label>
                <input className="input-field" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Betreff des Aushangs" />
              </div>
              <div>
                <label className="label">Inhalt *</label>
                <textarea className="input-field resize-none" rows={4}
                  value={content} onChange={e => setContent(e.target.value)}
                  placeholder="Text des Aushangs…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Kategorie</label>
                  <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setIsPinned(v => !v)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${isPinned ? 'bg-yellow-400' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPinned ? 'translate-x-5' : 'translate-x-1'}`} />
                    </div>
                    <span className="text-xs text-gray-600">Anpinnen</span>
                  </label>
                </div>
              </div>
              <button onClick={handleSave} disabled={!title.trim() || !content.trim() || saving}
                className="btn-primary w-full py-2.5 disabled:opacity-50">
                {saving ? 'Posten…' : 'Aushang posten'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pinned posts */}
      {pinned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Pin size={10} /> Angepinnt
          </p>
          <div className="space-y-3">
            {pinned.map(p => <PostCard key={p.id} post={p} isAdmin={isAdmin} userId={userId} onPin={togglePin} onDelete={deletePost} />)}
          </div>
        </div>
      )}

      {/* Regular posts */}
      {regular.length > 0 && (
        <div>
          {pinned.length > 0 && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Weitere Aushänge</p>}
          <div className="space-y-3">
            {regular.map(p => <PostCard key={p.id} post={p} isAdmin={isAdmin} userId={userId} onPin={togglePin} onDelete={deletePost} />)}
          </div>
        </div>
      )}

      {posts.length === 0 && (
        <div className="card p-8 text-center">
          <Pin size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Aushänge</p>
        </div>
      )}
    </div>
  )
}

function PostCard({ post: p, isAdmin, userId, onPin, onDelete }: {
  post: Post; isAdmin: boolean; userId: string;
  onPin: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const catCfg = CATEGORIES.find(c => c.value === p.category) ?? CATEGORIES[4]
  const canModify = isAdmin || p.author_id === userId

  return (
    <div className={`card p-4 ${p.is_pinned ? 'border-l-4 border-yellow-400' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {p.is_pinned && <Pin size={12} className="text-yellow-500 flex-shrink-0" />}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${catCfg.color}`}>{catCfg.label}</span>
        </div>
        {canModify && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => onPin(p.id, p.is_pinned)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              {p.is_pinned ? <PinOff size={13} /> : <Pin size={13} />}
            </button>
            <button onClick={() => onDelete(p.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
      <p className="text-sm font-bold text-gray-900 mb-1">{p.title}</p>
      <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.content}</p>
      <p className="text-[10px] text-gray-400 mt-2">
        {p.profiles?.full_name} · {format(parseISO(p.created_at), 'd. MMM yyyy', { locale: de })}
      </p>
    </div>
  )
}
