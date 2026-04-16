'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, ChevronRight, Baby, Bell, Shield, MessageSquare, Sparkles } from 'lucide-react'

interface Props {
  userId: string
  childName?: string
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Willkommen bei KitaHub! 👋',
    subtitle: 'Ihre digitale Verbindung zur Kita',
    icon: Sparkles,
    color: 'from-brand-400 to-brand-600',
    content: 'KitaHub verbindet Sie täglich mit dem Kita-Team. Empfangen Sie Nachrichten, verfolgen Sie den Alltag Ihres Kindes und bleiben Sie immer informiert.',
  },
  {
    id: 'reports',
    title: 'Tagesberichte',
    subtitle: 'Was Ihr Kind erlebt',
    icon: Baby,
    color: 'from-green-400 to-emerald-600',
    content: 'Das Kita-Team schreibt täglich einen Bericht über den Tag Ihres Kindes – Stimmung, Aktivitäten, besondere Momente. Sie finden alles unter "Mein Kind".',
  },
  {
    id: 'messages',
    title: 'Nachrichten',
    subtitle: 'Direkt mit dem Team kommunizieren',
    icon: MessageSquare,
    color: 'from-purple-400 to-violet-600',
    content: 'Schreiben Sie direkt an das Erzieher-Team. Krankmeldungen, Fragen, Rückmeldungen – alles an einem Ort.',
  },
  {
    id: 'notifications',
    title: 'Benachrichtigungen',
    subtitle: 'Immer auf dem Laufenden',
    icon: Bell,
    color: 'from-amber-400 to-orange-500',
    content: 'Aktivieren Sie Benachrichtigungen, um keine wichtige Meldung zu verpassen. Sie können die Einstellungen jederzeit anpassen.',
  },
  {
    id: 'privacy',
    title: 'Datenschutz',
    subtitle: 'Ihre Daten sind sicher',
    icon: Shield,
    color: 'from-teal-400 to-cyan-600',
    content: 'Alle Daten werden sicher in Deutschland gespeichert. Sie können jederzeit alle Ihre Daten exportieren oder die Löschung beantragen.',
  },
]

export default function OnboardingWizard({ userId, childName }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [completing, setCompleting] = useState(false)
  const current = STEPS[step]

  async function handleComplete() {
    setCompleting(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', userId)
    router.push('/feed')
  }

  const isLast = step === STEPS.length - 1
  const Icon = current.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-brand-500' : i < step ? 'w-4 bg-brand-200' : 'w-4 bg-gray-200'}`} />
          ))}
        </div>

        {/* Card */}
        <div className="card p-6 space-y-5">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center mx-auto shadow-lg`}>
            <Icon size={32} className="text-white" />
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">{current.title}</h1>
            <p className="text-sm text-brand-600 font-medium mt-1">{current.subtitle}</p>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed text-center">{current.content}</p>

          {step === 0 && childName && (
            <div className="bg-brand-50 rounded-xl p-3 text-center">
              <p className="text-sm text-brand-800">
                Ihr Kind <strong>{childName}</strong> ist bereits in der Kita registriert.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={isLast ? handleComplete : () => setStep(s => s + 1)}
            disabled={completing}
            className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 text-base">
            {completing ? 'Moment…' : isLast
              ? <><CheckCircle2 size={20} /> Los geht's!</>
              : <>Weiter <ChevronRight size={20} /></>}
          </button>

          {!isLast && (
            <button onClick={handleComplete} className="w-full text-sm text-gray-400 py-2">
              Überspringen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
