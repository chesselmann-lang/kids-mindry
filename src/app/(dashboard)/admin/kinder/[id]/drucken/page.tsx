import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import PrintButton from './print-button'

export const metadata = { title: 'Kind-Profil Drucken' }

export default async function DruckenPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const { data: child } = await supabase
    .from('children')
    .select('*, groups(name, color)')
    .eq('id', params.id)
    .single()
  if (!child) notFound()

  const { data: guardians } = await supabase
    .from('guardians')
    .select('full_name, relationship, phone, email, is_primary, can_pickup, consent_photos')
    .eq('child_id', child.id)

  const { data: site } = await supabase
    .from('sites')
    .select('name, phone, email, address')
    .eq('id', process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!)
    .single()

  const age = child.date_of_birth
    ? Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  return (
    <div className="space-y-5">
      {/* Screen controls */}
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/kinder/${child.id}`} className="flex items-center gap-2 p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors text-sm text-gray-600">
          <ArrowLeft size={18} /> Zurück
        </Link>
        <PrintButton />
      </div>

      {/* Printable profile */}
      <div id="print-area" className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{child.first_name} {child.last_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Kinderprofil · {(site as any)?.name ?? 'KitaHub'}
            </p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Erstellt: {format(new Date(), 'd. MMMM yyyy', { locale: de })}</p>
            {(site as any)?.name && <p className="font-medium text-gray-600 text-sm mt-0.5">{(site as any).name}</p>}
          </div>
        </div>

        {/* Stammdaten */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Stammdaten</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Vorname</p>
              <p className="font-semibold text-gray-900">{child.first_name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Nachname</p>
              <p className="font-semibold text-gray-900">{child.last_name}</p>
            </div>
            {child.date_of_birth && (
              <>
                <div>
                  <p className="text-gray-500 text-xs">Geburtsdatum</p>
                  <p className="font-semibold text-gray-900">
                    {format(new Date(child.date_of_birth), 'd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Alter</p>
                  <p className="font-semibold text-gray-900">{age} Jahre</p>
                </div>
              </>
            )}
            <div>
              <p className="text-gray-500 text-xs">Gruppe</p>
              <p className="font-semibold text-gray-900">{(child as any).groups?.name ?? '–'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Status</p>
              <p className="font-semibold text-gray-900">{child.status === 'active' ? 'Aktiv' : child.status}</p>
            </div>
          </div>
        </section>

        {/* Betreuungszeiten */}
        {(child.care_days?.length > 0 || child.care_start_time) && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Betreuungszeiten</h2>
            <div className="text-sm">
              {child.care_days?.length > 0 && (
                <p><span className="text-gray-500">Tage:</span> <span className="font-semibold">{child.care_days.join(', ')}</span></p>
              )}
              {child.care_start_time && child.care_end_time && (
                <p className="mt-1">
                  <span className="text-gray-500">Zeiten:</span>
                  <span className="font-semibold ml-1">{child.care_start_time.slice(0,5)} – {child.care_end_time.slice(0,5)} Uhr</span>
                </p>
              )}
            </div>
          </section>
        )}

        {/* Gesundheit */}
        {(child.allergies?.length > 0 || child.medical_notes || child.emergency_contact_name || child.doctor_name) && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Gesundheit & Notfall</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {child.emergency_contact_name && (
                <div>
                  <p className="text-gray-500 text-xs">Notfallkontakt</p>
                  <p className="font-semibold text-gray-900">{child.emergency_contact_name}</p>
                  {child.emergency_contact_phone && <p className="text-gray-600">{child.emergency_contact_phone}</p>}
                </div>
              )}
              {child.doctor_name && (
                <div>
                  <p className="text-gray-500 text-xs">Kinderarzt</p>
                  <p className="font-semibold text-gray-900">{child.doctor_name}</p>
                  {child.doctor_phone && <p className="text-gray-600">{child.doctor_phone}</p>}
                </div>
              )}
              {child.allergies?.length > 0 && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Allergien</p>
                  <p className="font-semibold text-gray-900">{Array.isArray(child.allergies) ? child.allergies.join(', ') : child.allergies}</p>
                </div>
              )}
              {child.medical_notes && (
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs">Medizinische Hinweise</p>
                  <p className="font-semibold text-gray-900">{child.medical_notes}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Erziehungsberechtigte */}
        {guardians && guardians.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Erziehungsberechtigte</h2>
            <div className="space-y-3">
              {(guardians as any[]).map((g, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-gray-900">{g.full_name}</p>
                    <div className="flex gap-1">
                      {g.is_primary && <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-medium">Hauptkontakt</span>}
                      {g.can_pickup && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Abholung</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{g.relationship}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-600">
                    {g.phone && <span>📞 {g.phone}</span>}
                    {g.email && <span>✉ {g.email}</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Foto-Einwilligung: {g.consent_photos ? '✓ Erteilt' : '✗ Nicht erteilt'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 text-xs text-gray-400 flex justify-between">
          <span>KitaHub · Vertrauliches Dokument</span>
          <span>{format(new Date(), 'dd.MM.yyyy HH:mm')}</span>
        </div>
      </div>
    </div>
  )
}
