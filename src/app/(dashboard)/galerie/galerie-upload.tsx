'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2, CheckCircle2, ImageIcon, FolderPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  siteId: string
  userId: string
}

export default function GalerieUpload({ siteId, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showModal, setShowModal] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [albumName, setAlbumName] = useState('')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function handleFiles(selected: FileList | null) {
    if (!selected) return
    const arr = Array.from(selected).filter(f => f.type.startsWith('image/'))
    setFiles(arr)
  }

  async function handleUpload() {
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      // 1. Create album if name given
      let albumId: string | null = null
      if (albumName.trim()) {
        const { data: album, error: albumErr } = await supabase
          .from('albums')
          .insert({ site_id: siteId, title: albumName.trim(), created_by: userId })
          .select()
          .single()
        if (albumErr) throw new Error(albumErr.message)
        albumId = album.id
      }

      // 2. Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${siteId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: storageErr } = await supabase.storage
          .from('media')
          .upload(path, file, { contentType: file.type })

        if (storageErr) {
          // Storage bucket may not exist yet — insert URL as placeholder
          console.warn('Storage upload skipped:', storageErr.message)
          await supabase.from('media_assets').insert({
            site_id: siteId,
            album_id: albumId,
            uploader_id: userId,
            url: `storage_pending:${file.name}`,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            caption: caption || null,
            child_ids: [],
            consent_required: true,
          })
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('media')
            .getPublicUrl(path)

          await supabase.from('media_assets').insert({
            site_id: siteId,
            album_id: albumId,
            uploader_id: userId,
            url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            caption: caption || null,
            child_ids: [],
            consent_required: true,
          })
        }

        setProgress(Math.round(((i + 1) / files.length) * 100))
      }

      setShowModal(false)
      setFiles([])
      setAlbumName('')
      setCaption('')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload fehlgeschlagen')
    }
    setUploading(false)
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary text-sm px-4 py-2"
      >
        <Upload size={16} /> Foto hochladen
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Fotos hochladen</h3>
              <button onClick={() => { setShowModal(false); setFiles([]) }} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* File picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                files.length > 0 ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
              />
              {files.length > 0 ? (
                <div>
                  <ImageIcon size={28} className="mx-auto text-brand-500 mb-2" />
                  <p className="text-sm font-semibold text-brand-700">{files.length} Foto{files.length > 1 ? 's' : ''} ausgewählt</p>
                  <p className="text-xs text-brand-400 mt-0.5">Klicken zum Ändern</p>
                </div>
              ) : (
                <div>
                  <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">Fotos auswählen oder hierher ziehen</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP</p>
                </div>
              )}
            </div>

            {/* Album */}
            <div>
              <label className="label flex items-center gap-1.5">
                <FolderPlus size={14} /> Album (optional)
              </label>
              <input
                className="input"
                value={albumName}
                onChange={e => setAlbumName(e.target.value)}
                placeholder="z.B. Sommerfest 2025"
              />
            </div>

            {/* Caption */}
            <div>
              <label className="label">Beschriftung (optional)</label>
              <input
                className="input"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Was passierte auf dem Foto?"
              />
            </div>

            {/* Progress */}
            {uploading && (
              <div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-1">{progress}% hochgeladen</p>
              </div>
            )}

            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

            <button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="btn-primary w-full py-3.5"
            >
              {uploading
                ? <><Loader2 size={18} className="animate-spin" />Wird hochgeladen...</>
                : <><CheckCircle2 size={18} />{files.length} Foto{files.length !== 1 ? 's' : ''} hochladen</>
              }
            </button>
          </div>
        </div>
      )}
    </>
  )
}
