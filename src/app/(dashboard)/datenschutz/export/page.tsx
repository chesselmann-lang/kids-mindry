import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import DsgvoExportButton from './export-button'
import DeletionRequestButton from './deletion-request-button'
import AiDsgvo from './ai-dsgvo'

export const metadata = { title: 'Datenschutz & Datenexport' }

export default async function DsgvoExportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const isParent = (profile as any)?.role === 'parent'

  // Check for existing pending deletion request
  const { data: existingRequest } = await (supabase as any)
    .from('deletion_requests')
    .select('id, status, created_at, scheduled_deletion_at')
    .eq('user_id', user.id)
    .in('status', ['pending', 'approved'])
    .maybeSingle()

  // Count data points
  let childCount = 0
  let attendanceCount = 0
  let reportCount = 0

  if (isParent) {
    const { data: guardianships } = await supabase
      .from('guardians')
      .select('child_id')
      .eq('user_id', user.id)
    const childIds = (guardianships ?? []).map((g: any) => g.child_id)
    childCount = childIds.length

    if (childIds.length > 0) {
      const [att, rpts] = await Promise.all([
        supabase.from('attendance').select('id', { count: 'exact', head: true }).in('child_id', childIds),
        supabase.from('daily_reports').select('id', { count: 'exact', head: true }).in('child_id', childIds),
      ])
      attendanceCount = att.count ?? 0
      reportCount = rpts.count ?? 0
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/profil" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Datenschutz</h1>
          <p className="text-sm text-gray-400">Ihre Daten & DSGVO-Rechte</p>
        </div>
      </div>

      <AiDsgvo />

      {/* Info card */}
      <div className="card p-4 bg-brand-50 border-none">
        <div className="flex gap-3">
          <Shield size={20} className="text-brand-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-brand-900">Ihre Rechte nach DSGVO</p>
            <p className="text-xs text-brand-700 mt-1">
              Art. 15: Auskunftsrecht · Art. 17: Recht auf Löschung · Art. 20: Datenübertragbarkeit
            </p>
          </div>
        </div>
      </div>

      {/* Stored data overview */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Gespeicherte Daten</p>
        <div className="space-y-2">
          {[
            { label: 'Profildaten', detail: 'Name, E-Mail, Telefon', count: '1 Datensatz' },
            ...(isParent ? [
              { label: 'Kinder', detail: 'Stammdaten verknüpfter Kinder', count: `${childCount} ${childCount === 1 ? 'Kind' : 'Kinder'}` },
              { label: 'Anwesenheitseinträge', detail: 'Kommen/Gehen-Protokolle', count: `${attendanceCount} Einträge` },
              { label: 'Tagesberichte', detail: 'Tagesrückmeldungen der Erzieher', count: `${reportCount} Berichte` },
            ] : []),
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.detail}</p>
              </div>
              <span className="text-xs text-gray-500 font-medium">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Daten exportieren</p>
        <p className="text-xs text-gray-500 mb-3">
          Exportieren Sie alle Ihre gespeicherten Daten als JSON-Datei (Art. 20 DSGVO).
        </p>
        <DsgvoExportButton />
      </div>

      {/* Deletion request */}
      <div className="card p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Datenlöschung beantragen</p>
            <p className="text-xs text-gray-500 mt-1">
              Gemäß Art. 17 DSGVO können Sie die Löschung aller Ihrer personenbezogenen Daten beantragen.
              Ihr Antrag wird innerhalb von 30 Tagen bearbeitet.
            </p>
          </div>
        </div>

        {existingRequest ? (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-xs text-amber-800">
            <CheckCircle2 size={14} className="text-amber-600" />
            <span>
              Ihr Löschantrag vom {new Date(existingRequest.created_at).toLocaleDateString('de-DE')} ist eingegangen
              und wird bearbeitet.
            </span>
          </div>
        ) : (
          <DeletionRequestButton />
        )}
      </div>
    </div>
  )
}
