'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Camera, Upload, Loader2, X, CheckCircle2 } from 'lucide-react'

export default function PortfolioFotoPage({ params }: { params: { childId: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [shared, setShared] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Nur Bilder erlaubt'); return }
    if (f.size > 10 * 1024 * 1024) { setError('Max. 10 MB'); return }
    setFile(f); setError('')
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true); setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Nicht eingeloggt'); setUploading(false); return }

    // Upload zu Supabase Storage (bucket: portfolio)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${siteId}/${params.childId}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('portfolio')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadErr) {
      setError(`Upload-Fehler: ${uploadErr.message}`)
      setUploading(false); return
    }

    // Eintrag in DB
    const { error: dbErr } = await (supabase as any)
      .from('portfolio_photos')
      .insert({
        site_id: siteId,
        child_id: params.childId,
        author_id: user.id,
        storage_path: path,
        caption: caption.trim() || null,
        is_shared_with_parents: shared,
        taken_at: new Date().toISOString(),
      })

    setUploading(false)
    if (dbErr) { setError(dbErr.message); return }
    setDone(true)
    setTimeout(() => router.push(`/portfolio/${params.childId}`), 1500)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <CheckCircle2 size={56} className="text-emerald-500" />
        <p className="text-lg font-bold text-gray-900">Foto hochgeladen!</p>
        <p className="text-sm text-gray-400">Weiterleitung...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.back()} className="text-xs text-brand-600 mb-1 block">← Portfolio</button>
        <h1 className="text-2xl font-bold text-gray-900">Foto hinzufügen</h1>
      </div>

      {/* Drop-Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !preview && fileRef.current?.click()}
        className={`relative rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
          preview ? 'border-transparent' : 'border-gray-300 hover:border-brand-400 bg-gray-50 hover:bg-brand-50/30'
        }`}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Vorschau" className="w-full rounded-3xl max-h-80 object-cover" />
            <button
              onClick={e => { e.stopPropagation(); setPreview(null); setFile(null) }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center">
              <Camera size={24} className="text-brand-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">Foto auswählen oder hier ablegen</p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, HEIC · max. 10 MB</p>
            </div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* Bildunterschrift */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bildunterschrift</label>
        <input value={caption} onChange={e => setCaption(e.target.value)}
          placeholder="z.B. ‚Beim Basteln mit Naturmaterialien'"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      <label className="flex items-center gap-3 cursor-pointer card p-4">
        <input type="checkbox" checked={shared} onChange={e => setShared(e.target.checked)}
          className="w-5 h-5 rounded-lg accent-brand-600" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Für Eltern sichtbar</p>
          <p className="text-xs text-gray-400">Eltern sehen dieses Foto im Kinderprofil</p>
        </div>
      </label>

      {error && <p className="text-sm text-red-500 px-1">{error}</p>}

      <button onClick={handleUpload} disabled={!file || uploading}
        className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
        {uploading ? 'Wird hochgeladen...' : 'Foto hochladen'}
      </button>
    </div>
  )
}
