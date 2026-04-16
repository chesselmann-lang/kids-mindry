import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FolderOpen, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Album, MediaAsset } from '@/types/database'
import AlbumGrid from './album-grid'
import AiGalerie from './ai-galerie'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: album } = await supabase.from('albums').select('title').eq('id', params.id).single()
  return { title: album?.title ?? 'Album' }
}

export default async function AlbumDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: album } = await supabase
    .from('albums')
    .select('*')
    .eq('id', params.id)
    .eq('site_id', siteId)
    .single()

  if (!album) return notFound()

  const { data: photos } = await supabase
    .from('media_assets')
    .select('id, url, thumbnail_url, caption, created_at')
    .eq('album_id', params.id)
    .order('created_at', { ascending: true })

  const photoList = (photos ?? []) as Array<{
    id: string
    url: string
    thumbnail_url: string | null
    caption: string | null
    created_at: string
  }>

  const a = album as Album
  const created = format(new Date(a.created_at), 'd. MMMM yyyy', { locale: de })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/galerie"
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{a.title}</h1>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <span>{created}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ImageIcon size={12} />
              {photoList.length} {photoList.length === 1 ? 'Foto' : 'Fotos'}
            </span>
          </p>
        </div>
      </div>

      {/* Description */}
      {a.description && (
        <p className="text-sm text-gray-600">{a.description}</p>
      )}

      <AiGalerie albumId={params.id} />

      {/* Photo grid */}
      <AlbumGrid photos={photoList} />
    </div>
  )
}
