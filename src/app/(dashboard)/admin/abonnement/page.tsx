'use client'
// src/app/(dashboard)/admin/abonnement/page.tsx

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CreditCard, CheckCircle2, AlertTriangle, Loader2, ExternalLink, Zap, Building2, Shield } from 'lucide-react'
import AiAbonnement from './ai-abonnement'

const PLAN_INFO = {
  starter: {
    name: 'Starter',
    price: '59 €/Monat',
    color: 'from-gray-100 to-slate-200',
    icon: Zap,
    features: ['1 Einrichtung', 'Bis 50 Kinder', 'Basis-Features', 'E-Mail-Support'],
  },
  professional: {
    name: 'Professional',
    price: '149 €/Monat',
    color: 'from-brand-100 to-blue-200',
    icon: Shield,
    features: ['1 Einrichtung', 'Unbegrenzt Kinder', 'KI-Features', 'Prioritätssupport'],
  },
  traeger: {
    name: 'Träger',
    price: '499 €/Monat',
    color: 'from-purple-100 to-violet-200',
    icon: Building2,
    features: ['Unbegrenzt Einrichtungen', 'Träger-Dashboard', 'Alle Features', 'Dedizierter Support'],
  },
}

interface Subscription {
  plan: string
  status: string
  trial_ends_at: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean | null
}

export default function AbonnementPage() {
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('site_id').eq('id', user.id).single()
      if (!profile?.site_id) { setLoading(false); return }
      const { data } = await supabase.from('subscriptions').select('*').eq('site_id', profile.site_id).single()
      setSub(data)
      setLoading(false)
    }
    load()
  }, [])

  const openPortal = async () => {
    setPortalLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError(data.error ?? 'Fehler beim Öffnen des Portals')
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.')
    }
    setPortalLoading(false)
  }

  const planKey = (sub?.plan ?? 'professional') as keyof typeof PLAN_INFO
  const plan = PLAN_INFO[planKey] ?? PLAN_INFO.professional
  const PlanIcon = plan.icon

  const statusLabel = {
    active: { text: 'Aktiv', color: 'text-green-700 bg-green-50 border-green-200' },
    trialing: { text: 'Testphase', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    past_due: { text: 'Zahlung überfällig', color: 'text-red-700 bg-red-50 border-red-200' },
    canceled: { text: 'Gekündigt', color: 'text-gray-600 bg-gray-50 border-gray-200' },
    incomplete: { text: 'Unvollständig', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  }[sub?.status ?? 'active'] ?? { text: sub?.status ?? '—', color: 'text-gray-600 bg-gray-50 border-gray-200' }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abonnement</h1>
        <p className="text-gray-500 text-sm mt-1">Verwalten Sie Ihr KitaHub-Abonnement</p>
      </div>

      <AiAbonnement />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {!sub ? (
        <div className="border border-gray-200 rounded-xl p-8 text-center space-y-4">
          <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="text-gray-600">Kein aktives Abonnement gefunden.</p>
          <a href="/pricing" className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-blue-700">
            Jetzt abonnieren <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <>
          {/* Plan-Karte */}
          <div className={`rounded-xl bg-gradient-to-br ${plan.color} p-6 border border-white/60`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/70 rounded-lg p-2">
                  <PlanIcon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{plan.name}</div>
                  <div className="text-gray-600 text-sm">{plan.price}</div>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusLabel.color}`}>
                {statusLabel.text}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-1.5 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
            {sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date() && (
              <div className="px-5 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Testphase endet</span>
                <span className="text-sm font-medium text-blue-700">
                  {new Date(sub.trial_ends_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {sub.current_period_end && (
              <div className="px-5 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {sub.cancel_at_period_end ? 'Zugang bis' : 'Nächste Verlängerung'}
                </span>
                <span className={`text-sm font-medium ${sub.cancel_at_period_end ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(sub.current_period_end).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            )}
            {sub.cancel_at_period_end && (
              <div className="px-5 py-4 bg-amber-50">
                <div className="flex items-center gap-2 text-amber-700 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Das Abonnement wurde gekündigt und läuft zum obigen Datum aus.
                </div>
              </div>
            )}
          </div>

          {/* Portal Button */}
          <button
            onClick={openPortal}
            disabled={portalLoading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-3 font-medium transition-colors disabled:opacity-60"
          >
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            {portalLoading ? 'Weiterleitung...' : 'Abo verwalten (Stripe Kundenportal)'}
          </button>
          <p className="text-xs text-center text-gray-400">
            Rechnung herunterladen · Zahlungsmethode ändern · Kündigen
          </p>
        </>
      )}
    </div>
  )
}
