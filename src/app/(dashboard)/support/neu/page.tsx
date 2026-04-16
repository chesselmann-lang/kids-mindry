import { redirect } from 'next/navigation'
import NewTicketForm from './new-ticket-form'
import AiSupportNeu from './ai-support-neu'

export const metadata = { title: 'Neue Supportanfrage' }

export default function NewTicketPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Neue Anfrage</h1>
        <p className="text-sm text-gray-500 mt-0.5">Wie können wir helfen?</p>
      </div>
      <AiSupportNeu />
      <NewTicketForm />
    </div>
  )
}
