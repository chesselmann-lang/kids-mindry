import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ClipboardList, Mail, Phone, Calendar, Clock, Baby, CheckCircle2, XCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import AnmeldungActions from './anmeldung-actions'
import AiAnmeldungsAnalyse from './ai-anmeldungs-analyse'

export const metadata = { title: 'Online-Anmeldungen' }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.FC<any> }> = {
  neu:            { label: 'Neu',           color: 'text-brand-700', bg: 'bg-brand-100',  icon: AlertCircle },
  in_bearbeitung: { label: 'In Bearbeitung',color: 'text-amber-700', bg: 'bg-amber-100',  icon: Loader2 },
  aufgenommen:    { label: 'Aufgenommen',   color: 'text-green-700', bg: 'bg-green-100',  icon: CheckCircle2 },
  abgelehnt:      { label: 'Abgelehnt',     color: 'text-red-700',   bg: 'bg-red-100',    icon: XCircle },
  wartend:        { label: 'Wartend',       color: 'text-purple-700',bg: 'bg-purple-100', icon: Clock },
}

export default async function AnmeldungenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; id?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const sp = await searchParams
  const filterStatus = sp.status ?? 'all'
  const selectedId = sp.id

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Load counts per status
  const { data: allAnmeldungen } = await supabase
    .from('online_anmeldungen')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  const list = (allAnmeldungen ?? []) as any[]

  const counts = {
    all: list.length,
    neu: list.filter(a => a.status === 'neu').length,
    in_bearbeitung: list.filter(a => a.status === 'in_bearbeitung').length,
    aufgenommen: list.filter(a => a.status === 'aufgenommen').length,
    abgelehnt: list.filter(a => a.status === 'abgelehnt').length,
    wartend: list.filter(a => a.status === 'wartend').length,
  }

  const filtered = filterStatus === 'all' ? list : list.filter(a => a.status === filterStatus)
  const selected = selectedId ? list.find(a => a.id === selectedId) : null

  const tabs = [
    { key: 'all',            label: 'Alle',         count: counts.all },
    { key: 'neu',            label: 'Neu',          count: counts.neu },
    { key: 'in_bearbeitung', label: 'In Bearb.',    count: counts.in_bearbeitung },
    { key: 'wartend',        label: 'Wartend',      count: counts.wartend },
    { key: 'aufgenommen',    label: 'Aufgenommen',  count: counts.aufgenommen },
    { key: 'abgelehnt',      label: 'Abgelehnt',    count: counts.abgelehnt },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Online-Anmeldungen</h1>
          <p className="text-sm text-gray-400">Eingegangen über das öffentliche Anmeldeformular</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <ClipboardList size={20} className="text-brand-600" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand-600">{counts.neu}</p>
          <p className="text-xs text-gray-500 mt-0.5">Neue Anfragen</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{counts.aufgenommen}</p>
          <p className="text-xs text-gray-500 mt-0.5">Aufgenommen</p>
        </div>
      </div>

      {/* External link hint */}
      <div className="card p-4 flex items-center gap-3 bg-brand-50 border border-brand-100">
        <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
          <Baby size={16} className="text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-800">Öffentliches Anmeldeformular</p>
          <p className="text-xs text-brand-600 truncate">{process.env.NEXT_PUBLIC_APP_URL ?? 'kids.mindry.de'}/anmelden</p>
        </div>
        <a
          href="/anmelden"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-brand-600 font-medium flex-shrink-0 hover:underline"
        >
          Öffnen →
        </a>
      </div>

      <AiAnmeldungsAnalyse />

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {tabs.map(tab => (
          <Link
            key={tab.key}
            href={`/admin/anmeldungen?status=${tab.key}`}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterStatus === tab.key
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                filterStatus === tab.key ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
              }`}>{tab.count}</span>
            )}
          </Link>
        ))}
      </div>

      {/* Detail view */}
      {selected && (
        <div className="card p-5 space-y-4 border border-brand-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">{selected.kind_vorname} {selected.kind_nachname}</h2>
              <p className="text-xs text-gray-500">Eingegangen {format(parseISO(selected.created_at), 'd. MMM yyyy, HH:mm', { locale: de })}</p>
            </div>
            <Link href={`/admin/anmeldungen?status=${filterStatus}`} className="text-xs text-gray-400 hover:text-gray-600">Schließen ✕</Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Kind</p>
              <p className="font-medium">{selected.kind_vorname} {selected.kind_nachname}</p>
              {selected.kind_geburtsdatum && (
                <p className="text-xs text-gray-500">geb. {format(parseISO(selected.kind_geburtsdatum), 'd. MMM yyyy', { locale: de })}</p>
              )}
              <p className="text-xs text-gray-500">{selected.betreuungsart}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Wunsch</p>
              {selected.wunsch_datum && <p className="font-medium">Ab {format(parseISO(selected.wunsch_datum), 'MMMM yyyy', { locale: de })}</p>}
              <p className="text-xs text-gray-500">{selected.betreuungszeit}</p>
              {selected.geschwisterkind && <p className="text-xs text-green-600 font-medium">Geschwisterkind ✓</p>}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Elternteil</p>
              <p className="font-medium">{selected.eltern_name}</p>
              <a href={`mailto:${selected.email}`} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                <Mail size={10} />{selected.email}
              </a>
              {selected.telefon && (
                <a href={`tel:${selected.telefon}`} className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                  <Phone size={10} />{selected.telefon}
                </a>
              )}
            </div>
            {selected.adresse && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Adresse</p>
                <p className="text-xs text-gray-600">{selected.adresse}</p>
              </div>
            )}
          </div>

          {selected.anmerkungen && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Anmerkungen</p>
              <p className="text-sm text-gray-700">{selected.anmerkungen}</p>
            </div>
          )}

          <AnmeldungActions
            anmeldungId={selected.id}
            currentStatus={selected.status}
            currentNote={selected.internal_note ?? ''}
            staffId={user.id}
          />
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <ClipboardList size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Keine Anmeldungen</p>
          <p className="text-xs text-gray-400 mt-1">
            {filterStatus === 'all'
              ? 'Noch keine Online-Anmeldungen eingegangen.'
              : `Keine Anmeldungen mit Status „${STATUS_CONFIG[filterStatus]?.label ?? filterStatus}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a: any) => {
            const cfg = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.neu
            const Icon = cfg.icon
            const isSelected = a.id === selectedId
            return (
              <Link
                key={a.id}
                href={`/admin/anmeldungen?status=${filterStatus}&id=${a.id}`}
                className={`card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all ${isSelected ? 'ring-2 ring-brand-400' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Baby size={18} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {a.kind_vorname} {a.kind_nachname}
                    </p>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
                      <Icon size={9} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{a.eltern_name} · {a.email}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-gray-400">{a.betreuungsart}</span>
                    {a.wunsch_datum && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Calendar size={9} />
                        Ab {format(parseISO(a.wunsch_datum), 'MMM yyyy', { locale: de })}
                      </span>
                    )}
                    {a.geschwisterkind && <span className="text-[10px] text-green-600">Geschwister</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] text-gray-400">{format(parseISO(a.created_at), 'd. MMM', { locale: de })}</p>
                  <ChevronRight size={14} className="text-gray-300 mt-1 ml-auto" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
