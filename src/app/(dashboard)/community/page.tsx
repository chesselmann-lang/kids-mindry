'use client'

import { useState } from 'react'
import {
  Globe, Heart, MessageCircle, Share2, Bookmark,
  ThumbsUp, Users, PlusCircle, Image, Link2,
  Sparkles, Award, ChevronRight, Bell,
} from 'lucide-react'

// ── Community — KitaHub Vernetzung ────────────────────────────────────────────
// Austausch zwischen Fachkräften, Ideen teilen, Pinnwand für die Einrichtung

interface Beitrag {
  id: string
  autor: string
  avatar: string
  rolle: 'Erzieherin' | 'Leitung' | 'Elternteil' | 'Träger'
  zeit: string
  inhalt: string
  likes: number
  kommentare: number
  gemerkt: boolean
  tags: string[]
  bild?: string
}

const BEITRAEGE: Beitrag[] = [
  {
    id: '1',
    autor: 'Sabine Müller',
    avatar: 'SM',
    rolle: 'Erzieherin',
    zeit: 'vor 2 Std.',
    inhalt: '🌱 Unser Gartenprojekt läuft super! Die Kinder haben heute die ersten Tomaten geerntet. Wer hat Ideen für das Kochen mit Kindern unter 3?',
    likes: 12,
    kommentare: 4,
    gemerkt: false,
    tags: ['Projekt', 'Natur', 'U3'],
  },
  {
    id: '2',
    autor: 'Michael Berger',
    avatar: 'MB',
    rolle: 'Leitung',
    zeit: 'vor 5 Std.',
    inhalt: '📅 Erinnerung: Nächste Woche Dienstag findet der Qualitätszirkel statt. Thema: Bildungsdokumentation mit digitalen Tools. Bitte alle bis Montag anmelden.',
    likes: 5,
    kommentare: 8,
    gemerkt: true,
    tags: ['Ankündigung', 'Qualität'],
  },
  {
    id: '3',
    autor: 'Fatima Al-Hassan',
    avatar: 'FA',
    rolle: 'Erzieherin',
    zeit: 'gestern',
    inhalt: '💡 Tipp für Sprachförderung: Das Bilderbuch "Der Grüffelo" auf Arabisch und Deutsch vorlesen — Kinder mit Migrationshintergrund reagieren begeistert und lernen Deutsch spielerisch.',
    likes: 28,
    kommentare: 12,
    gemerkt: false,
    tags: ['Sprache', 'Inklusion', 'Tipp'],
  },
  {
    id: '4',
    autor: 'Kita Elternrat',
    avatar: 'ER',
    rolle: 'Elternteil',
    zeit: 'vor 2 Tagen',
    inhalt: '🙏 Ein riesiges Dankeschön an das gesamte Team für das Sommerfest! Die Kinder hatten eine wunderschöne Zeit. Wir sind sehr dankbar für euer Engagement! ❤️',
    likes: 45,
    kommentare: 6,
    gemerkt: false,
    tags: ['Lob', 'Sommerfest'],
  },
]

const KATEGORIEN = ['Alle', 'Projekte', 'Ideen & Tipps', 'Ankündigungen', 'Lob & Dank']

const ROLLE_COLOR: Record<string, string> = {
  'Erzieherin': 'bg-blue-100 text-blue-700',
  'Leitung': 'bg-purple-100 text-purple-700',
  'Elternteil': 'bg-green-100 text-green-700',
  'Träger': 'bg-orange-100 text-orange-700',
}

export default function CommunityPage() {
  const [kategorie, setKategorie] = useState('Alle')
  const [beitraege, setBeitraege] = useState(BEITRAEGE)
  const [showForm, setShowForm] = useState(false)
  const [neuerText, setNeuerText] = useState('')

  function handleLike(id: string) {
    setBeitraege(prev => prev.map(b => b.id === id ? { ...b, likes: b.likes + 1 } : b))
  }

  function handleMerken(id: string) {
    setBeitraege(prev => prev.map(b => b.id === id ? { ...b, gemerkt: !b.gemerkt } : b))
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <Globe className="w-6 h-6 text-indigo-600" /> Community
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Austausch, Ideen und Ankündigungen im Team</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <PlusCircle className="w-4 h-4" /> Beitrag
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Beiträge',    val: beitraege.length, icon: MessageCircle },
          { label: 'Mitglieder',  val: 14,               icon: Users },
          { label: 'Diese Woche', val: 6,                icon: Sparkles },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
              <Icon className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* New post form */}
      {showForm && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
          <p className="font-semibold text-sm text-indigo-800">Neuen Beitrag erstellen</p>
          <textarea
            value={neuerText}
            onChange={e => setNeuerText(e.target.value)}
            placeholder="Was möchten Sie mit dem Team teilen?"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-indigo-200 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-xs text-indigo-700">
              <Image className="w-3.5 h-3.5" /> Bild
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-xs text-indigo-700">
              <Link2 className="w-3.5 h-3.5" /> Link
            </button>
            <button className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700">
              Veröffentlichen
            </button>
          </div>
        </div>
      )}

      {/* Kategorien */}
      <div className="flex gap-2 flex-wrap">
        {KATEGORIEN.map(k => (
          <button key={k} onClick={() => setKategorie(k)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${kategorie === k ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {k}
          </button>
        ))}
      </div>

      {/* Beiträge */}
      <div className="space-y-3">
        {beitraege.map(b => (
          <div key={b.id} className="rounded-2xl border border-gray-200 bg-white p-5">
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                {b.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm text-gray-900">{b.autor}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLLE_COLOR[b.rolle]}`}>{b.rolle}</span>
                </div>
                <p className="text-xs text-gray-400">{b.zeit}</p>
              </div>
              <button onClick={() => handleMerken(b.id)}>
                <Bookmark className={`w-4 h-4 ${b.gemerkt ? 'text-indigo-600 fill-indigo-600' : 'text-gray-300'}`} />
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{b.inhalt}</p>

            {/* Tags */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {b.tags.map(t => (
                <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{t}</span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => handleLike(b.id)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                <ThumbsUp className="w-3.5 h-3.5" /> {b.likes}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" /> {b.kommentare}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                <Share2 className="w-3.5 h-3.5" /> Teilen
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trending tags */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" /> Beliebte Themen
        </h3>
        <div className="flex gap-2 flex-wrap">
          {['Sprachförderung', 'Bildungsdokumentation', 'Natur & Umwelt', 'Inklusion', 'Transition', 'BaSiK', 'Qualitätszirkel'].map(t => (
            <span key={t} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full cursor-pointer hover:bg-indigo-100">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
