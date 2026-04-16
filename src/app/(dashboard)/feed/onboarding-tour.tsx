'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react'

const TOUR_STEPS_STAFF = [
  {
    emoji: '👋',
    title: 'Willkommen bei KitaHub!',
    body: 'Hier verwaltest du alles rund um den Kita-Alltag – von der Anwesenheit bis zu Elternnachrichten. Lass uns eine kurze Tour machen!',
  },
  {
    emoji: '📋',
    title: 'Neuigkeiten & Ankündigungen',
    body: 'Auf dieser Seite findest du alle wichtigen Neuigkeiten. Als Mitarbeiter kannst du mit dem + Button neue Beiträge erstellen.',
  },
  {
    emoji: '🏠',
    title: 'Schnellzugriff',
    body: 'Die Icons ganz oben führen dich direkt zu deinen wichtigsten Bereichen: Journal schreiben, Anwesenheit erfassen, Schlafbuch und mehr.',
  },
  {
    emoji: '👧',
    title: 'Kinder & Anwesenheit',
    body: 'Über "Kinder" kannst du täglich Ein- und Auschecken. Favorisiere Kinder mit dem Stern ⭐ für schnellen Zugriff.',
  },
  {
    emoji: '📅',
    title: 'Kalender & Termine',
    body: 'Im Kalender pflegst du Gruppenveranstaltungen, Schließtage und persönliche Termine. iCal-Export für externe Kalender-Apps ist ebenfalls verfügbar.',
  },
  {
    emoji: '🔔',
    title: 'Du bist bereit!',
    body: 'Erkunde KitaHub nach Lust und Laune. Im Admin-Bereich findest du alle weiteren Verwaltungsfunktionen. Viel Erfolg!',
  },
]

const TOUR_STEPS_PARENT = [
  {
    emoji: '👋',
    title: 'Willkommen bei KitaHub!',
    body: 'Hier bleibst du immer auf dem neuesten Stand, was in der Kita passiert – von Ankündigungen bis zum Wochenrückblick deines Kindes.',
  },
  {
    emoji: '📋',
    title: 'Neuigkeiten',
    body: 'Hier siehst du alle Ankündigungen der Kita. Wichtige Nachrichten werden angepinnt ganz oben angezeigt.',
  },
  {
    emoji: '📅',
    title: 'Kalender',
    body: 'Im Kalender findest du alle Termine und Veranstaltungen – inklusive iCal-Export für dein Smartphone.',
  },
  {
    emoji: '📖',
    title: 'Wochenrückblick',
    body: 'Unter "Wockenrückblick" siehst du jeden Montag, was dein Kind in der Vorwoche erlebt hat.',
  },
  {
    emoji: '💬',
    title: 'Nachrichten',
    body: 'Über den Nachrichten-Bereich kannst du direkt mit dem Kita-Team kommunizieren.',
  },
  {
    emoji: '✅',
    title: 'Du bist bereit!',
    body: 'Erkunde die App. Im Menü findest du alle Funktionen. Bei Fragen wende dich ans Kita-Team.',
  },
]

const STORAGE_KEY = 'kitahub_onboarding_done'

interface Props {
  isStaff: boolean
}

export default function OnboardingTour({ isStaff }: Props) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const steps = isStaff ? TOUR_STEPS_STAFF : TOUR_STEPS_PARENT

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) {
      // Slight delay so page renders first
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  function next() {
    if (step < steps.length - 1) setStep(s => s + 1)
    else dismiss()
  }

  function prev() {
    if (step > 0) setStep(s => s - 1)
  }

  if (!visible) return null

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Close */}
          <button onClick={dismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
            <X size={14} />
          </button>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{current.emoji}</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{current.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{current.body}</p>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            {steps.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={`transition-all rounded-full ${i === step ? 'w-4 h-1.5 bg-brand-500' : 'w-1.5 h-1.5 bg-gray-200'}`} />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={prev}
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 flex-shrink-0">
                <ChevronLeft size={18} />
              </button>
            )}
            <button onClick={next}
              className={`flex-1 h-10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                isLast ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}>
              {isLast ? (<><Check size={15} /> Los geht's!</>) : (<>Weiter <ChevronRight size={15} /></>)}
            </button>
          </div>

          <button onClick={dismiss} className="w-full mt-2 text-xs text-gray-400 py-1">
            Tour überspringen
          </button>
        </div>
      </div>
    </div>
  )
}
