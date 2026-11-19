import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConsentManager from './consent-manager'
import AiEinwilligungen from './ai-einwilligungen'
import Art8ConsentPanel, { type ChildConsent } from './art8-consent-panel'
import { Shield } from 'lucide-react'

export const metadata = { title: 'Einwilligungen · mindry kids' }

export default async function EinwilligungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/anmelden')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Staff → redirect to admin GDPR page
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (isStaff) redirect('/admin/datenschutz')

  // Load guardian → children relationships (for the photo consent section)
  const { data: guardians } = await supabase
    .from('guardians')
    .select('id, child_id, full_name, consent_photos, consent_signed_at, children(id, first_name, last_name, date_of_birth)')
    .eq('user_id', user.id)

  // Load Art. 8 parental consent records (new table from migration 018)
  const childIds = (guardians ?? []).map((g: any) => g.child_id).filter(Boolean)

  let parentalConsents: any[] = []
  if (childIds.length > 0) {
    const { data } = await (supabase as any)
      .from('parental_consent')
      .select('*')
      .in('child_id', childIds)
      .eq('guardian_id', user.id)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
    parentalConsents = data ?? []
  }

  // Build the ChildConsent array for Art8ConsentPanel
  const childConsents: ChildConsent[] = (guardians ?? []).map((g: any) => {
    const child = g.children
    const pc = parentalConsents.find((p: any) => p.child_id === g.child_id)
    return {
      child_id: g.child_id,
      child_name: child ? `${child.first_name} ${child.last_name}` : g.full_name ?? 'Kind',
      child_dob: child?.date_of_birth ?? null,
      consent_id: pc?.id ?? null,
      consent_version: pc?.consent_version ?? null,
      consented_at: pc?.consented_at ?? null,
      confirmed_at: pc?.confirmed_at ?? null,
      expires_at: pc?.expires_at ?? null,
      revoked_at: pc?.revoked_at ?? null,
      scope_learning: pc?.scope_learning ?? true,     // required — always true
      scope_analytics: pc?.scope_analytics ?? false,   // default OFF
      scope_marketing: pc?.scope_marketing ?? false,   // default OFF
      scope_personalization: pc?.scope_personalization ?? false, // default OFF
    }
  })

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-brand-600" />
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Einwilligungen
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Datenschutz &amp; Einwilligungen für Ihre Kinder gemäß DSGVO Art. 8
        </p>
      </div>

      {/* Art. 8 Parental Consent Panel */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
          Eltern-Einwilligung (Art. 8 DSGVO)
        </h2>
        <Art8ConsentPanel childConsents={childConsents} userEmail={user.email ?? ''} />
      </section>

      {/* AI / KI Einwilligungen */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
          KI-Assistent
        </h2>
        <AiEinwilligungen />
      </section>

      {/* Legacy photo consent section */}
      {(guardians ?? []).length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Foto-Einwilligung (Kita)
          </h2>
          <ConsentManager guardians={(guardians ?? []) as any[]} />
        </section>
      )}
    </div>
  )
}
