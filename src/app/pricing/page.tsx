'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check, Zap, Building2, Loader2, Shield, Star, Sparkles,
  Baby, MessageCircle, Euro, FileText, Calendar, Users,
  Smartphone, QrCode, Globe, Brain, Lock, Phone, Mail,
  ArrowRight, ChevronDown, ChevronUp, CheckCircle2,
  Heart, BarChart3, Clock, Wifi
} from 'lucide-react'

const WA_NUMBER = '491234567890'
const WA_MSG = encodeURIComponent('Hallo! Ich interessiere mich für KitaHub. Können Sie mir eine Demo zeigen?')

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 59,
    priceJahr: 49,
    desc: 'Für kleine Kitas bis 50 Kinder',
    color: 'border-gray-200',
    textColor: 'text-gray-800',
    btnClass: 'bg-gray-800 text-white hover:bg-gray-900',
    badge: null,
    features: [
      'Bis 50 Kinder',
      'Digitale Anwesenheit',
      'Eltern-App (iOS + Android)',
      'Feed & Mitteilungen',
      'Kalender & Tagesberichte',
      'QR-Code Check-in',
      'Offlinefähig (PWA)',
      'E-Mail-Support',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    priceJahr: 119,
    desc: 'Für wachsende Kitas – der Bestseller',
    color: 'border-brand-500 shadow-xl shadow-brand-100',
    textColor: 'text-brand-700',
    btnClass: 'bg-brand-600 text-white hover:bg-brand-700',
    badge: '⭐ Empfohlen',
    features: [
      'Unbegrenzte Kinder',
      'Alles aus Starter',
      'KI-Tagesberichte & Förderanträge',
      'SEPA-Lastschrift & Stripe',
      'Steuerbescheinigung als PDF',
      'WhatsApp-Broadcast',
      'Übersetzungen (30+ Sprachen)',
      'SISMIK-Beobachtungsbögen',
      'Zoom-Elterngespräche',
      'Lexoffice-Integration',
      'Sozialstaffel-Rechner',
      '14 Tage kostenloser Test',
    ],
  },
  {
    id: 'traeger',
    name: 'Träger',
    price: 499,
    priceJahr: 399,
    desc: 'Für Träger mit mehreren Einrichtungen',
    color: 'border-gray-200',
    textColor: 'text-gray-800',
    btnClass: 'bg-gray-800 text-white hover:bg-gray-900',
    badge: null,
    features: [
      'Unbegrenzte Einrichtungen',
      'Alles aus Professional',
      'Träger-Dashboard (Multi-Kita)',
      'API-Zugang & Webhooks',
      'White-Label möglich',
      'DATEV-Export',
      'Prioritäts-Support',
      'Persönliches Onboarding',
    ],
  },
]

const FEATURES = [
  { icon: Baby, title: 'Kinderverwaltung', desc: 'Stammdaten, Fotos, Notfallkontakte, Allergien und Impfungen — alles an einem Ort.', color: 'bg-blue-100 text-blue-700' },
  { icon: MessageCircle, title: 'Eltern-Kommunikation', desc: 'Feed, Newsletter, WhatsApp-Broadcast, Übersetzungen in 30 Sprachen.', color: 'bg-violet-100 text-violet-700' },
  { icon: Brain, title: 'KI-Assistent', desc: 'Claude AI schreibt automatisch Tagesberichte und Förderanträge — spart 2h/Tag.', color: 'bg-amber-100 text-amber-700' },
  { icon: Euro, title: 'Zahlungen & Finanzen', desc: 'SEPA-Lastschriften, Stripe, Sozialstaffel, Steuerbescheinigungen, Lexoffice.', color: 'bg-emerald-100 text-emerald-700' },
  { icon: Shield, title: 'DSGVO-konform', desc: 'Server in Deutschland, Löschpflichten, VVT, TOM – vollständig dokumentiert.', color: 'bg-red-100 text-red-700' },
  { icon: Smartphone, title: 'Mobile App (PWA)', desc: 'Installierbar auf iOS & Android. Offline-fähig. Push-Benachrichtigungen.', color: 'bg-teal-100 text-teal-700' },
  { icon: BarChart3, title: 'Statistiken & Reports', desc: 'Anwesenheits-Heatmap, Monatsrückblick, Gruppenstatistiken auf einen Blick.', color: 'bg-indigo-100 text-indigo-700' },
  { icon: QrCode, title: 'QR-Code Check-in', desc: 'Schneller kontaktloser Check-in beim Bringen & Abholen mit dem Handy.', color: 'bg-gray-100 text-gray-700' },
]

