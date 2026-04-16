'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Send, Trash2, ArrowLeft, Loader2, Eye, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Props {
  authorId: string
  siteId: string
  existing?: {
    id: string
    title: string
    content: string
    meeting_date: string
    published_at: string | null
  }
}

export default function ProtokollForm({ authorId, siteId, existing }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!existing

  const [title, setTitle]       = useState(existing?.title ?? '')
  const [content, setContent]   = useState(existing?.content ?? '')
  const [meetingDate, setMeetingDate] = useState(
    existing?.meeting_date ?? new Date().toISOString().split('T')[0]
  )
  const [saving, setSaving]     = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isPublished = !!existing?.published_at
  const [aiLoading, setAiLoading] = useState(false)

  async function save(publish = false) {
    if (!title.trim()) return
    publish ? setPublishing(true) : setSaving(true)

    const payload: any = {
      site_id: siteId,
      title: title.trim(),
      content,
      meeting_date: meetingDate,
      author_id: authorId,
    }
    const isNewPublish = publish && !isPublished
    if (isNewPublish) payload.published_at = new Date().toISOString()

    let id = existing?.id
    if (isEdit && id) {
      await supabase.from('protocols').update(payload).eq('id', id)
    } else {
      const { data } = await supabase.from('protocols').insert(payload).select('id').single()
      id = (data as any)?.id
    }

    // Notify all parents when a protocol is published for the first time
    if (isNewPublish && id) {
      try {
        const { data: parents } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'parent')
        if (parents && parents.length > 0) {
          const notifs = parents.map((p: any) => ({
            user_id: p.id,
            title: `Neues Protokoll: ${title.trim()}`,
            body: 'Ein neues Protokoll wurde veröffentlicht.',
            data: { url: `/protokolle/${id}` },
          }))
          await supabase.from('notifications').insert(notifs)
        }
      } catch (_) {
        // Notifications are best-effort
      }
    }

    publish ? setPublishing(false) : setSaving(false)
    router.push(id ? `/protokolle/${id}` : '/protokolle')
    router.refresh()
  }

  async function unpublish() {
    if (!existing?.id) return
    await supabase.from('protocols').update({ published_at: null }).eq('id', existing.id)
    router.refresh()
    router.push(`/protokolle/${existing.id}`)
  }

  async function deleteProtokoll() {
    if (!existing?.id) return
    if (!confirm('Protokoll wirklich löschen? Das kann nicht rückgängig gemacht werden.')) return
    setDeleting(true)
    await supabase.from('protocols').delete().eq('id', existing.id)
    router.push('/protokolle')
    router.refresh()
  }

  async function generateDraft() {
    if (aiLoading) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/protokoll-entwurf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titel: title, meetingDate }),
      })
      const data = await res.json()
      if (res.ok && data.inhalt) {
        setContent(data.inhalt)
      }
    } catch (_) {
      // silent fail
    } finally {
      setAiLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={existing ? `/protokolle/${existing.id}` : '/protokolle'}
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Protokoll bearbeiten' : 'Neues Protokoll'}
          </h1>
          {isPublished && (
            <p className="text-xs text-green-600 font-medium mt-0.5">✓ Veröffentlicht</p>
          )}
        </div>
      </div>

      {/* Datum */}
      <div className="card p-4">
        <label className="label">Datum des Elternabends *</label>
        <input
          type="date"
          className="input"
          value={meetingDate}
          max={today}
          onChange={e => setMeetingDate(e.target.value)}
        />
      </div>

      {/* Titel */}
      <div className="card p-4">
        <label className="label">Titel *</label>
        <input
          className="input"
          placeholder="z.B. Elternabend Frühjahr 2026"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* Inhalt */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-1">
          <label className="label mb-0">Inhalt / Protokoll</label>
          <button
            type="button"
            onClick={generateDraft}
            disabled={aiLoading}
            className="flex items-center gap-1.5 text-xs text-violet-600 font-semibold px-2.5 py-1 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors disabled:opacity-60"
          >
            {aiLoading
              ? <><Loader2 size={11} className="animate-spin" /> Generiere…</>
              : <><Sparkles size={11} /> KI-Entwurf</>
            }
          </button>
        </div>
        <textarea
          className="input resize-none font-mono text-sm"
          rows={16}
          placeholder={`Tagesordnung:\n1. Begrüßung\n2. ...\n\nBeschlüsse:\n- ...`}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Freie Texteingabe – Zeilenumbrüche werden beibehalten.
        </p>
      </div>

      {/* Vorschau-Hinweis */}
      {isEdit && (
        <Link href={`/protokolle/${existing.id}`}
          className="flex items-center gap-2 text-xs text-brand-600 font-medium">
          <Eye size={13} /> Vorschau ansehen
        </Link>
      )}

      {/* Aktionen */}
      <div className="space-y-3">
        {/* Entwurf speichern */}
        <button
          onClick={() => save(false)}
          disabled={!title.trim() || saving || publishing}
          className="btn-secondary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
        >
          {saving
            ? <><Loader2 size={16} className="animate-spin" /> Speichere…</>
            : <><Save size={16} /> Als Entwurf speichern</>
          }
        </button>

        {/* Veröffentlichen */}
        {!isPublished && (
          <button
            onClick={() => save(true)}
            disabled={!title.trim() || saving || publishing}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
          >
            {publishing
              ? <><Loader2 size={16} className="animate-spin" /> Veröffentliche…</>
              : <><Send size={16} /> Veröffentlichen (für Eltern sichtbar)</>
            }
          </button>
        )}

        {/* Bereits veröffentlicht: Update-Button */}
        {isPublished && (
          <>
            <button
              onClick={() => save(false)}
              disabled={!title.trim() || saving}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              {saving
                ? <><Loader2 size={16} className="animate-spin" /> Speichere…</>
                : <><Save size={16} /> Änderungen speichern</>
              }
            </button>
            <button
              onClick={unpublish}
              className="w-full text-sm text-amber-600 font-medium py-2 hover:bg-amber-50 rounded-xl transition-colors"
            >
              Veröffentlichung zurückziehen
            </button>
          </>
        )}

        {/* Löschen */}
        {isEdit && (
          <button
            onClick={deleteProtokoll}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-500 font-medium py-2 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
          >
            {deleting
              ? <Loader2 size={15} className="animate-spin" />
              : <Trash2 size={15} />
            }
            Protokoll löschen
          </button>
        )}
      </div>
    </div>
  )
}
