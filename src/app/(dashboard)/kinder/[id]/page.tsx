import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, AlertTriangle, FileText, UserCheck, Users, UserRoundCheck, HeartPulse, Printer } from 'lucide-react'
import ElternSchreibenButton from './eltern-schreiben-button'
import KindSnapshot from './kind-snapshot'
import AiJahresrueckblick from './ai-jahresrueckblick'
import AiGrundschulBericht from './ai-grundschul-bericht'

export default async function KindDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  const isAdmin = ['admin', 'group_lead'].includes(profile?.role ?? '')
  if (!isStaff) redirect('/feed')

  const { data: child } = await supabase.from('children').select('*').eq('id', params.id).single()
  if (!child) return notFound()

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  const [{ data: guardians }, { data: group }, { data: todayAtt }, { data: recentReports }] = await Promise.all([
    supabase.from('guardians').select('*').eq('child_id', child.id),
    child.group_id ? supabase.from('groups').select('*').eq('id', child.group_id).single() : Promise.resolve({ data: null }),
    supabase.from('attendance').select('*').eq('child_id', child.id).eq('date', today).maybeSingle(),
    supabase.from('daily_reports').select('*').eq('child_id', child.id).order('report_date', { ascending: false }).limit(5),
  ])

  const age = child.date_of_birth
    ? Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  const moodEmoji: Record<string, string> = {
    great: '😄', good: '🙂', okay: '😐', sad: '😢', sick: '🤒',
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/kinder" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: (group as any)?.color ?? '#3B6CE8' }}
        >
          {child.first_name[0]}{child.last_name[0]}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{child.first_name} {child.last_name}</h1>
          <p className="text-sm text-gray-400">
            {age !== null ? `${age} Jahre` : ''}
            {group ? ` · ${(group as any).name}` : ''}
          </p>
        </div>
      </div>

      {/* Heutige Anwesenheit */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-brand-600" />
            <span className="font-semibold text-sm text-gray-900">Heute</span>
          </div>
          {todayAtt ? (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              todayAtt.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {todayAtt.status === 'present'
                ? `✅ Anwesend${todayAtt.check_in_at ? ' seit ' + new Date(todayAtt.check_in_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : ''}`
                : `❌ ${todayAtt.status === 'absent_sick' ? 'Krank' : todayAtt.status === 'absent_vacation' ? 'Urlaub' : 'Abwesend'}`
              }
            </span>
          ) : (
            <span className="text-xs text-gray-400">Noch nicht erfasst</span>
          )}
        </div>
      </div>

      {/* KI-Snapshot */}
      <KindSnapshot childId={child.id} childName={child.first_name} />
      <AiJahresrueckblick childId={child.id} />
      <AiGrundschulBericht childId={child.id} />

      {/* Admin-Schnelllinks */}
      {isAdmin && (
        <div className="flex gap-2">
          <Link
            href={`/admin/kinder/${child.id}/gesundheit`}
            className="flex-1 card p-3 flex items-center gap-2 hover:shadow-card-hover transition-shadow"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
              <HeartPulse size={15} className="text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Gesundheit</p>
              <p className="text-[10px] text-gray-400">Notfallkontakt & Arzt</p>
            </div>
          </Link>
          <Link
            href={`/admin/kinder/${child.id}`}
            className="flex-1 card p-3 flex items-center gap-2 hover:shadow-card-hover transition-shadow"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <UserCheck size={15} className="text-brand-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Stammdaten</p>
              <p className="text-[10px] text-gray-400">Profil bearbeiten</p>
            </div>
          </Link>
          <Link
            href={`/admin/kinder/${child.id}/drucken`}
            className="flex-1 card p-3 flex items-center gap-2 hover:shadow-card-hover transition-shadow"
          >
            <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Printer size={15} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">Drucken</p>
              <p className="text-[10px] text-gray-400">Profil als PDF</p>
            </div>
          </Link>
        </div>
      )}

      {/* Allergien / Medizinische Hinweise */}
      {(child.allergies?.length || child.medical_notes) && (
        <div className="card p-4 border-l-4 border-amber-400">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="font-semibold text-sm text-amber-700">Wichtige Hinweise</span>
          </div>
          {child.allergies && child.allergies.length > 0 && (
            <p className="text-sm text-gray-700">
              <strong>Allergien:</strong> {child.allergies.join(', ')}
            </p>
          )}
          {child.medical_notes && (
            <p className="text-sm text-gray-700 mt-1">
              <strong>Medizinisch:</strong> {child.medical_notes}
            </p>
          )}
        </div>
      )}

      {/* Erziehungsberechtigte */}
      {(guardians && guardians.length > 0 || isAdmin) && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-900">Erziehungsberechtigte</h2>
            <div className="flex items-center gap-3">
              {isStaff && guardians && (
                <ElternSchreibenButton
                  currentUserId={user.id}
                  guardians={(guardians as any[]).map(g => ({
                    user_id: g.user_id ?? null,
                    full_name: g.full_name,
                    relationship: g.relationship,
                  }))}
                  siteId={process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!}
                />
              )}
              {isAdmin && (
                <>
                  <Link href={`/admin/kinder/${child.id}/abholen`} className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                    <UserRoundCheck size={12} /> Abholen
                  </Link>
                  <Link href={`/admin/kinder/${child.id}/guardians`} className="flex items-center gap-1 text-xs text-brand-600 font-medium">
                    <Users size={12} /> Verwalten
                  </Link>
                </>
              )}
            </div>
          </div>
          {guardians && guardians.length === 0 && isAdmin && (
            <p className="text-xs text-gray-400">Noch keine Erziehungsberechtigten verknüpft</p>
          )}
          {(guardians as any[] ?? []).map(g => (
            <div key={g.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{g.full_name}</p>
                <p className="text-xs text-gray-400">{g.relationship}{g.is_primary ? ' · Hauptkontakt' : ''}{g.can_pickup ? ' · Abholberechtigt' : ''}</p>
              </div>
              {g.phone && (
                <a href={`tel:${g.phone}`} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <Phone size={16} className="text-brand-600" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Letzte Tagesberichte */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
            <FileText size={14} className="text-gray-400" />
            Letzte Tagesberichte
          </h2>
          <Link href={`/tagesberichte/neu?child=${child.id}`} className="text-xs text-brand-600 font-medium">
            + Neuer Bericht
          </Link>
        </div>
        {!recentReports || recentReports.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-sm text-gray-400">Noch keine Berichte für dieses Kind</p>
            <Link href={`/tagesberichte/neu?child=${child.id}`} className="btn-primary mt-3 inline-flex text-xs">
              Ersten Bericht erstellen
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {(recentReports as any[]).map(r => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">
                    {new Date(r.report_date).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  {r.mood && <span className="text-lg">{moodEmoji[r.mood] ?? '😐'}</span>}
                </div>
                {r.notes && <p className="text-sm text-gray-700">{r.notes}</p>}
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  {r.sleep_minutes && <span>😴 {Math.floor(r.sleep_minutes / 60)}h {r.sleep_minutes % 60}min</span>}
                  {r.activities && <span>🎨 {r.activities}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
