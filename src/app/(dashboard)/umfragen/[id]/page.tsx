import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PollVote from './poll-vote'
import AiUmfragen from './ai-umfragen'

export default async function PollDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: poll } = await supabase
    .from('polls')
    .select('*')
    .eq('id', params.id)
    .eq('site_id', siteId)
    .single()

  if (!poll) notFound()

  // Get all votes for this poll
  const { data: allVotes } = await supabase
    .from('poll_votes')
    .select('option_indexes, user_id')
    .eq('poll_id', params.id)

  const votes = allVotes ?? []
  const totalVoters = votes.length

  // Get current user's vote
  const myVote = votes.find((v: any) => v.user_id === user.id)

  // Calculate option vote counts
  const options: string[] = (poll as any).options ?? []
  const optionCounts = options.map((_, idx) =>
    votes.filter((v: any) => v.option_indexes?.includes(idx)).length
  )

  const isClosed = (poll as any).closes_at && new Date((poll as any).closes_at) < new Date()

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/umfragen" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{(poll as any).title}</h1>
          {isClosed && <p className="text-xs text-gray-400 mt-0.5">Abgeschlossen · {totalVoters} Stimmen</p>}
        </div>
      </div>

      {(poll as any).description && (
        <p className="text-sm text-gray-600">{(poll as any).description}</p>
      )}

      <AiUmfragen pollId={params.id} />

      <PollVote
        pollId={params.id}
        options={options}
        optionCounts={optionCounts}
        totalVoters={totalVoters}
        myVote={myVote ? (myVote as any).option_indexes : null}
        multipleChoice={(poll as any).multiple_choice ?? false}
        isClosed={isClosed}
        userId={user.id}
      />
    </div>
  )
}
