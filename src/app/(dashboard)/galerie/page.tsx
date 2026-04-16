import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Lock, FolderOpen, Filter } from 'lucide-react'
import Image from 'next/image'
import type { Album, MediaAsset } from '@/types/database'
import Link from 'next/link'
import GalerieUpload from './galerie-upload'
import AiGalerieAnalyse from './ai-galerie-analyse'

export const metadata = { title: 'Galerie' }

export default async function GaleriePage({
  searchParams,
}: {
  searchParams: { group?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const selectedGroup = searchParams.group ?? ''

  // --- PARENT: resolve accessible group IDs + consent check ---
  let parentGroupIds: string[] = []
  let consentGiven = true

  if (!isStaff) {
    // Get guardians for this user (with their children's group)
    const { data: guardians } = await supabase
      .from('guardians')
      .select('consent_photos, children(group_id)')
      .eq('user_id', user.id)

    const gList = (guardians ?? []) as any[]

    // Check if at least one guardian record has consent
    consentGiven = gList.some(g => g.consent_photos === true)

    // Collect group_ids from children
    parentGroupIds = gList
      .flatMap(g => (g.children ? [g.children.group_id] : []))
      .filter(Boolean) as string[]
  }

  // --- STAFF: load groups for filter ---
  let groups: { id: string; name: string; color: string }[] = []
  if (isStaff) {
    const { data: groupData } = await supabase
      .from('groups')
      .select('id, name, color')
      .eq('site_id', siteId)
      .order('name')
    groups = (groupData ?? []) as any[]
  }

  // --- Build album query ---
  let albumQuery = supabase
    .from('albums')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!isStaff && parentGroupIds.length > 0) {
    albumQuery = albumQuery.in('group_id', parentGroupIds)
  } else if (!isStaff) {
    // Parent with no group → show nothing (will be handled by empty state)
    albumQuery = albumQuery.eq('id', 'no-match')
  }

  if (isStaff && selectedGroup) {
    albumQuery = albumQuery.eq('group_id', selectedGroup)
  }

  const { data: albums } = await albumQuery

  // --- Build recent photos query ---
  let photoQuery = supabase
    .from('media_assets')
    .select('*, albums!inner(group_id, site_id)')
    .eq('albums.site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(24)

  if (!isStaff && parentGroupIds.length > 0) {
    photoQuery = photoQuery.in('albums.group_id', parentGroupIds)
  } else if (!isStaff) {
    photoQuery = photoQuery.eq('id', 'no-match')
  }

  if (isStaff && selectedGroup) {
    photoQuery = photoQuery.eq('albums.group_id', selectedGroup)
  }

  const { data: recentPhotos } = await photoQuery

  const hasContent = (albums && albums.length > 0) || (recentPhotos && recentPhotos.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galerie</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fotos aus dem Kita-Alltag</p>
        </div>
        {isStaff && <GalerieUpload siteId={siteId} userId={user.id} />}
      </div>

      {isStaff && <AiGalerieAnalyse />}

      {/* Privacy notice for parents */}
      {!isStaff && (
        <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl">
          <Lock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Fotos werden nur mit Ihrer ausdrücklichen Einwilligung geteilt.
            Alle Bilder bleiben innerhalb der Kita-App.
          </p>
        </div>
      )}

      {/* Consent gate for parents */}
      {!isStaff && !consentGiven && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p className="font-semibold text-gray-700 text-sm">Foto-Einwilligung ausstehend</p>
          <p className="text-gray-400 text-xs mt-1 mb-4">
            Bitte erteilen Sie Ihre Einwilligung, um Fotos Ihres Kindes zu sehen.
          </p>
          <Link href="/einwilligungen" className="btn-primary text-sm inline-flex">
            Einwilligung verwalten
          </Link>
        </div>
      )}

      {/* Group filter for staff */}
      {isStaff && groups.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          <Link
            href="/galerie"
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
              !selectedGroup ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alle
          </Link>
          {groups.map(g => (
            <Link
              key={g.id}
              href={`/galerie?group=${g.id}`}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                selectedGroup === g.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedGroup === g.id ? { backgroundColor: g.color } : {}}
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}

      {/* Only render content if consent given (or staff) */}
      {(isStaff || consentGiven) && (
        <>
          {/* Albums */}
          {albums && albums.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Alben</h2>
              <div className="grid grid-cols-2 gap-3">
                {(albums as Album[]).map(album => (
                  <Link key={album.id} href={`/galerie/album/${album.id}`}>
                    <AlbumCard album={album} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent photos */}
          {recentPhotos && recentPhotos.length > 0 ? (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Neueste Fotos</h2>
              <div className="grid grid-cols-3 gap-1.5">
                {(recentPhotos as MediaAsset[]).map(asset => (
                  <PhotoTile key={asset.id} asset={asset} />
                ))}
              </div>
            </div>
          ) : (
            !hasContent && (
              <div className="card p-10 text-center">
                <div className="text-5xl mb-3">📷</div>
                <p className="text-gray-500 text-sm font-medium">Noch keine Fotos vorhanden</p>
                <p className="text-gray-400 text-xs mt-1">
                  {isStaff
                    ? 'Lade Fotos hoch, um sie mit den Eltern zu teilen'
                    : 'Sobald die Erzieher Fotos teilen, erscheinen sie hier'
                  }
                </p>
              </div>
            )
          )}
        </>
      )}
    </div>
  )
}

function AlbumCard({ album }: { album: Album }) {
  const created = format(new Date(album.created_at), 'd. MMM yyyy', { locale: de })
  return (
    <div className="card overflow-hidden group cursor-pointer hover:shadow-card-hover transition-shadow">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {album.cover_url ? (
          <Image src={album.cover_url} alt={album.title} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FolderOpen size={36} className="text-gray-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-gray-900 truncate">{album.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{created}</p>
      </div>
    </div>
  )
}

function PhotoTile({ asset }: { asset: MediaAsset }) {
  const url = asset.thumbnail_url ?? asset.url
  return (
    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative cursor-pointer group">
      {url ? (
        <Image
          src={url}
          alt={asset.caption ?? 'Foto'}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-2xl">📷</div>
      )}
    </div>
  )
}
