import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Mail, MessageCircle,
  Users, Search, UserCircle2,
} from 'lucide-react'
import AiElternkontakteAnalyse from './ai-elternkontakte-analyse'

export const metadata = { title: 'Eltern-Kontakte' }

function waLink(phone: string, childName: string) {
  const e164 = phone.replace(/\D/g, '').replace(/^0/, '49')
  const msg = `Guten Tag,\n\nich melde mich bezüglich Ihres Kindes ${childName}.\n\nMit freundlichen Grüßen,\n[Erzieher/in]`
  return `https://wa.me/${e164}?text=${encodeURIComponent(msg)}`
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

const GROUP_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16',
]

export default async function ElternKontaktePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Load children with parent contacts
  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, last_name, group_id, status, groups(name, color), parent_contacts(id, name, relation, phone, email, is_primary)')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('last_name')

  const childList = (children ?? []) as any[]

  // Group by group name
  const byGroup: Record<string, typeof childList> = {}
  childList.forEach(child => {
    const grpName = child.groups?.name ?? 'Ohne Gruppe'
    if (!byGroup[grpName]) byGroup[grpName] = []
    byGroup[grpName].push(child)
  })

  const totalWithContact = childList.filter(c =>
    c.parent_contacts?.some((p: any) => p.phone || p.email)
  ).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Eltern-Kontakte</h1>
          <p className="text-sm text-gray-400">WhatsApp · Telefon · E-Mail</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-gray-900">{totalWithContact}</p>
          <p className="text-[10px] text-gray-400">mit Kontakt</p>
        </div>
      </div>

      <AiElternkontakteAnalyse />

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Kinder gesamt', value: childList.length, icon: Users, color: 'text-brand-600 bg-brand-50' },
          { label: 'Mit Telefon',   value: childList.filter(c => c.parent_contacts?.some((p: any) => p.phone)).length, icon: Phone, color: 'text-blue-600 bg-blue-50' },
          { label: 'Mit E-Mail',    value: childList.filter(c => c.parent_contacts?.some((p: any) => p.email)).length, icon: Mail, color: 'text-amber-600 bg-amber-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-3 text-center">
            <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mx-auto mb-1.5`}>
              <Icon size={15} />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* WhatsApp Broadcast note */}
      <div className="card p-4 flex items-start gap-3" style={{ backgroundColor: '#e7fbe7', borderColor: '#a7f3b7' }}>
        <MessageCircle size={20} className="shrink-0 mt-0.5" style={{ color: '#16a34a' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#15803d' }}>WhatsApp-Nachrichten</p>
          <p className="text-xs mt-0.5" style={{ color: '#166534' }}>
            Klicke auf das WhatsApp-Symbol bei einem Kind, um direkt eine vorbereitete Nachricht zu öffnen.
            Für Gruppen-Broadcasts nutze WhatsApp-Gruppen oder die Kita-Ankündigungsfunktion.
          </p>
        </div>
      </div>

      {/* No children */}
      {childList.length === 0 && (
        <div className="card p-10 text-center">
          <Users size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Keine aktiven Kinder gefunden</p>
        </div>
      )}

      {/* Children grouped by Gruppe */}
      {Object.entries(byGroup).map(([groupName, kids], gi) => (
        <div key={groupName}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: GROUP_COLORS[gi % GROUP_COLORS.length] }}
            />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{groupName}</h2>
            <span className="text-xs text-gray-400">({kids.length})</span>
          </div>

          <div className="space-y-2">
            {kids.map(child => {
              const contacts: any[] = child.parent_contacts ?? []
              const primary = contacts.find((c: any) => c.is_primary) ?? contacts[0]

              return (
                <div key={child.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    {/* Child avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: GROUP_COLORS[gi % GROUP_COLORS.length] }}
                    >
                      {initials(child.first_name, child.last_name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {child.first_name} {child.last_name}
                      </p>
                      {primary && (
                        <p className="text-xs text-gray-400 truncate">
                          {primary.name}
                          {primary.relation && ` · ${primary.relation}`}
                        </p>
                      )}
                    </div>

                    {/* Contact buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {primary?.phone && (
                        <a
                          href={waLink(primary.phone, `${child.first_name} ${child.last_name}`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp"
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm active:scale-95 transition-all"
                          style={{ backgroundColor: '#25D366' }}
                        >
                          <MessageCircle size={16} />
                        </a>
                      )}
                      {primary?.phone && (
                        <a
                          href={`tel:${primary.phone}`}
                          title="Anrufen"
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500 text-white shadow-sm active:scale-95 transition-all hover:bg-blue-600"
                        >
                          <Phone size={16} />
                        </a>
                      )}
                      {primary?.email && (
                        <a
                          href={`mailto:${primary.email}?subject=Bezüglich ${child.first_name} ${child.last_name}`}
                          title="E-Mail"
                          className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500 text-white shadow-sm active:scale-95 transition-all hover:bg-amber-600"
                        >
                          <Mail size={16} />
                        </a>
                      )}
                      {!primary?.phone && !primary?.email && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <UserCircle2 size={13} />
                          kein Kontakt
                        </span>
                      )}
                    </div>
                  </div>

                  {/* All contacts (if more than 1) */}
                  {contacts.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                      {contacts.slice(1).map((c: any) => (
                        <div key={c.id} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="font-medium">{c.name}</span>
                          {c.relation && <span className="text-gray-400">({c.relation})</span>}
                          <div className="flex gap-1.5 ml-auto">
                            {c.phone && (
                              <a href={waLink(c.phone, `${child.first_name} ${child.last_name}`)} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-white active:scale-95 transition-all"
                                style={{ backgroundColor: '#25D366' }}>
                                <MessageCircle size={12} />
                              </a>
                            )}
                            {c.phone && (
                              <a href={`tel:${c.phone}`} className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                                <Phone size={12} />
                              </a>
                            )}
                            {c.email && (
                              <a href={`mailto:${c.email}`} className="p-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                                <Mail size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
