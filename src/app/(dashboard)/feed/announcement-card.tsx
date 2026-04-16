'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { Pin, Users, Languages, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import ReactionBar from '@/components/features/reaction-bar'

const typeConfig = {
  info:      { label: 'Info',          color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  important: { label: 'Wichtig',       color: 'bg-red-100 text-red-700',     dot: 'bg-red-500' },
  event:     { label: 'Veranstaltung', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  menu:      { label: 'Speiseplan',    color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  reminder:  { label: 'Erinnerung',    color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
}

interface Props {
  announcement: any
  group: { name: string; color: string } | null
  isStaff?: boolean
  userId: string
  userLanguage?: string
}

export default function AnnouncementCard({ announcement: a, group, isStaff, userId, userLanguage }: Props) {
  const cfg = typeConfig[a.type as keyof typeof typeConfig] ?? typeConfig.info
  const ago = formatDistanceToNow(new Date(a.published_at), { locale: de, addSuffix: true })
  const [readCount, setReadCount] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [translated, setTranslated] = useState<{ title?: string; body: string } | null>(null)
  const [translating, setTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  // Mark as read
  useEffect(() => {
    fetch(`/api/announcements/${a.id}/read`, { method: 'POST' }).catch(() => {})
  }, [a.id])

  // Auto-Übersetzung laden wenn Nutzer non-DE Sprache hat und Auto-Translate aktiv ist
  useEffect(() => {
    if (a.auto_translate && userLanguage && userLanguage !== 'de') {
      fetch(`/api/announcements/${a.id}/translate?lang=${userLanguage}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setTranslated({ title: d.title, body: d.content }))
        .catch(() => {})
    }
  }, [a.id, a.auto_translate, userLanguage])

  // Manuell übersetzen
  const handleManualTranslate = async () => {
    setTranslating(true)
    const lang = navigator.language.split('-')[0] || 'en'
    const res = await fetch(`/api/announcements/${a.id}/translate?lang=${lang}`)
    if (res.ok) {
      const d = await res.json()
      setTranslated({ title: d.title, body: d.content })
      setShowOriginal(false)
    } else {
      // Noch nicht übersetzt — auf Server anfordern
      await fetch(`/api/announcements/${a.id}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ languages: [lang] }),
      })
      const res2 = await fetch(`/api/announcements/${a.id}/translate?lang=${lang}`)
      if (res2.ok) {
        const d = await res2.json()
        setTranslated({ title: d.title, body: d.content })
      }
    }
    setTranslating(false)
  }

  const displayTitle = (!showOriginal && translated?.title) ? translated.title : a.title
  const displayBody = (!showOriginal && translated?.body) ? translated.body : a.body

  return (
    <div className={`card p-5 ${a.pinned ? 'ring-1 ring-brand-200' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${cfg.color}`}>{cfg.label}</span>
          {group && (
            <span className="badge text-white text-[10px]" style={{ backgroundColor: group.color }}>
              <Users size={9} /> {group.name}
            </span>
          )}
          {a.pinned && (
            <span className="badge bg-brand-50 text-brand-700">
              <Pin size={10} /> Angepinnt
            </span>
          )}
        </div>
        <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">{ago}</span>
      </div>

      {displayTitle && (
        <h3 className="font-semibold text-gray-900 mt-3 text-base leading-snug">{displayTitle}</h3>
      )}

      {displayBody && (
        <div
          className="mt-1.5 text-sm text-gray-600 leading-relaxed prose-sm"
          dangerouslySetInnerHTML={{ __html: displayBody }}
        />
      )}

      {/* Übersetzungs-Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          {translated && !showOriginal && (
            <button onClick={() => setShowOriginal(true)}
              className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <Languages size={11} /> Original anzeigen
            </button>
          )}
          {translated && showOriginal && (
            <button onClick={() => setShowOriginal(false)}
              className="text-[11px] text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <Languages size={11} /> Übersetzung
            </button>
          )}
          {!translated && a.body && (
            <button onClick={handleManualTranslate} disabled={translating}
              className="text-[11px] text-gray-400 hover:text-brand-600 flex items-center gap-1 transition-colors">
              {translating ? <Loader2 size={11} className="animate-spin" /> : <Languages size={11} />}
              Übersetzen
            </button>
          )}
        </div>

        {/* Gelesen-Zähler für Staff */}
        {isStaff && readCount !== null && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1">
            {readCount} gelesen
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        )}
      </div>

      {/* Reaktionen */}
      <ReactionBar announcementId={a.id} userId={userId} />

      {/* Read-Liste für Staff */}
      {expanded && isStaff && <ReadList announcementId={a.id} />}
    </div>
  )
}

function ReadList({ announcementId }: { announcementId: string }) {
  const [reads, setReads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(`/api/announcements/${announcementId}/read`)
      .then(r => r.json()).then(d => { setReads(d.reads ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [announcementId])
  if (loading) return <div className="mt-3 text-xs text-gray-400">Lade...</div>
  if (!reads.length) return <div className="mt-3 text-xs text-gray-400">Noch niemand hat gelesen.</div>
  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Gelesen von</p>
      {reads.slice(0, 10).map((r, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="text-gray-700">{r.profiles?.full_name ?? 'Unbekannt'}</span>
          <span className="text-gray-400">{formatDistanceToNow(new Date(r.read_at), { locale: de, addSuffix: true })}</span>
        </div>
      ))}
      {reads.length > 10 && <p className="text-xs text-gray-400">+{reads.length - 10} weitere</p>}
    </div>
  )
}
