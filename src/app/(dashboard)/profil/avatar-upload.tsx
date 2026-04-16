'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, User } from 'lucide-react'
import Image from 'next/image'

interface Props {
  userId: string
  currentAvatarUrl: string | null
  fullName: string
}

export default function AvatarUpload({ userId, currentAvatarUrl, fullName }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Maximale Dateigröße: 5 MB')
      return
    }

    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`

    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
    if (error) {
      console.error(error)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)
    const finalUrl = publicUrl + `?t=${Date.now()}`

    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId)
    setAvatarUrl(finalUrl)
    setUploading(false)
  }

  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {avatarUrl ? (
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white shadow-md">
            <Image src={avatarUrl} alt={fullName} width={96} height={96} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center ring-4 ring-white shadow-md">
            <span className="text-2xl font-bold text-brand-600">{initials}</span>
          </div>
        )}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-500 shadow flex items-center justify-center hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          {uploading
            ? <Loader2 size={14} className="text-white animate-spin" />
            : <Camera size={14} className="text-white" />}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      <p className="text-xs text-gray-400">Tippe auf die Kamera, um ein Foto hochzuladen</p>
    </div>
  )
}