const STEPS = [
  { num: '01', title: 'Konto erstellen', desc: 'In 2 Minuten registriert — keine Kreditkarte nötig. Einfach loslegen.', icon: CheckCircle2, color: 'bg-blue-600' },
  { num: '02', title: 'Kita einrichten', desc: 'Gruppen anlegen, Kinder & Erzieher einladen. Alles im geführten Onboarding.', icon: Settings, color: 'bg-violet-600' },
  { num: '03', title: 'Eltern einladen', desc: 'Eltern erhalten einen QR-Code oder Einladungslink. Fertig in Minuten.', icon: Users, color: 'bg-emerald-600' },
]

const TESTIMONIALS = [
  {
    name: 'Sabine M.',
    role: 'Kita-Leiterin, München',
    text: 'KitaHub hat unseren Alltag revolutioniert. Die KI-Tagesberichte sparen uns täglich 1-2 Stunden. Die Eltern lieben die App!',
    stars: 5,
    avatar: 'SM',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    name: 'Thomas K.',
    role: 'Träger, 6 Einrichtungen',
    text: 'Endlich eine Software, die alle Kitas zentral verwaltet. Die SEPA-Integration und Lexoffice-Anbindung sind Gold wert.',
    stars: 5,
    avatar: 'TK',
    color: 'bg-emerald-100 text-emerald-800',
  },
  {
    name: 'Maria L.',
    role: 'Erzieherin, Berlin',
    text: 'Ich war skeptisch, aber jetzt kann ich mir nichts anderes vorstellen. Die WhatsApp-Übersetzungsfunktion ist besonders toll für unsere internationalen Familien.',
    stars: 5,
    avatar: 'ML',
    color: 'bg-violet-100 text-violet-800',
  },
]

const FAQS = [
  {
    q: 'Ist KitaHub wirklich DSGVO-konform?',
    a: 'Ja. Alle Daten werden ausschließlich auf Servern in Deutschland (Mittwald, Plesk/GDPR-zertifiziert) gespeichert. Wir liefern VVT, TOM-Dokumentation und eine DSGVO-Löschfunktion direkt im Admin-Bereich mit.',
  },
  {
    q: 'Wie lange dauert die Einrichtung?',
    a: 'Die meisten Kitas sind in unter 30 Minuten startklar. Unser geführtes Onboarding führt Sie Schritt für Schritt durch die Einrichtung.',
  },
  {
    q: 'Gibt es eine App für iOS und Android?',
    a: 'KitaHub ist eine Progressive Web App (PWA) — das bedeutet, Eltern und Erzieher können sie direkt aus dem Browser auf ihrem Handy installieren. Kein App Store nötig, funktioniert auf allen Geräten.',
  },
  {
    q: 'Kann ich jederzeit kündigen?',
    a: 'Ja. Monatliche Pläne sind monatlich kündbar. Es gibt keine Mindestlaufzeit und keine versteckten Kosten. Ihre Daten können Sie jederzeit exportieren.',
  },
  {
    q: 'Was passiert nach dem 14-Tage-Test?',
    a: 'Sie werden automatisch benachrichtigt. Es wird nichts belastet, wenn Sie nicht upgraden. Sie behalten vollen Zugriff auf Ihre Daten und können jederzeit upgraden.',
  },
  {
    q: 'Unterstützt KitaHub mehrere Einrichtungen?',
    a: 'Der Träger-Plan unterstützt unbegrenzt viele Einrichtungen unter einem zentralen Träger-Dashboard. Alle Kitas können unabhängig voneinander verwaltet werden.',
  },
]

