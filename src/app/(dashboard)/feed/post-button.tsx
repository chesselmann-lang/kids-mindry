'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const types = [
  { value: 'info',      label: '📘 Info' },
  { value: 'important', label: '🔴 Wichtig' },
  { value: 'event',     label: '📅 Veranstaltung' },
  { value: 'reminder',  label: '⏰ Erinnerung' },
]

interface Group { id: string; name: string; color: string }

export default function PostButton({ siteId, authorId }: { siteId: string; authorId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState('info')
  const [pinned, setPinned] = useState(false)
  const [groupId, setGroupId] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    supabase.from('groups').select('id, name, color').eq('site_id', siteId).order('name').then(({ data }) => {
      if (data) setGroups(data as Group[])
    })
  }, [open, siteId])

  function reset() {
    setTitle(''); setBody(''); setType('info'); setPinned(false); setGroupId(null)
  }

  async function handlePost() {
    if (!title.trim() || !body.trim()) return
    setLoading(true)

    const { data: post } = await supabase.from('announcements').insert({
      site_id: siteId,
      author_id: authorId,
      title: title.trim(),
      body: body.trim(),
      type: type as any,
      group_id: groupId,
      pinned,
      published_at: new Date().toISOString(),
      attachments: [],
    }).select('id').single()

    // Auto-notify relevant parents
    if (post) {
      try {
        let parentUserIds: string[] = []

        if (groupId) {
          // Group-specific: notify parents of children in this group
          const { data: childrenInGroup } = await supabase
            .from('children')
            .select('id')
            .eq('group_id', groupId)
            .eq('site_id', siteId)
            .eq('status', 'active')

          if (childrenInGroup && childrenInGroup.length > 0) {
            const cids = childrenInGroup.map((c: any) => c.id)
            const { data: guards } = await supabase
              .from('guardians')
              .select('user_id')
              .in('child_id', cids)
              .not('user_id', 'is', null)
            parentUserIds = [...new Set((guards ?? []).map((g: any) => g.user_id))]
          }
        } else {
          // Site-wide: notify all parents
          const { data: parents } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'parent')
          parentUserIds = (parents ?? []).map((p: any) => p.id)
        }

        if (parentUserIds.length > 0) {
          const notifs = parentUserIds.map((uid: string) => ({
            user_id: uid,
            title: title.trim(),
            body: body.trim().slice(0, 80),
            data: { url: '/feed' },
            read: false,
          }))
          await supabase.from('notifications').insert(notifs)

          // Also send push notifications (fire-and-forget)
          fetch('/api/push-send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientIds: parentUserIds,
              title: title.trim(),
              body: body.trim().slice(0, 100),
              url: '/feed',
              sourceType: 'announcement',
              sourceId: post?.id,
            }),
          }).catch(() => {/* non-fatal */})
        }
      } catch (_) {
        // Notifications are best-effort — don't block the post
      }
    }

    setLoading(false)
    setOpen(false)
    reset()
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
        <Plus size={18} /> Beitrag
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">Neuer Beitrag</h2>
              <button onClick={() => { setOpen(false); reset() }} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Typ */}
              <div>
                <label className="label">Typ</label>
                <div className="flex flex-wrap gap-2">
                  {types.map(t => (
                    <button key={t.value} onClick={() => setType(t.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        type === t.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Zielgruppe */}
              {groups.length > 0 && (
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Users size={13} className="text-gray-400" />
                    Zielgruppe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setGroupId(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        groupId === null ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Alle Gruppen
                    </button>
                    {groups.map(g => (
                      <button key={g.id} onClick={() => setGroupId(g.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          groupId === g.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={groupId === g.id ? { backgroundColor: g.color } : {}}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                  {groupId !== null && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      Nur Eltern der Gruppe &quot;{groups.find(g => g.id === groupId)?.name}&quot; sehen diesen Beitrag.
                    </p>
                  )}
                </div>
              )}

              {/* Titel */}
              <div>
                <label className="label">Titel</label>
                <input className="input" placeholder="z.B. Kita geschlossen am Freitag"
                  value={title} onChange={e => setTitle(e.target.value)} autoFocus />
              </div>

              {/* Text */}
              <div>
                <label className="label">Nachricht</label>
                <textarea className="input resize-none" rows={4}
                  placeholder="Was möchtest du mitteilen?"
                  value={body} onChange={e => setBody(e.target.value)} />
              </div>

              {/* Anpinnen */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setPinned(p => !p)}
                  className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${pinned ? 'bg-brand-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${pinned ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">Beitrag anpinnen</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-5 pb-5 sticky bottom-0 bg-white pt-3 border-t border-gray-100">
              <button onClick={() => { setOpen(false); reset() }} className="btn-secondary flex-1">Abbrechen</button>
              <button onClick={handlePost} disabled={!title.trim() || !body.trim() || loading}
                className="btn-primary flex-1 disabled:opacity-50">
                {loading ? 'Veröffentliche…' : 'Veröffentlichen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
