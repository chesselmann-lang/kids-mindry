import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import BefragungForm from './befragung-form'
import AiBefragung from './ai-befragung'
import { BarChart2 } from 'lucide-react'

export const metadata = { title: 'Umfrage' }

export default async function BefragungResponsePage({ params }: { params: { surveyId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { surveyId } = params
  const { data: survey } = await supabase
    .from('surveys').select('*').eq('id', surveyId).eq('is_active', true).single()
  if (!survey) notFound()

  // Check if already responded
  const { data: existing } = await supabase
    .from('survey_responses').select('id').eq('survey_id', surveyId).eq('user_id', user.id).single()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
          <BarChart2 size={20} className="text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{(survey as any).title}</h1>
          <p className="text-sm text-gray-400">Befragung</p>
        </div>
      </div>

      {(survey as any).description && (
        <div className="card p-4">
          <p className="text-sm text-gray-700">{(survey as any).description}</p>
        </div>
      )}

      <AiBefragung surveyId={surveyId} />

      {existing ? (
        <div className="card p-8 text-center">
          <BarChart2 size={32} className="text-violet-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">Danke für Ihre Teilnahme!</p>
          <p className="text-xs text-gray-400 mt-1">Sie haben an dieser Umfrage bereits teilgenommen.</p>
        </div>
      ) : (
        <BefragungForm surveyId={surveyId} respondentId={user.id} />
      )}
    </div>
  )
}
