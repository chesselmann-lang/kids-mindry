'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Download, ZoomIn } from 'lucide-react'

interface Entry {
  id: string
  title: string
  content: string | null
  category: string
  media_urls: string[]
  created_at: string
}

interface Photo {
  id: string
  storage_path: string
  caption: string | null
  taken_at: string
}

interface CategoryConfig {
  label: string
  color: string
  icon: any
}

interface Props {
  childId: string
  entries: Entry[]
  photos: Photo[]
  isStaff: boolean
  categoryConfig: Record<string, CategoryConfig>
}

// Unified lightbox item
interface LightboxItem {
  url: string
  caption?: string
  date?: string
  source?: string
}

export default function PortfolioClient({ entries, photos, categoryConfig }: Props) {
  const [lightbox, setLightbox] = useState<{ items: LightboxItem[]; idx: number } | null>(null)
  const [activeTab, setActiveTab] = useState<'eintraege' | 'fotos'>('eintraege')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  function photoUrl(path: string) {
    return `${supabaseUrl}/storage/v1/object/public/portfolio/${path}`
  }

  // Build photo lightbox items
  const photoItems: LightboxItem[] = photos.map(p => ({
    url: photoUrl(p.storage_path),
    caption: p.caption ?? undefined,
    date: new Date(p.taken_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }),
  }))

  // Open lightbox for entry media
  function openEntryMedia(urls: string[], startIdx: number, entryTitle: string, entryDate: string) {
    const items: LightboxItem[] = urls.map(url => ({
      url,
      source: entryTitle,
      date: entryDate,
    }))
    setLightbox({ items, idx: startIdx })
  }

  // Open lightbox for gallery photos
  function openPhoto(idx: number) {
    setLightbox({ items: photoItems, idx })
  }

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightbox) return
    if (e.key === 'ArrowLeft') {
      setLightbox(l => l ? { ...l, idx: Math.max(0, l.idx - 1) } : null)
    } else if (e.key === 'ArrowRight') {
      setLightbox(l => l ? { ...l, idx: Math.min(l.items.length - 1, l.idx + 1) } : null)
    } else if (e.key === 'Escape') {
      setLightbox(null)
    }
  }, [lightbox])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [!!lightbox])

  const currentItem = lightbox ? lightbox.items[lightbox.idx] : null

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {(['eintraege', 'fotos'] as const).map(tab => (
          <button key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'eintraege' ? `📖 Einträge (${entries.length})` : `📷 Fotos (${photos.length})`}
          </button>
        ))}
      </div>

      {/* Einträge */}
      {activeTab === 'eintraege' && (
        <div className="space-y-4">
          {entries.length === 0 && (
            <div className="card p-10 text-center text-gray-400">
              <p className="text-sm">Noch keine Portfolio-Einträge</p>
            </div>
          )}
          {entries.map(entry => {
            const cfg = categoryConfig[entry.category]
            const entryDate = new Date(entry.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
            return (
              <div key={entry.id} id={`cat-${entry.category}`} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cfg?.color + '20' }}>
                    {cfg?.icon && <cfg.icon size={16} style={{ color: cfg.color }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg?.color + '20', color: cfg?.color }}>
                        {cfg?.label}
                      </span>
                      <span className="text-[10px] text-gray-400">{entryDate}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{entry.title}</h3>
                    {entry.content && (
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{entry.content}</p>
                    )}
                    {entry.media_urls.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {entry.media_urls.map((url, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={url}
                              alt=""
                              className="w-full h-20 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => openEntryMedia(entry.media_urls, i, entry.title, entryDate)}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <div className="bg-black/40 rounded-lg p-1">
                                <ZoomIn size={14} className="text-white" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Foto-Galerie */}
      {activeTab === 'fotos' && (
        <div>
          {photos.length === 0 && (
            <div className="card p-10 text-center text-gray-400">
              <p className="text-sm">Noch keine Fotos</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo, idx) => (
              <button key={photo.id}
                onClick={() => openPhoto(idx)}
                className="relative group aspect-square rounded-2xl overflow-hidden hover:opacity-90 transition-opacity">
                <img src={photoUrl(photo.storage_path)} alt={photo.caption ?? ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <ZoomIn size={20} className="text-white drop-shadow-lg" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Unified Lightbox */}
      {lightbox && currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X size={28} />
          </button>

          {/* Download */}
          <a
            href={currentItem.url}
            download
            target="_blank"
            rel="noreferrer"
            className="absolute top-4 right-14 text-white/70 hover:text-white transition-colors z-10"
            onClick={e => e.stopPropagation()}
          >
            <Download size={22} />
          </a>

          {/* Prev */}
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-20 transition-colors z-10 p-2"
            disabled={lightbox.idx === 0}
            onClick={e => { e.stopPropagation(); setLightbox(l => l ? { ...l, idx: Math.max(0, l.idx - 1) } : null) }}
          >
            <ChevronLeft size={36} />
          </button>

          {/* Image */}
          <div className="max-w-xl w-full px-16" onClick={e => e.stopPropagation()}>
            <img
              src={currentItem.url}
              alt={currentItem.caption ?? currentItem.source ?? ''}
              className="w-full rounded-2xl object-contain max-h-[72vh] shadow-2xl"
            />
            {(currentItem.caption || currentItem.source) && (
              <p className="text-white/80 text-sm text-center mt-3">
                {currentItem.caption ?? currentItem.source}
              </p>
            )}
            {currentItem.date && (
              <p className="text-white/50 text-xs text-center mt-1">{currentItem.date}</p>
            )}
          </div>

          {/* Next */}
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white disabled:opacity-20 transition-colors z-10 p-2"
            disabled={lightbox.idx === lightbox.items.length - 1}
            onClick={e => { e.stopPropagation(); setLightbox(l => l ? { ...l, idx: Math.min(l.items.length - 1, l.idx + 1) } : null) }}
          >
            <ChevronRight size={36} />
          </button>

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-xs bg-black/30 px-3 py-1 rounded-full">
            {lightbox.idx + 1} / {lightbox.items.length}
          </div>
        </div>
      )}
    </>
  )
}
