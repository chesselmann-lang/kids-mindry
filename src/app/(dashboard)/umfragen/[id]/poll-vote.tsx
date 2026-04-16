'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  pollId: string
  options: string[]
  optionCounts: number[]
  totalVoters: number
  myVote: number[] | null
  multipleChoice: boolean
  isClosed: boolean
  userId: string
}

export default function PollVote({ pollId, options, optionCounts, totalVoters, myVote, multipleChoice, isClosed, userId }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<number[]>(myVote ?? [])
  const [loading, setLoading] = useState(false)
  const hasVoted = myVote !== null
  const showResults = hasVoted || isClosed

  function toggleOption(idx: number) {
    if (multipleChoice) {
      setSelected(prev =>
        prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      )
    } else {
      setSelected([idx])
    }
  }

  async function handleVote() {
    if (!selected.length) return
    setLoading(true)
    const supabase = createClient()

    await supabase.from('poll_votes').upsert({
      poll_id: pollId,
      user_id: userId,
      option_indexes: selected,
    }, { onConflict: 'poll_id,user_id' })

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {options.map((opt, idx) => {
        const count = optionCounts[idx]
        const pct = totalVoters > 0 ? Math.round((count / totalVoters) * 100) : 0
        const isMyChoice = selected.includes(idx)
        const isVoted = myVote?.includes(idx)

        if (showResults) {
          return (
            <div key={idx} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isVoted && <CheckCircle2 size={15} className="text-brand-600 flex-shrink-0" />}
                  <span className={`text-sm font-medium truncate ${isVoted ? 'text-brand-700' : 'text-gray-700'}`}>{opt}</span>
                </div>
                <span className="text-sm font-bold text-gray-700 ml-2">{pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isVoted ? 'bg-brand-500' : 'bg-gray-300'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{count} {count === 1 ? 'Stimme' : 'Stimmen'}</p>
            </div>
          )
        }

        return (
          <button
            key={idx}
            onClick={() => toggleOption(idx)}
            disabled={isClosed}
            className={`w-full card p-4 text-left transition-all ${
              isMyChoice
                ? 'ring-2 ring-brand-400 bg-brand-50'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isMyChoice ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
              }`}>
                {isMyChoice && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="text-sm font-medium text-gray-800">{opt}</span>
            </div>
          </button>
        )
      })}

      {!showResults && !isClosed && (
        <button
          onClick={handleVote}
          disabled={!selected.length || loading}
          className="btn-primary w-full py-3 disabled:opacity-50"
        >
          {loading ? 'Speichere…' : 'Abstimmen'}
        </button>
      )}

      {isClosed && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
          <Lock size={13} /> Diese Umfrage ist abgeschlossen · {totalVoters} Teilnehmer
        </div>
      )}

      {hasVoted && !isClosed && (
        <p className="text-xs text-center text-gray-400">Sie haben bereits abgestimmt · {totalVoters} Teilnehmer</p>
      )}
    </div>
  )
}
