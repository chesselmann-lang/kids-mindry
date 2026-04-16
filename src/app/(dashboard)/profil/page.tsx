import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, Phone, Baby, Link as LinkIcon, Shield, FolderOpen, Utensils, FileText, ClipboardList, ShieldCheck, LifeBuoy } from 'lucide-react'
import Link from 'next/link'
import type { Profile, Child } from '@/types/database'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import LogoutButton from './logout-button'
import ProfilClient from './profil-client'
import AvatarUpload from './avatar-upload'
import AiProfil from './ai-profil'

export const metadata = { title: 'Profil' }

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: guardians } = await supabase
    .from('guardians')
    .select('*, children(*)')
    .eq('user_id', user.id)

  const children = (guardians ?? [])
    .filter(g => g.children)
    .map(g => g.children as unknown as Child)

  const roleLabels: Record<string, string> = {
    parent: 'Elternteil',
    educator: 'Erzieher/in',
    group_lead: 'Gruppenleitung',
    admin: 'Administrator',
    caretaker: 'Betreuer/in',
  }

  const isAdmin = ['admin', 'group_lead'].includes((profile as Profile)?.role ?? '')
  const isParentRole = (profile as Profile)?.role === 'parent'

  const { data: site } = await supabase
    .from('sites')
    .select('name, phone, email, address')
    .eq('id', process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!)
    .single()
  const initials = ((profile?.full_name ?? user.email ?? '?'))
    .split(' ').map((s: string) => s[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Ihr Konto & Einstellungen</p>
      </div>

      <AiProfil />

      {/* Avatar */}
      <div className="card p-5">
        <AvatarUpload userId={user.id} currentAvatarUrl={(profile as any)?.avatar_url ?? null} fullName={profile?.full_name ?? user.email ?? '?'} />
      </div>

      {/* Profile card */}
      <Link href="/mein-profil" className="card p-6 flex items-center gap-5 hover:shadow-card-hover transition-shadow">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center text-brand-800 font-bold text-2xl flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-lg">{profile?.full_name ?? 'Unbekannt'}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="badge bg-brand-50 text-brand-700">
              {roleLabels[(profile as Profile)?.role ?? 'parent']}
            </span>
            {profile?.phone && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Phone size={11} />{profile.phone}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs text-brand-600 font-medium flex-shrink-0">Bearbeiten</span>
      </Link>

      {/* Admin link */}
      {isAdmin && (
        <Link
          href="/admin"
          className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
            <Shield size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Admin-Bereich</p>
            <p className="text-xs text-gray-400">Kinder, Gruppen, Nutzer verwalten</p>
          </div>
          <LinkIcon size={15} className="text-gray-300" />
        </Link>
      )}

      {/* My children */}
      {children.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Meine Kinder</h2>
          <div className="space-y-2">
            {children.map((child: Child) => (
              <Link key={child.id} href="/mein-kind" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-kita-yellow/20 to-kita-yellow/40 flex items-center justify-center">
                  <Baby size={20} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{child.first_name} {child.last_name}</p>
                  {child.date_of_birth && (
                    <p className="text-xs text-gray-400">
                      {format(new Date(child.date_of_birth), 'd. MMMM yyyy', { locale: de })}
                    </p>
                  )}
                </div>
                <LinkIcon size={15} className="text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Editable settings */}
      <ProfilClient
        profileId={user.id}
        fullName={profile?.full_name ?? ''}
        phone={profile?.phone ?? ''}
        email={user.email ?? ''}
        isParent={(profile as Profile)?.role === 'parent'}
      />

      {/* Schnellzugriff für Eltern */}
      {isParentRole && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Schnellzugriff</h2>
          <div className="space-y-2">
            <Link href="/tagesberichte" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200 flex items-center justify-center flex-shrink-0">
                <ClipboardList size={18} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Tagesberichte</p>
                <p className="text-xs text-gray-400">Berichte der letzten Tage</p>
              </div>
              <LinkIcon size={15} className="text-gray-300" />
            </Link>

            <Link href="/protokolle" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-indigo-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Protokolle</p>
                <p className="text-xs text-gray-400">Elternabend-Mitschriften</p>
              </div>
              <LinkIcon size={15} className="text-gray-300" />
            </Link>

            <Link href="/speiseplan" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center flex-shrink-0">
                <Utensils size={18} className="text-green-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Speiseplan</p>
                <p className="text-xs text-gray-400">Wöchentliches Menü</p>
              </div>
              <LinkIcon size={15} className="text-gray-300" />
            </Link>

            <Link href="/dokumente" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                <FolderOpen size={18} className="text-orange-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Kita-Dokumente</p>
                <p className="text-xs text-gray-400">Formulare & Unterlagen herunterladen</p>
              </div>
              <LinkIcon size={15} className="text-gray-300" />
            </Link>

            <Link href="/einwilligungen" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={18} className="text-sky-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Einwilligungen</p>
                <p className="text-xs text-gray-400">Foto-Einwilligung & Datenschutz</p>
              </div>
              <LinkIcon size={15} className="text-gray-300" />
            </Link>

            <Link href="/support" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-200 flex items-center justify-center flex-shrink-0">
                <LifeBuoy size={18} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Hilfe & Support</p>
                <p className="text-xs text-gray-400">Fragen stellen & Hilfe erhalten</p>
              </div>
              <LinkIcon size={15} className="text-gray-300" />
            </Link>
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="card p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Kita-Kontakt</p>
        <div className="space-y-2 text-sm text-gray-600">
          {(site as any)?.email ? (
            <a href={`mailto:${(site as any).email}`} className="flex items-center gap-2 hover:text-brand-600">
              <Mail size={15} className="text-gray-400" /><span>{(site as any).email}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Mail size={15} /><span>Keine E-Mail hinterlegt</span>
            </div>
          )}
          {(site as any)?.phone ? (
            <a href={`tel:${(site as any).phone}`} className="flex items-center gap-2 hover:text-brand-600">
              <Phone size={15} className="text-gray-400" /><span>{(site as any).phone}</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Phone size={15} /><span>Keine Telefonnummer hinterlegt</span>
            </div>
          )}
          {(site as any)?.address && (
            <p className="text-xs text-gray-400 pt-1">{(site as any).address}</p>
          )}
        </div>
      </div>

      <LogoutButton />

      {/* Legal links */}
      <div className="flex justify-center gap-4 text-xs text-gray-300 pb-1">
        <Link href="/impressum" className="hover:text-brand-400 transition-colors">Impressum</Link>
        <Link href="/datenschutzerklaerung" className="hover:text-brand-400 transition-colors">Datenschutz</Link>
        <Link href="/agb" className="hover:text-brand-400 transition-colors">AGB</Link>
      </div>
      <p className="text-center text-xs text-gray-300 pb-2">KitaHub v1.0 · kids.mindry.de</p>
    </div>
  )
}
