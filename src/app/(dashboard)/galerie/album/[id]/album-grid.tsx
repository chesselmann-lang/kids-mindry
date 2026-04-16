'use client'

import { useState } from 'react'
import PhotoLightbox from './photo-lightbox'

interface Photo {
  id: string
  url: string
  thumbnail_url: string | null
  caption: string | null
  created_at: string
}

interface Props {
  photos: Photo[]
}

export default function AlbumGrid({ photos }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (photos.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-5xl mb-3">📷</div>
        <p className="text-gray-500 text-sm">Dieses Album enthält noch keine Fotos</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => setLightboxIndex(index)}
            className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnail_url ?? photo.url}
              alt={photo.caption ?? 'Foto'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {photo.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs truncate">{photo.caption}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
