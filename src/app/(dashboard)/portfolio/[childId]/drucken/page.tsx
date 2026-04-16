import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PrintButton from './print-button'

const categoryLabels: Record<string, string> = {
  allgemein: 'Allgemein',  sozial: 'Soziale Entwicklung',
  motorik: 'Motorik',      sprache: 'Sprachentwicklung',
  kreativ: 'Kreativität',  kognitiv: 'Kognition',
  emotional: 'Emotional',  natur: 'Natur & Umwelt',
}

const categoryColors: Record<string, string> = {
  allgemein: '#6366f1', sozial: '#ec4899', motorik: '#f59e0b', sprache: '#3b82f6',
  kreativ: '#8b5cf6', kognitiv: '#06b6d4', emotional: '#f97316', natur: '#10b981',
}

export default async function PortfolioDruckenPage({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: child } = await (supabase as any)
    .from('children')
    .select('id, first_name, last_name, date_of_birth, photo_url, groups(name, color)')
    .eq('id', params.childId).eq('site_id', siteId).single()

  if (!child) notFound()

  const { data: site } = await supabase.from('sites').select('name, logo_url').eq('id', siteId).single()

  const { data: entries } = await (supabase as any)
    .from('portfolio_entries')
    .select('*')
    .eq('child_id', params.childId)
    .eq('is_shared_with_parents', true)
    .order('created_at', { ascending: true })

  const { data: photos } = await (supabase as any)
    .from('portfolio_photos')
    .select('*')
    .eq('child_id', params.childId)
    .eq('is_shared_with_parents', true)
    .order('taken_at', { ascending: true })
    .limit(20)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const age = child.date_of_birth
    ? Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  const grouped: Record<string, any[]> = {}
  for (const e of (entries ?? [])) {
    if (!grouped[e.category]) grouped[e.category] = []
    grouped[e.category].push(e)
  }

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-family: 'Georgia', serif; }
          .page-break { page-break-before: always; }
          .avoid-break { page-break-inside: avoid; }
        }
        @page { margin: 20mm; size: A4; }
      `}</style>

      {/* Print-Button (verschwindet beim Drucken) */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Entwicklungsbuch – Druckvorschau</span>
        <PrintButton />
      </div>

      {/* Deckblatt */}
      <div className="max-w-2xl mx-auto p-8 space-y-0 font-serif">
        <div className="text-center py-12 border-b-2 border-gray-200 mb-8">
          {site?.logo_url && (
            <img src={site.logo_url} alt="" className="h-12 mx-auto mb-4 object-contain" />
          )}
          <p className="text-sm text-gray-400 uppercase tracking-widest mb-6">{site?.name}</p>

          {child.photo_url && (
            <img src={child.photo_url} alt=""
              className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-lg" />
          )}

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {child.first_name} {child.last_name}
          </h1>
          {age !== null && (
            <p className="text-gray-500 text-lg">{age} Jahre · {child.groups?.name}</p>
          )}
          {child.date_of_birth && (
            <p className="text-gray-400 text-sm mt-1">
              geboren am {new Date(child.date_of_birth).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Entwicklungsbuch erstellt am {new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Foto-Galerie */}
        {photos && photos.length > 0 && (
          <div className="page-break">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
              📷 Erinnerungsfotos
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(photos as any[]).map((photo: any) => (
                <div key={photo.id} className="avoid-break">
                  <img
                    src={`${supabaseUrl}/storage/v1/object/public/portfolio/${photo.storage_path}`}
                    alt={photo.caption ?? ''}
                    className="w-full h-36 object-cover rounded-lg"
                  />
                  {photo.caption && (
                    <p className="text-xs text-gray-500 mt-1 text-center italic">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Einträge nach Kategorie */}
        {Object.entries(grouped).map(([cat, catEntries]) => (
          <div key={cat} className="page-break pt-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-3 h-8 rounded-full" style={{ backgroundColor: categoryColors[cat] ?? '#6366f1' }} />
              <h2 className="text-2xl font-bold text-gray-800">{categoryLabels[cat] ?? cat}</h2>
            </div>
            <div className="space-y-6">
              {catEntries.map(entry => (
                <div key={entry.id} className="avoid-break pl-6 border-l-2 border-gray-100">
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h3 className="font-bold text-gray-900 text-base">{entry.title}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {new Date(entry.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  {entry.content && (
                    <p className="text-gray-600 text-sm leading-relaxed">{entry.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="pt-12 mt-12 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Dieses Entwicklungsbuch wurde mit KitaHub erstellt.</p>
          <p className="mt-1">Erstellt für {child.first_name} {child.last_name} · {site?.name}</p>
        </div>
      </div>
    </>
  )
}