function Settings({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900 text-sm pr-4" style={{ fontFamily: 'var(--font-nunito)' }}>{q}</span>
        {open ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  const [jaehrlich, setJaehrlich] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const checkout = async (plan: typeof PLANS[0]) => {
    if (plan.id === 'traeger') {
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hallo, ich interessiere mich für den Träger-Plan von KitaHub.')}`, '_blank')
      return
    }
    setLoading(plan.id)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, jaehrlich }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-hero">
        <div className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
          {/* Nav */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-5 h-5 text-white" fill="none">
                  <circle cx="20" cy="13" r="5" fill="currentColor"/>
                  <circle cx="10" cy="24" r="4" fill="currentColor" opacity="0.7"/>
                  <circle cx="30" cy="24" r="4" fill="currentColor" opacity="0.7"/>
                </svg>
              </div>
              <span className="text-xl font-black text-gray-900" style={{ fontFamily: 'var(--font-nunito)' }}>KitaHub</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Anmelden</Link>
              <Link href="/register" className="bg-brand-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors">
                Kostenlos testen
              </Link>
            </div>
          </div>

          {/* Hero text */}
          <div className="inline-flex items-center gap-2 bg-white border border-brand-200 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-700 mb-6 shadow-sm">
            <Sparkles size={12} />
            Jetzt mit KI-Tagesberichten & WhatsApp-Integration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 leading-tight" style={{ fontFamily: 'var(--font-nunito)' }}>
            Die modernste<br />
            <span className="gradient-text">Kita-Software</span> in Deutschland
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Digitale Anwesenheit, KI-Berichte, Eltern-App, Zahlungen und DSGVO-Compliance —
            alles in einer Plattform. Für kleine Kitas bis zu großen Trägern.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register"
              className="w-full sm:w-auto bg-brand-600 text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-glow">
              14 Tage kostenlos testen <ArrowRight size={18} />
            </Link>
            <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] text-white font-bold px-6 py-3.5 rounded-2xl hover:bg-[#20ba5a] transition-colors flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Demo via WhatsApp
            </a>
            <Link href="/anmelden"
              className="w-full sm:w-auto border-2 border-brand-300 text-brand-700 font-bold px-6 py-3.5 rounded-2xl hover:bg-brand-50 transition-colors flex items-center justify-center gap-2">
              <Users size={18} /> Platz anfragen (für Eltern)
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><Shield size={13} className="text-green-500" /> Server in Deutschland</span>
            <span className="flex items-center gap-1.5"><Lock size={13} className="text-green-500" /> DSGVO-konform</span>
            <span className="flex items-center gap-1.5"><Zap size={13} className="text-blue-500" /> Setup in 30 Min</span>
            <span className="flex items-center gap-1.5"><Wifi size={13} className="text-blue-500" /> Offline-fähig (PWA)</span>
            <span className="flex items-center gap-1.5"><Heart size={13} className="text-red-400" /> Made in Germany</span>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>
            Alles was Ihre Kita braucht
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Von der digitalen Anwesenheit bis zur KI-gestützten Dokumentation — KitaHub deckt jeden Aspekt des Kita-Alltags ab.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="card p-4 hover:shadow-card-hover transition-shadow group">
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <f.icon size={20} />
              </div>
              <p className="font-bold text-gray-900 text-sm mb-1" style={{ fontFamily: 'var(--font-nunito)' }}>{f.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>So einfach geht's</h2>
            <p className="text-gray-500">In 3 Schritten startklar — ohne IT-Kenntnisse</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-200 to-transparent" />
                )}
                <div className="card p-6 text-center relative">
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                    <step.icon size={24} className="text-white" />
                  </div>
                  <p className="text-xs font-bold text-gray-300 mb-1" style={{ fontFamily: 'var(--font-nunito)' }}>{step.num}</p>
                  <p className="font-black text-gray-900 mb-2" style={{ fontFamily: 'var(--font-nunito)' }}>{step.title}</p>
                  <p className="text-sm text-gray-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>
            Einfache, faire Preise
          </h2>
          <p className="text-gray-500 mb-6">Keine Einrichtungsgebühren · Keine versteckten Kosten · Jederzeit kündbar</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setJaehrlich(false)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!jaehrlich ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setJaehrlich(true)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${jaehrlich ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              Jährlich
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">–20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.id}
              className={`bg-white rounded-3xl border-2 p-8 flex flex-col relative ${plan.color}`}>
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-brand-500 to-brand-700 text-white text-xs font-black px-5 py-1.5 rounded-full shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-black text-gray-900" style={{ fontFamily: 'var(--font-nunito)' }}>{plan.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{plan.desc}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-black text-gray-900" style={{ fontFamily: 'var(--font-nunito)' }}>
                    {jaehrlich ? plan.priceJahr : plan.price}€
                  </span>
                  <span className="text-gray-400 text-sm mb-1">/Monat</span>
                </div>
                {jaehrlich && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    = {((jaehrlich ? plan.priceJahr : plan.price) * 12).toLocaleString('de-DE')}€/Jahr
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check size={15} className="text-brand-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => checkout(plan)}
                disabled={loading !== null}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${plan.btnClass}`}>
                {loading === plan.id ? <Loader2 size={16} className="animate-spin" /> : null}
                {plan.id === 'traeger' ? 'Via WhatsApp anfragen' : plan.id === 'professional' ? '14 Tage kostenlos testen' : 'Jetzt starten'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-br from-brand-50 to-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>
              Was Kitas sagen
            </h2>
            <p className="text-gray-500">Über 200 Einrichtungen vertrauen KitaHub</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card p-6">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4 italic">„{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${t.color}`} style={{ fontFamily: 'var(--font-nunito)' }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900" style={{ fontFamily: 'var(--font-nunito)' }}>{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: 'var(--font-nunito)' }}>Häufige Fragen</h2>
          <p className="text-gray-500">Alles was Sie vor dem Start wissen möchten</p>
        </div>
        <div className="space-y-3">
          {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-brand-700 to-brand-900 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-nunito)' }}>
            Bereit für die digitale Kita?
          </h2>
          <p className="text-brand-200 mb-8 text-lg">
            14 Tage kostenlos testen. Keine Kreditkarte. Keine Verpflichtung.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register"
              className="w-full sm:w-auto bg-white text-brand-800 font-black px-8 py-4 rounded-2xl hover:bg-brand-50 transition-colors flex items-center justify-center gap-2 shadow-lg text-lg">
              Jetzt kostenlos starten <ArrowRight size={20} />
            </Link>
            <a href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#25D366] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#20ba5a] transition-colors flex items-center justify-center gap-2 shadow-lg text-lg">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
              Demo buchen
            </a>
          </div>

          <div className="mt-6">
            <Link href="/anmelden" className="inline-flex items-center gap-2 text-brand-200 hover:text-white text-sm underline underline-offset-4 transition-colors">
              Elternteil? Hier Kita-Platz online anfragen →
            </Link>
          </div>

          {/* Contact row */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-10 text-sm text-brand-300">
            <a href="tel:+491234567890" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={15} /> +49 123 456 7890
            </a>
            <a href="mailto:hallo@hesselmann-service.de" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={15} /> hallo@hesselmann-service.de
            </a>
            <span className="flex items-center gap-2">
              <Clock size={15} /> Mo–Fr 9–17 Uhr
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-4 h-4 text-white" fill="none">
                  <circle cx="20" cy="13" r="5" fill="currentColor"/>
                  <circle cx="10" cy="24" r="4" fill="currentColor" opacity="0.7"/>
                  <circle cx="30" cy="24" r="4" fill="currentColor" opacity="0.7"/>
                </svg>
              </div>
              <span className="text-white font-black" style={{ fontFamily: 'var(--font-nunito)' }}>KitaHub</span>
              <span className="text-gray-600">·</span>
              <span className="text-xs">Hesselmann Beratung UG</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link>
              <Link href="/datenschutz-kitahub" className="hover:text-white transition-colors">Datenschutz</Link>
              <a href="mailto:hallo@hesselmann-service.de" className="hover:text-white transition-colors">Kontakt</a>
              <span>Alle Preise zzgl. MwSt.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
