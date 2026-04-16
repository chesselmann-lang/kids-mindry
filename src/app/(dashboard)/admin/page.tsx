import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AiAdminUebersicht from './ai-admin-uebersicht'
import {
  Baby, Users, Settings, ChevronRight, UserPlus,
  BarChart3, Shield, ListOrdered, ShieldCheck, FileText,
  FolderOpen, TrendingUp, Utensils, UserX, Pill, AlertTriangle, BookOpen, BarChart2,
  Mail, CalendarDays, UsersRound, Euro, QrCode, Activity, Heart,
  File, Target, Clock, BookMarked, Plane, LayoutGrid,
  GraduationCap, ArrowLeftRight, Clock3, Star,
  RefreshCw, Thermometer, Scale, ShoppingCart, PieChart,
  CalendarRange, MessageSquarePlus, MessageCircle, LifeBuoy, Sparkles, ClipboardList,
} from 'lucide-react'

export const metadata = { title: 'Admin' }

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const isAdmin = ['admin', 'group_lead'].includes(profile?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Stats
  const [{ count: childCount }, { count: userCount }, { count: groupCount }, { count: waitlistCount }, { count: neuAnmeldungenCount }] = await Promise.all([
    supabase.from('children').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    supabase.from('groups').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    supabase.from('children').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'waitlist'),
    supabase.from('online_anmeldungen').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'neu'),
  ])

  const sections = [
    {
      title: 'Kinder verwalten',
      sub: `${childCount ?? 0} aktive Kinder`,
      icon: Baby,
      href: '/admin/kinder',
      color: 'from-brand-100 to-brand-200',
      iconColor: 'text-brand-700',
    },
    {
      title: 'Gruppen',
      sub: `${groupCount ?? 0} Gruppen angelegt`,
      icon: Users,
      href: '/admin/gruppen',
      color: 'from-green-100 to-emerald-200',
      iconColor: 'text-green-700',
    },
    {
      title: 'Nutzer & Einladungen',
      sub: `${userCount ?? 0} registrierte Nutzer`,
      icon: UserPlus,
      href: '/admin/nutzer',
      color: 'from-purple-100 to-violet-200',
      iconColor: 'text-purple-700',
    },
    {
      title: 'Kita-Einstellungen',
      sub: 'Name, Adresse, Kontakt',
      icon: Settings,
      href: '/admin/einstellungen',
      color: 'from-amber-100 to-orange-200',
      iconColor: 'text-amber-700',
    },
    {
      title: 'Warteliste',
      sub: `${waitlistCount ?? 0} ${waitlistCount === 1 ? 'Kind' : 'Kinder'} auf der Warteliste`,
      icon: ListOrdered,
      href: '/admin/warteliste',
      color: 'from-teal-100 to-cyan-200',
      iconColor: 'text-teal-700',
    },
    {
      title: 'Online-Anmeldungen',
      sub: (neuAnmeldungenCount ?? 0) > 0
        ? `${neuAnmeldungenCount} neue Anfrage${neuAnmeldungenCount === 1 ? '' : 'n'} eingegangen`
        : 'Öffentliches Anmeldeformular',
      icon: ClipboardList,
      href: '/admin/anmeldungen',
      color: 'from-brand-100 to-teal-200',
      iconColor: 'text-brand-700',
      badge: (neuAnmeldungenCount ?? 0) > 0 ? neuAnmeldungenCount : undefined,
    },
    {
      title: 'Datenschutz',
      sub: 'Foto-Einwilligungen im Überblick',
      icon: ShieldCheck,
      href: '/admin/datenschutz',
      color: 'from-sky-100 to-blue-200',
      iconColor: 'text-sky-700',
    },
    {
      title: 'Protokolle',
      sub: 'Elternabend-Mitschriften erstellen',
      icon: FileText,
      href: '/admin/protokolle/neu',
      color: 'from-indigo-100 to-blue-200',
      iconColor: 'text-indigo-700',
    },
    {
      title: 'Dokumente',
      sub: 'Formulare & Unterlagen hochladen',
      icon: FolderOpen,
      href: '/admin/dokumente',
      color: 'from-orange-100 to-amber-200',
      iconColor: 'text-orange-700',
    },
    {
      title: 'Statistik',
      sub: 'Anwesenheits-Monatsauswertung',
      icon: TrendingUp,
      href: '/admin/statistik',
      color: 'from-emerald-100 to-green-200',
      iconColor: 'text-emerald-700',
    },
    {
      title: 'Speiseplan',
      sub: 'Wöchentliche Mahlzeiten pflegen',
      icon: Utensils,
      href: '/speiseplan',
      color: 'from-lime-100 to-green-200',
      iconColor: 'text-lime-700',
    },
    {
      title: 'Abwesenheiten',
      sub: 'Krankmeldungen & Urlaubsübersicht',
      icon: UserX,
      href: '/admin/abwesenheiten',
      color: 'from-red-100 to-rose-200',
      iconColor: 'text-red-600',
    },
    {
      title: 'Medikamente',
      sub: 'Medikamentengabe dokumentieren',
      icon: Pill,
      href: '/admin/medikamente',
      color: 'from-purple-100 to-violet-200',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Unfallberichte',
      sub: 'Vorfälle protokollieren',
      icon: AlertTriangle,
      href: '/admin/unfallberichte',
      color: 'from-yellow-100 to-amber-200',
      iconColor: 'text-yellow-700',
    },
    {
      title: 'Beobachtungen',
      sub: 'Entwicklungsnotizen pro Kind',
      icon: BookOpen,
      href: '/admin/beobachtungen',
      color: 'from-teal-100 to-cyan-200',
      iconColor: 'text-teal-700',
    },
    {
      title: 'Statistiken',
      sub: 'Anwesenheit & Auswertungen',
      icon: BarChart2,
      href: '/admin/statistiken',
      color: 'from-indigo-100 to-blue-200',
      iconColor: 'text-indigo-700',
    },
    {
      title: 'Rundschreiben',
      sub: 'Push-Nachrichten an alle Eltern',
      icon: MessageSquarePlus,
      href: '/admin/rundschreiben',
      color: 'from-brand-100 to-indigo-200',
      iconColor: 'text-brand-700',
    },
    {
      title: 'Newsletter',
      sub: 'Eltern informieren & benachrichtigen',
      icon: Mail,
      href: '/admin/newsletter',
      color: 'from-sky-100 to-blue-200',
      iconColor: 'text-sky-700',
    },
    {
      title: 'Jahresplanung',
      sub: 'Termine, Feiertage & Schließtage',
      icon: CalendarDays,
      href: '/admin/jahresplanung',
      color: 'from-emerald-100 to-teal-200',
      iconColor: 'text-emerald-700',
    },
    {
      title: 'Elternrat',
      sub: 'Mitglieder & Sitzungsprotokolle',
      icon: UsersRound,
      href: '/admin/elternrat',
      color: 'from-violet-100 to-purple-200',
      iconColor: 'text-violet-700',
    },
    {
      title: 'Gebühren',
      sub: 'Beiträge verwalten & nachverfolgen',
      icon: Euro,
      href: '/admin/gebuehren',
      color: 'from-green-100 to-emerald-200',
      iconColor: 'text-green-700',
    },
    {
      title: 'QR-Codes',
      sub: 'Check-in per QR-Code',
      icon: QrCode,
      href: '/admin/qrcodes',
      color: 'from-gray-100 to-slate-200',
      iconColor: 'text-gray-700',
    },
    {
      title: 'Gesundheitsübersicht',
      sub: 'Allergien, Impfungen & Notfallkontakte',
      icon: Heart,
      href: '/admin/gesundheit',
      color: 'from-red-100 to-rose-200',
      iconColor: 'text-red-600',
    },
    {
      title: 'Audit-Log',
      sub: 'Protokoll aller Systemaktivitäten',
      icon: Activity,
      href: '/admin/audit-log',
      color: 'from-slate-100 to-gray-200',
      iconColor: 'text-slate-700',
    },
    {
      title: 'Kind-Dokumente',
      sub: 'Verträge, Atteste & Unterlagen',
      icon: File,
      href: '/admin/kind-dokumente',
      color: 'from-orange-100 to-amber-200',
      iconColor: 'text-orange-700',
    },
    {
      title: 'Förderpläne',
      sub: 'Individuelle Entwicklungsziele',
      icon: Target,
      href: '/admin/foerderplaene',
      color: 'from-brand-100 to-blue-200',
      iconColor: 'text-brand-700',
    },
    {
      title: 'Zeiterfassung',
      sub: 'Team-Arbeitszeiten im Überblick',
      icon: Clock,
      href: '/admin/zeiterfassung',
      color: 'from-teal-100 to-cyan-200',
      iconColor: 'text-teal-700',
    },
    {
      title: 'Wochenberichte',
      sub: 'Wöchentliche Gruppenberichte',
      icon: BookMarked,
      href: '/admin/wochenberichte',
      color: 'from-rose-100 to-pink-200',
      iconColor: 'text-rose-700',
    },
    {
      title: 'Urlaubsanträge',
      sub: 'Urlaub & Abwesenheiten genehmigen',
      icon: Plane,
      href: '/admin/urlaub',
      color: 'from-sky-100 to-blue-200',
      iconColor: 'text-sky-700',
    },
    {
      title: 'Raumplan',
      sub: 'Räume & Belegung verwalten',
      icon: LayoutGrid,
      href: '/raumplan',
      color: 'from-teal-100 to-cyan-200',
      iconColor: 'text-teal-700',
    },
    {
      title: 'Fortbildungen',
      sub: 'Schulungen & Zertifikate verwalten',
      icon: GraduationCap,
      href: '/admin/fortbildungen',
      color: 'from-indigo-100 to-violet-200',
      iconColor: 'text-indigo-700',
    },
    {
      title: 'Gruppenübergabe',
      sub: 'Übergabeprotokolle & Notizen',
      icon: ArrowLeftRight,
      href: '/admin/uebergabe',
      color: 'from-amber-100 to-orange-200',
      iconColor: 'text-amber-700',
    },
    {
      title: 'Tagesablauf',
      sub: 'Zeiten & Aktivitäten planen',
      icon: Clock3,
      href: '/admin/tagesablauf',
      color: 'from-green-100 to-emerald-200',
      iconColor: 'text-green-700',
    },
    {
      title: 'Elternbefragung',
      sub: 'Umfragen erstellen & auswerten',
      icon: Star,
      href: '/admin/befragung',
      color: 'from-violet-100 to-purple-200',
      iconColor: 'text-violet-700',
    },
    {
      title: 'Vertretungsplan',
      sub: 'Abwesenheiten & Vertretungen',
      icon: RefreshCw,
      href: '/admin/vertretung',
      color: 'from-cyan-100 to-sky-200',
      iconColor: 'text-cyan-700',
    },
    {
      title: 'Krankmeldungen Team',
      sub: 'Krankmeldungen des Personals',
      icon: Thermometer,
      href: '/admin/krankmeldungen',
      color: 'from-red-100 to-rose-200',
      iconColor: 'text-red-600',
    },
    {
      title: 'Eingewöhnung',
      sub: 'Eingewöhnungsprozesse tracken',
      icon: Baby,
      href: '/admin/eingewoehnung',
      color: 'from-pink-100 to-rose-200',
      iconColor: 'text-pink-600',
    },
    {
      title: 'Kita-Handbuch',
      sub: 'Kapitel & Informationen pflegen',
      icon: BookOpen,
      href: '/handbuch',
      color: 'from-sky-100 to-blue-200',
      iconColor: 'text-sky-700',
    },
    {
      title: 'Kita-Regelwerk',
      sub: 'Richtlinien & Verfahren',
      icon: Scale,
      href: '/regelwerk',
      color: 'from-slate-100 to-gray-200',
      iconColor: 'text-slate-700',
    },
    {
      title: 'Materialbestellung',
      sub: 'Bestellanträge verwalten & genehmigen',
      icon: ShoppingCart,
      href: '/materialbestellung',
      color: 'from-emerald-100 to-green-200',
      iconColor: 'text-emerald-700',
    },
    {
      title: 'Aktivitätsfeed',
      sub: 'Alle Ereignisse auf einen Blick',
      icon: Activity,
      href: '/admin/aktivitaet',
      color: 'from-indigo-100 to-blue-200',
      iconColor: 'text-indigo-700',
    },
    {
      title: 'Wochenzusammenfassung',
      sub: 'Auswertung & Geburtstage',
      icon: BarChart2,
      href: '/admin/wochenzusammenfassung',
      color: 'from-violet-100 to-purple-200',
      iconColor: 'text-violet-700',
    },
    {
      title: 'Gruppen-Statistik',
      sub: 'Anwesenheit & Kennzahlen je Gruppe',
      icon: PieChart,
      href: '/admin/gruppen-statistik',
      color: 'from-emerald-100 to-teal-200',
      iconColor: 'text-emerald-700',
    },
    {
      title: 'Monatsrückblick',
      sub: 'Kalender-Heatmap & Auswertung',
      icon: CalendarRange,
      href: '/admin/monatsrueckblick',
      color: 'from-blue-100 to-sky-200',
      iconColor: 'text-blue-700',
    },
    {
      title: 'Nachrichtenvorlagen',
      sub: 'Wiederverwendbare Texte & Elterninfo',
      icon: MessageSquarePlus,
      href: '/admin/vorlagen',
      color: 'from-rose-100 to-pink-200',
      iconColor: 'text-rose-700',
    },
    {
      title: 'Eltern-Kontakte',
      sub: 'WhatsApp, Telefon & E-Mail auf einen Blick',
      icon: MessageCircle,
      href: '/eltern-kontakte',
      color: 'from-green-100 to-emerald-200',
      iconColor: 'text-green-700',
    },
    {
      title: 'Allergien & Unverträglichkeiten',
      sub: 'Alle Kinder mit Allergien im Überblick',
      icon: AlertTriangle,
      href: '/allergien',
      color: 'from-amber-100 to-orange-200',
      iconColor: 'text-amber-700',
    },
    {
      title: 'Support & Hilfe',
      sub: 'Anfragen & Tickets verwalten',
      icon: LifeBuoy,
      href: '/admin/support',
      color: 'from-brand-100 to-sky-200',
      iconColor: 'text-brand-700',
    },
    {
      title: 'KI-Assistent',
      sub: 'Elternbriefe, Beobachtungen & mehr',
      icon: Sparkles,
      href: '/ki-assistent',
      color: 'from-violet-100 to-purple-200',
      iconColor: 'text-violet-700',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <Shield size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <p className="text-sm text-gray-500">Verwaltung & Einstellungen</p>
        </div>
      </div>

      <AiAdminUebersicht />

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-brand-600">{childCount ?? 0}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Kinder</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-green-600">{groupCount ?? 0}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Gruppen</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-purple-600">{userCount ?? 0}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Nutzer</p>
        </div>
        <div className="card p-3 text-center">
          <p className={`text-xl font-bold ${(neuAnmeldungenCount ?? 0) > 0 ? 'text-brand-600' : 'text-gray-400'}`}>
            {neuAnmeldungenCount ?? 0}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">Anmeldungen</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="space-y-3">
        {sections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
          >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={22} className={s.iconColor} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900">{s.title}</p>
                {(s as any).badge !== undefined && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold">
                    {(s as any).badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Reports link */}
      <Link href="/tagesberichte" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-200 flex items-center justify-center flex-shrink-0">
          <BarChart3 size={22} className="text-rose-700" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Tagesberichte</p>
          <p className="text-xs text-gray-400 mt-0.5">Heutige Berichte einsehen</p>
        </div>
        <ChevronRight size={18} className="text-gray-300" />
      </Link>
    </div>
  )
}
