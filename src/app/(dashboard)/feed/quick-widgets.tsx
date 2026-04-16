import Link from 'next/link'
import {
  NotebookPen, Users2, Moon, ClipboardCheck, ShoppingCart,
  Thermometer, CalendarDays, BookOpen, Utensils, Scale,
  ClipboardList, FileText, StickyNote, Phone, AlertTriangle, BookMarked,
  Baby, BellOff, LifeBuoy, Sparkles
} from 'lucide-react'

const STAFF_WIDGETS = [
  { href: '/tagesjournal',      icon: NotebookPen,    label: 'Journal',      color: 'bg-brand-100',   iconColor: 'text-brand-600' },
  { href: '/kinder',            icon: Users2,          label: 'Kinder',       color: 'bg-green-100',   iconColor: 'text-green-600' },
  { href: '/anwesenheit',       icon: ClipboardCheck,  label: 'Anwesenheit',  color: 'bg-teal-100',    iconColor: 'text-teal-600' },
  { href: '/ki-assistent',      icon: Sparkles,        label: 'KI-Assistent', color: 'bg-violet-100',  iconColor: 'text-violet-600' },
  { href: '/schlafbuch',        icon: Moon,            label: 'Schlafbuch',   color: 'bg-indigo-100',  iconColor: 'text-indigo-600' },
  { href: '/hygiene',           icon: ClipboardList,   label: 'Hygiene',      color: 'bg-blue-100',    iconColor: 'text-blue-600' },
  { href: '/notizen',           icon: StickyNote,      label: 'Notizen',      color: 'bg-amber-100',   iconColor: 'text-amber-600' },
  { href: '/materialbestellung',icon: ShoppingCart,    label: 'Material',     color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { href: '/notfallkontakte',   icon: Phone,           label: 'Notfallkontakte', color: 'bg-red-100',  iconColor: 'text-red-500' },
  { href: '/krankmeldung',      icon: Thermometer,     label: 'Krankmeldung', color: 'bg-rose-100',    iconColor: 'text-rose-500' },
  { href: '/kalender',          icon: CalendarDays,    label: 'Kalender',     color: 'bg-purple-100',  iconColor: 'text-purple-600' },
  { href: '/handbuch',          icon: BookOpen,        label: 'Handbuch',     color: 'bg-sky-100',     iconColor: 'text-sky-600' },
  { href: '/regelwerk',         icon: Scale,           label: 'Regelwerk',    color: 'bg-slate-100',   iconColor: 'text-slate-600' },
  { href: '/allergien',         icon: AlertTriangle,   label: 'Allergien',    color: 'bg-amber-100',   iconColor: 'text-amber-600' },
]

const PARENT_WIDGETS = [
  { href: '/mein-kind',          icon: Baby,          label: 'Mein Kind',     color: 'bg-brand-100',   iconColor: 'text-brand-600' },
  { href: '/abwesenheit-melden', icon: BellOff,       label: 'Abwesend melden', color: 'bg-red-100',   iconColor: 'text-red-500' },
  { href: '/kalender',           icon: CalendarDays,  label: 'Kalender',      color: 'bg-purple-100',  iconColor: 'text-purple-600' },
  { href: '/speiseplan',         icon: Utensils,      label: 'Speiseplan',    color: 'bg-lime-100',    iconColor: 'text-lime-600' },
  { href: '/wochenrueckblick',   icon: BookMarked,    label: 'Wochenrückblick',color: 'bg-teal-100',   iconColor: 'text-teal-600' },
  { href: '/formulare',          icon: FileText,      label: 'Formulare',     color: 'bg-orange-100',  iconColor: 'text-orange-600' },
  { href: '/handbuch',           icon: BookOpen,      label: 'Handbuch',      color: 'bg-blue-100',    iconColor: 'text-blue-600' },
  { href: '/regelwerk',          icon: Scale,         label: 'Regelwerk',     color: 'bg-slate-100',   iconColor: 'text-slate-600' },
  { href: '/support',            icon: LifeBuoy,      label: 'Hilfe',         color: 'bg-sky-100',     iconColor: 'text-sky-600' },
]

export default function QuickWidgets({ isStaff }: { isStaff: boolean }) {
  const widgets = isStaff ? STAFF_WIDGETS : PARENT_WIDGETS
  return (
    <div>
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Schnellzugriff</h2>
      <div className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4 snap-x scrollbar-none">
        {widgets.map(w => (
          <Link key={w.href} href={w.href}
            className="snap-start flex-shrink-0 flex flex-col items-center gap-1.5 w-[58px]">
            <div className={`w-12 h-12 rounded-2xl ${w.color} flex items-center justify-center shadow-sm`}>
              <w.icon size={20} className={w.iconColor} />
            </div>
            <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">{w.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
