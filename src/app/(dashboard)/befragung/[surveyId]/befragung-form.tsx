'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, CheckCircle2, Star } from 'lucide-react'

const QUESTIONS = [
  { id: 'overall', label: 'Gesamtzufriedenheit', type: 'rating' },
  { id: 'communication', label: 'Kommunikation mit dem Team', type: 'rating' },
  { id: 'care_quality', label: 'Qualität der Betreuung', type: 'rating' },
  { id: 'activities', label: 'Angebote & Aktivitäten', type: 'rating' },
  { id: 'environment', label: 'Räumlichkeiten & Ausstattung', type: 'rating' },
  { id: 'feedback', label: 'Was gefällt Ihnen besonders?', type: 'text' },
  { id: 'improvement', label: 'Was kann verbessert werden?', type: 'text' },
]

interface Props {
  surveyId: string
  respondentId: string
}

export default function BefragungForm({ surveyId, respondentId }: Props) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  function setRating(id: string, val: number) {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }
  function setText(id: string, val: string) {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  async function handleSubmit() {
    const ratingQs = QUESTIONS.filter(q => q.type === 'rating')
    if (ratingQs.some(q => !answers[q.id])) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('survey_responses').insert({
      survey_id: surveyId,
      user_id: respondentId,
      answers,
    })
    setSaving(false)
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="card p-10 text-center">
        <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3" />
        <p className="text-base font-semibold text-gray-800">Vielen Dank!</p>
        <p className="text-sm text-gray-500 mt-1">Ihre Antworten wurden gespeichert.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {QUESTIONS.map(q => (
        <div key={q.id} className="card p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">{q.label}</p>
          {q.type === 'rating' ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={() => setRating(q.id, v)}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      (answers[q.id] as number) >= v
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                  <span className="text-[10px] text-gray-400">{v}</span>
                </button>
              ))}
            </div>
          ) : (
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Ihre Antwort…"
              value={(answers[q.id] as string) ?? ''}
              onChange={e => setText(q.id, e.target.value)}
            />
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={QUESTIONS.filter(q => q.type === 'rating').some(q => !answers[q.id]) || saving}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send size={16} /> {saving ? 'Absenden…' : 'Umfrage abschicken'}
      </button>
      <p className="text-xs text-gray-400 text-center">Die Bewertungen sind Pflichtfelder (1–5 Sterne)</p>
    </div>
  )
}
